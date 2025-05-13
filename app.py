import gradio as gr
import subprocess
import os
import tempfile
import re

def download_youtube_mp3(video_url):
    """
    Downloads the audio from a YouTube video in MP3 format using yt-dlp.

    Args:
        video_url (str): The YouTube video URL.

    Returns:
        tuple: (status, result) where status is a boolean indicating success and result is either the MP3 file path or an error message
    """
    try:
        # Create a temporary directory for the download
        temp_dir = tempfile.mkdtemp()

        # Options for yt-dlp
        output_filename_template = os.path.join(temp_dir, "%(title)s.%(ext)s")

        command = [
            "yt-dlp",
            "-x",  # Extract audio
            "--audio-format", "mp3",
            "--audio-quality", "0", # 0 for best VBR quality
            "-o", output_filename_template,
            video_url
        ]

        # Execute the command
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            # Find the MP3 file in the temporary directory
            for file in os.listdir(temp_dir):
                if file.endswith(".mp3"):
                    mp3_path = os.path.join(temp_dir, file)
                    return True, mp3_path
            return False, "Error: MP3 file not found after conversion"
        else:
            error_output = stderr.decode('utf-8', errors='ignore')

            # Check if it's a YouTube authentication error
            if "Sign in to confirm you're not a bot" in error_output or "cookies" in error_output:
                return False, "YouTube requires authentication for this video. This app cannot download videos that require login. Try another video or use the app locally."

            return False, f"Download error: {error_output}"

    except Exception as e:
        return False, f"An error occurred: {str(e)}"

# Gradio Interface
def youtube_to_mp3(youtube_url):
    if not youtube_url:
        return "Please enter a valid YouTube URL"

    # Check if the URL is valid
    if not re.match(r'^(https?://)?(www\.)?(youtube\.com|youtu\.?be)/.+$', youtube_url):
        return "Invalid YouTube URL. Please enter a URL in the format https://www.youtube.com/watch?v=..."

    success, result = download_youtube_mp3(youtube_url)

    if success and os.path.isfile(result):
        return result
    else:
        return result  # This is an error message

# Create the interface
demo = gr.Interface(
    fn=youtube_to_mp3,
    inputs=gr.Textbox(label="YouTube Video URL", placeholder="https://www.youtube.com/watch?v=..."),
    outputs=gr.Textbox(label="Result"),
    title="YouTube to MP3 Converter",
    description="""Download the audio from a YouTube video in MP3 format.

**Important note**: Due to YouTube restrictions, some videos requiring authentication cannot be downloaded in this Hugging Face Spaces environment. For full functionality, run this application locally or in [Google Colab](https://github.com/piegu/language-models/blob/master/youtube_video_to_audio.ipynb).""",
    examples=[["https://www.youtube.com/watch?v=jNQXAC9IVRw"]]  # First YouTube video (Me at the zoo)
)

if __name__ == "__main__":
    # Specific parameters for Hugging Face Spaces
    demo.launch(server_name="0.0.0.0", 
                server_port=7860, 
                share=False,
                ssr_mode=False)
