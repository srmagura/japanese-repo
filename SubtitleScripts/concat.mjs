import fs from "fs";
import path from "path";

const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node concat.mjs <targetDir>");
  process.exit(1);
}

const srtFiles = fs
  .readdirSync(targetDir)
  .filter((file) => file.endsWith(".srt"))
  .sort();

const merged = srtFiles
  .map((file) => fs.readFileSync(path.join(targetDir, file), "utf-8").trimEnd())
  .join("\n\n");

fs.writeFileSync(path.join(targetDir, "merged.txt"), merged + "\n", "utf-8");

console.log(srtFiles.length);
