// Доводит `next build` (output: "export") до вида, который отдаёт GitHub Pages.
// 1. Next 16 кладёт сегменты предзагрузки в папки (`__next.$d$locale/__PAGE__.txt`),
//    а клиент запрашивает плоское имя (`__next.$d$locale.__PAGE__.txt`) — копируем в плоское.
// 2. Корень без локали: redirects() в статике не работают, index.html отправляет на ./ua/.
// 3. .nojekyll, чтобы Pages не прятал папку _next.
import fs from "node:fs";
import path from "node:path";

const out = path.resolve(process.argv[2] ?? "out");
let copied = 0;

function flatten(dir, prefix, target) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = `${prefix}.${entry.name}`;
    const from = path.join(dir, entry.name);
    if (entry.isDirectory()) flatten(from, name, target);
    else if (!fs.existsSync(path.join(target, name))) {
      fs.copyFileSync(from, path.join(target, name));
      copied++;
    }
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) flatten(full, entry.name, dir);
    else if (entry.name !== "_next") walk(full);
  }
}

walk(out);
fs.writeFileSync(
  path.join(out, "index.html"),
  '<!doctype html><meta charset="utf-8"><title>PROFITOOL</title>' +
    '<link rel="icon" href="./brand/logo.svg" type="image/svg+xml">' +
    '<meta http-equiv="refresh" content="0; url=./ua/"><a href="./ua/">PROFITOOL</a>\n',
);
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log(`postexport: ${copied} segment files flattened, index.html and .nojekyll written`);
