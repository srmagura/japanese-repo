#!/usr/bin/env zsh

# Define the base Windows folder path using single quotes to preserve backslashes
win_base_path='E:\ETorrents\EAnime\[MTBB] Hibike! Euphonium (BD 1080p)'

episode_name='[MTBB] Hibike! Euphonium - 02 [7F4B0ABE]'

# Combine the base path with the specific filenames using double quotes
# This allows $win_base_path to expand while treating the rest as a literal string
win_input="${win_base_path}\\${episode_name}.mkv"
win_subs="${win_base_path}\\${episode_name}.srt"
win_output="${win_base_path}\\${episode_name}.ogg"

# Convert each Windows path to a WSL Linux path and store in variables
# (Double quotes here ensure the variables expand correctly inside wslpath)
linux_input=$(wslpath -u "$win_input")
linux_subs=$(wslpath -u "$win_subs")
linux_output=$(wslpath -u "$win_output")

# Execute the impd command
impd condense -i "$linux_input" -s "$linux_subs" -o "$linux_output"