#!/usr/bin/env zx
// Run with `zx subtitleSyncer.mjs <targetDir>` — $, argv, chalk, fs and path
// come from zx's globals, so nothing is imported (zx is installed globally).

// To restore the originals:
//
// Move-Item .\orig\*.srt . -Force

usePwsh();

const targetDir = argv._[0];

if (!targetDir) {
  console.error("Usage: zx subtitleSyncer.mjs <targetDir>");
  process.exit(1);
}

const videoExtensions = [".mkv"];

// Originals keep their .srt name and move here — mpv does not scan
// subdirectories, so it only ever auto-loads the synced subtitles.
const origDir = path.join(targetDir, "orig");

const entries = fs.readdirSync(targetDir);

const srtFiles = entries.filter((file) => file.endsWith(".srt")).sort();

const videoFiles = entries.filter((file) =>
  videoExtensions.includes(path.extname(file).toLowerCase()),
);

// A subtitle matches a video when its name (minus .srt and any language tag
// like ".ja") is the video's name minus its extension.
function findVideo(srtFile) {
  const base = path.basename(srtFile, ".srt");

  return videoFiles.find((video) => {
    const videoBase = path.basename(video, path.extname(video));
    return base === videoBase || base.startsWith(videoBase + ".");
  });
}

// Back up every original before syncing, so the synced output can take over the
// .srt name that mpv auto-loads.
fs.mkdirSync(origDir, { recursive: true });

for (const srtFile of srtFiles) {
  fs.renameSync(path.join(targetDir, srtFile), path.join(origDir, srtFile));
}

let synced = 0;

for (const srtFile of srtFiles) {
  const video = findVideo(srtFile);

  if (!video) {
    console.log(chalk.yellow(`No video found for ${srtFile}`));
    continue;
  }

  const videoPath = path.join(targetDir, video);
  const origPath = path.join(origDir, srtFile);
  const outPath = path.join(targetDir, srtFile);

  console.log(chalk.cyan(`Syncing ${srtFile}`));

  try {
    await $`ffs ${videoPath} -i ${origPath} -o ${outPath}`;
    synced++;
  } catch (error) {
    console.log(
      chalk.red(`Failed to sync ${srtFile} (exit ${error.exitCode})`),
    );
    console.log(chalk.red(error));
    process.exit(1);
  }
}

console.log(`${synced}/${srtFiles.length}`);
