import fs from "fs";
import path from "path";

const TARGET_DIR =
  "E:/ETorrents/EAnime/Karakai Jouzu no Takagi-san S01-S03+OVA 1080p Dual Audio BDRip 10 bits DD x265-EMBER/Season 1";

const parenPattern = /[（(][^）)]*[）)]/g;

const srtFiles = fs
  .readdirSync(TARGET_DIR)
  .filter((file) => file.endsWith(".srt"))
  .sort();

for (const file of srtFiles) {
  const filePath = path.join(TARGET_DIR, file);

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
