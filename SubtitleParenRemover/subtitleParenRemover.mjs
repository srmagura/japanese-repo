import fs from "fs";

const filePath =
  "E:/ETorrents/EAnime/Karakai Jouzu no Takagi-san S01-S03+OVA 1080p Dual Audio BDRip 10 bits DD x265-EMBER/Season 1/orig-S01E01-Eraser Day Duty Funny Face One Hundred Yen [0ECBB77B].srt";

const outFilePath =
  "E:/ETorrents/EAnime/Karakai Jouzu no Takagi-san S01-S03+OVA 1080p Dual Audio BDRip 10 bits DD x265-EMBER/Season 1/S01E01-Eraser Day Duty Funny Face One Hundred Yen [0ECBB77B].srt";

const parenPattern = /[（(][^）)]*[）)]/g;

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

fs.writeFileSync(outFilePath, output.join("\n"), "utf-8");
