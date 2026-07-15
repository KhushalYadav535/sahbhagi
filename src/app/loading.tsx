export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[100]">
      <div className="relative flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
      <h2 className="mt-6 text-xl font-extrabold text-slate-800 tracking-tight">Sahbhagi</h2>
      <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
        Powered by Datatrack
      </p>
    </div>
  );
}
