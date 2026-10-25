// Convertit un texte de post ou **les passages entre doubles etoiles** passent en "gras" Unicode
// (LinkedIn n'a pas de gras natif). A doser : les lecteurs d'ecran lisent mal ces caracteres.
// Usage : node tools/bold.js source.txt sortie.txt
const fs = require('fs');

function toBold(s) {
  return [...s].map((c) => {
    const n = c.codePointAt(0);
    if (n >= 65 && n <= 90) return String.fromCodePoint(0x1d5d4 + n - 65);   // A-Z -> sans-serif gras
    if (n >= 97 && n <= 122) return String.fromCodePoint(0x1d5ee + n - 97);  // a-z
    if (n >= 48 && n <= 57) return String.fromCodePoint(0x1d7ec + n - 48);   // 0-9
    return c; // accents, ponctuation : inchanges
  }).join('');
}

const [src, out] = process.argv.slice(2);
const text = fs.readFileSync(src, 'utf8').replace(/\*\*(.+?)\*\*/g, (_, s) => toBold(s));
fs.writeFileSync(out, text);
console.log(`${out} : ${[...text].length} caracteres`);
