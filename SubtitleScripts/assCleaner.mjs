import fs from "fs";
import path from "path";

const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node assCleaner.mjs <targetDir>");
  process.exit(1);
}

const parenPattern = /[（(][^）)]*[）)]/g;

// A Dialogue line whose text field is nothing but right parens, e.g.
// "Dialogue: 0,0:00:57.79,0:01:00.49,Default#1,,0,0,0,,)"
function isDanglingParenLine(line) {
  if (!line.startsWith("Dialogue:")) return false;

  const fields = line.split(",");
  if (fields.length < 10) return false;

  return /^[）)]+\s*$/.test(fields.slice(9).join(","));
}

const assFiles = fs
  .readdirSync(targetDir)
  .filter((file) => file.endsWith(".ass"))
  .sort();

for (const file of assFiles) {
  const filePath = path.join(targetDir, file);

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content
    .replace(/[➡≪≫＜＞]/g, "")
    .split(/\r?\n/)
    .map((line) => line.replace(parenPattern, ""))
    .filter((line) => !/♬～\s*$/.test(line) && !isDanglingParenLine(line));

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
}

console.log(assFiles.length);
