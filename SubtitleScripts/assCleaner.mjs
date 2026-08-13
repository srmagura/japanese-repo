import fs from "fs";
import path from "path";

const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node assCleaner.mjs <targetDir>");
  process.exit(1);
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
    .filter((line) => !/♬～\s*$/.test(line));

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
}

console.log(assFiles.length);
