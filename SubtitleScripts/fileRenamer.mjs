import fs from "node:fs";
import path from "node:path";

const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node fileRenamer.mjs <targetDir>");
  process.exit(1);
}

const files = fs.readdirSync(targetDir).sort();

const mkvFiles = files.filter(
  (file) => path.extname(file).toLowerCase() === ".mkv",
);
const srtFiles = files.filter(
  (file) => path.extname(file).toLowerCase() === ".srt",
);
const assFiles = files.filter(
  (file) => path.extname(file).toLowerCase() === ".ass",
);

function renameSubtitles(subtitleFiles) {
  const count = Math.min(mkvFiles.length, subtitleFiles.length);

  for (let i = 0; i < count; i++) {
    const mkvName = path.parse(mkvFiles[i]).name;
    const subtitleFile = subtitleFiles[i];
    const subtitleExt = path.extname(subtitleFile);
    const newSubtitleName = `${mkvName}${subtitleExt}`;

    if (subtitleFile === newSubtitleName) {
      continue;
    }

    fs.renameSync(
      path.join(targetDir, subtitleFile),
      path.join(targetDir, newSubtitleName),
    );
    console.log(`${subtitleFile}     ->     ${newSubtitleName}`);
  }
}

renameSubtitles(srtFiles);
renameSubtitles(assFiles);
