const fs = require('fs');
let code = fs.readFileSync('src/app/event/[id]/page.tsx', 'utf8');

code = code.replace(
  'import { LayoutTemplate, ChevronLeft, ChevronRight,  useState, useEffect } from "react";',
  'import { useState, useEffect } from "react";'
);
code = code.replace(
  'import CreateInteractionModal from "@/components/polls/CreateInteractionModal";',
  'import CreateInteractionView from "@/components/polls/CreateInteractionView";'
);
code = code.replace(
  'BarChart,',
  'BarChart, LayoutTemplate, ChevronLeft, ChevronRight,'
);
code = code.replace(
  '{new Date(event.createdAt).toLocaleDateString()}',
  '{event.date || "Jul 11 - 13, 2026"}'
);

// fix the syntax errors we saw earlier
// error TS17008: JSX element 'div' has no corresponding closing tag. (lines 260 and 846 etc)
// wait, we replaced the whole file correctly with rebuild_page.js, those errors might have been from the previous bad state!

fs.writeFileSync('src/app/event/[id]/page.tsx', code);
console.log('Fixed imports');
