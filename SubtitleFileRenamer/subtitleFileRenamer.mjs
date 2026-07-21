import fs from "node:fs";
import path from "node:path";

const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node subtitleFileRenamer.mjs <targetDir>");
  process.exit(1);
}

const files = fs.readdirSync(targetDir).sort();

const mkvFiles = files.filter(
  (file) => path.extname(file).toLowerCase() === ".mkv",
);
const srtFiles = files.filter(
  (file) => path.extname(file).toLowerCase() === ".srt",
);

const count = Math.min(mkvFiles.length, srtFiles.length);

for (let i = 0; i < count; i++) {
  const mkvName = path.parse(mkvFiles[i]).name;
  const srtFile = srtFiles[i];
  const srtExt = path.extname(srtFile);
  const newSrtName = `${mkvName}${srtExt}`;

  if (srtFile === newSrtName) {
    continue;
  }

  fs.renameSync(
    path.join(targetDir, srtFile),
    path.join(targetDir, newSrtName),
  );
  console.log(`${srtFile}     ->     ${newSrtName}`);
}
