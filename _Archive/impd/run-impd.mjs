#!/usr/bin/env zx

const winAnimeRoot = "E:\\ETorrents\\EAnime";

// Define the base Windows folder path (backslashes are literal here)
const winBasePath = `${winAnimeRoot}\\[MTBB] Hibike! Euphonium (BD 1080p)`;

// Enumerate the mkv files in the Hibike! Euphonium directory
const linuxBasePath = (await $`wslpath -u ${winBasePath}`).stdout.trim();
const mkvFiles = (await fs.readdir(linuxBasePath)).filter((f) =>
  f.endsWith(".mkv"),
);
console.log(mkvFiles);

// Enumerate the ogg files in the Hibike! Euphonium directory
const oggFiles = (await fs.readdir(linuxBasePath)).filter((f) =>
  f.endsWith(".ogg"),
);
//console.log(oggFiles);

for (const mkvFile of mkvFiles) {
  const episodeName = mkvFile.slice(0, -".mkv".length);

  // Combine the base path with the specific filenames
  const winInput = `${winBasePath}\\${episodeName}.mkv`;
  const winSubs = `${winBasePath}\\${episodeName}.srt`;
  const winOutput = `${winBasePath}\\${episodeName}.ogg`;

  // Convert each Windows path to a WSL Linux path
  const linuxInput = (await $`wslpath -u ${winInput}`).stdout.trim();
  const linuxSubs = (await $`wslpath -u ${winSubs}`).stdout.trim();
  const linuxOutput = (await $`wslpath -u ${winOutput}`).stdout.trim();

  if (await fs.pathExists(linuxOutput)) {
    console.log(`Skipping ${episodeName}, output already exists`);
    continue;
  }

  // Execute the impd command
  const output =
    await $`impd condense -i ${linuxInput} -s ${linuxSubs} -o ${linuxOutput}`.nothrow();

  await fs.appendFile(
    "run-impd.log",
    output.stdout + output.stderr + "\n".repeat(10),
  );

  if (output.exitCode !== 0) {
    console.log(`impd condense failed for ${episodeName}`);
    break;
  }
}
