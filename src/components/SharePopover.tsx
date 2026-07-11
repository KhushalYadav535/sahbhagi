"use client";

import React, { useState } from "react";
import { Link as LinkIcon, QrCode, Copy, Download, Settings, X } from "lucide-react";
import toast from "react-hot-toast";

interface SharePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  eventCode: string;
}

export default function SharePopover({ isOpen, onClose, eventCode }: SharePopoverProps) {
  const [activeTab, setActiveTab] = useState<"participants" | "collaborate">("participants");

  if (!isOpen) return null;

  const joinLink = `${window.location.origin}/join?code=${eventCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinLink)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      toast.success("Joining link copied!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleCopyQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast.success("QR code copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Could not copy QR image (browser may not support it)");
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sahbhagi-qr-${eventCode}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("QR code downloaded!");
    } catch (err) {
      toast.error("Failed to download QR code");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 flex justify-end">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("participants")}
            className={`pb-4 px-2 font-semibold text-sm mr-8 transition-colors ${
              activeTab === "participants"
                ? "text-green-700 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Share with participants
          </button>
          <button
            onClick={() => setActiveTab("collaborate")}
            className={`pb-4 px-2 font-semibold text-sm transition-colors ${
              activeTab === "collaborate"
                ? "text-green-700 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Collaborate
          </button>
        </div>

        <div className="p-8 space-y-8">
          {activeTab === "participants" ? (
            <>
              {/* Joining Link Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-700 font-semibold">
                  <LinkIcon size={20} className="text-gray-500" />
                  Joining link
                </div>
                <button 
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                >
                  <Copy size={16} />
                  Copy joining link
                </button>
              </div>

              {/* QR Code Section */}
              <div className="flex items-start justify-between pt-6 border-t border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-700 font-semibold">
                    <QrCode size={20} className="text-gray-500" />
                    QR code
                  </div>
                  <div className="bg-white p-2 border border-gray-200 rounded-xl inline-block shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-8">
                  <button 
                    onClick={handleCopyQR}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    <Copy size={16} />
                    Copy QR code
                  </button>
                  <button 
                    onClick={handleDownloadQR}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    <Download size={16} />
                    Download QR code
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-500">
              Collaboration features coming soon!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
            <Settings size={16} />
            Privacy settings
          </button>
        </div>
      </div>
    </div>
  );
}
