const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return ((x + 0.05) / (y + 0.05)).toFixed(2); };
const rows = [
  ["чёрный на signal #F18F37", "#000000", "#F18F37"],
  ["белый на signal", "#ffffff", "#F18F37"],
  ["signal на чёрном", "#F18F37", "#000000"],
  ["signal-text #F5A21A на чёрном", "#F5A21A", "#000000"],
  ["bone на чёрном", "#F2EFE9", "#000000"],
  ["bone-dim на чёрном", "#A0A19D", "#000000"],
  ["bone-dim на ink-800", "#A0A19D", "#0e0f11"],
  ["bone-faint #8a8b87 на чёрном", "#8a8b87", "#000000"],
  ["bone-faint на ink-800", "#8a8b87", "#0e0f11"],
  ["bone-faint на ink-700", "#8a8b87", "#191a1d"],
  ["старый bone-faint #6b6d6a на ink-800", "#6b6d6a", "#0e0f11"],
  ["stock #A6C34F на чёрном", "#A6C34F", "#000000"],
  ["signal-hot #f5a04f: чёрный на нём", "#000000", "#f5a04f"],
];
for (const [n, f, b] of rows) console.log(cr(f, b).padStart(6) + " : 1   " + n);
