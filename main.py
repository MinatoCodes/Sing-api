from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
import subprocess
import os
import tempfile

app = FastAPI()

@app.get("/download")
def download_audio(url: str = Query(..., description="YouTube video URL")):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    # Create temp dir
    temp_dir = tempfile.mkdtemp()
    output_template = os.path.join(temp_dir, "%(title)s.%(ext)s")

    command = [
    "yt-dlp",
    "--cookies", "cookies.txt",  # use your exported cookies file
    "-x", "--audio-format", "mp3", "--audio-quality", "0",
    "-o", output_template,
    url
]


    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        if process.returncode != 0:
            error_output = stderr.decode('utf-8', errors='ignore')
            raise HTTPException(status_code=500, detail=f"yt-dlp error: {error_output}")

        # Find mp3 file
        for file in os.listdir(temp_dir):
            if file.endswith(".mp3"):
                file_path = os.path.join(temp_dir, file)
                return FileResponse(path=file_path, filename=file, media_type="audio/mpeg")

        raise HTTPException(status_code=500, detail="MP3 file not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
                                   
