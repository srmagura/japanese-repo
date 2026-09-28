#!/usr/bin/env zx
// Run with `zx subs.mjs <targetDir>` — renames the subtitles to match the
// videos, then strips parentheticals from the .srt files.

usePwsh();

const targetDir = argv._[0];

if (!targetDir) {
  console.error("Usage: zx subs.mjs <targetDir>");
  process.exit(1);
}

const scriptDir = import.meta.dirname;

for (const script of ["fileRenamer.mjs", "parenRemover.mjs"]) {
  console.log(chalk.cyan(`Running ${script}`));

  try {
    await $({ stdio: "inherit" })`node ${path.join(scriptDir, script)} ${targetDir}`;
  } catch (error) {
    console.log(chalk.red(`${script} failed (exit ${error.exitCode})`));
    process.exit(1);
  }
}
