---
title: Youtube To Mp3
emoji: 🚀
colorFrom: red
colorTo: yellow
sdk: gradio
sdk_version: 5.29.0
app_file: app.py
pinned: false
short_description: extraction in mp3 of the sound of any YouTube link
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference

# YouTube to MP3 Converter

This application allows you to download the audio from a YouTube video in MP3 format.

## Usage

1. Paste a YouTube video URL in the text field
2. Click "Submit"
3. Download the generated MP3 file

## Technologies Used

- Gradio for the user interface
- yt-dlp for downloading and converting YouTube videos
- ffmpeg for audio processing

## Important Note

This application is intended for educational purposes only and for downloading content that you own the rights to or that is under free license.

Due to YouTube restrictions, some videos requiring authentication cannot be downloaded in the Hugging Face Spaces environment. For full functionality, run this application locally or in Google Colab.
