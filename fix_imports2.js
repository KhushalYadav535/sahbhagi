const fs = require('fs');
let code = fs.readFileSync('src/app/event/[id]/page.tsx', 'utf8');

code = code.replace(
  'import { Eye, Lock, List, Cloud, AlignLeft, ListOrdered, Star, Trophy, MoreVertical,  useState, useEffect } from "react";',
  'import { useState, useEffect } from "react";'
);
code = code.replace(
  'import { MoreHorizontal } from "lucide-react";',
  'import { MoreHorizontal, Eye, Lock, List, Cloud, AlignLeft, ListOrdered, Star, Trophy, MoreVertical } from "lucide-react";'
);

fs.writeFileSync('src/app/event/[id]/page.tsx', code);
console.log('Fixed imports again');
