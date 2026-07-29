import fs from "fs";
import path from "path";

const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node subtitleParenRemover.mjs <targetDir>");
  process.exit(1);
}

const parenPattern = /[（(][^）)]*[）)]/g;

const srtFiles = fs
  .readdirSync(targetDir)
  .filter((file) => file.endsWith(".srt"))
  .sort();

for (const file of srtFiles) {
  const filePath = path.join(targetDir, file);

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.replace(parenPattern, "").replace(/^[）)]+/, ""));

  const output = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    output.push(line);

    if (line.includes("-->")) {
      const nextLine = lines[i + 1];
      if (nextLine !== undefined && nextLine.trim() === "") {
        i++;
      }
    }
  }

  fs.writeFileSync(filePath, output.join("\n"), "utf-8");
}

console.log(srtFiles.length);
