from fastapi import FastAPI, Query
from fastapi.responses import FileResponse, JSONResponse
import subprocess
import os
import tempfile

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "API is running"}

@app.get("/download")
async def download(url: str = Query(...)):
    temp_dir = tempfile.mkdtemp()

    output_template = os.path.join(temp_dir, "%(title)s.%(ext)s")

    command = [
        "yt-dlp",
        "--cookies", "cookies.txt",
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "-x", "--audio-format", "mp3",
        "-o", output_template,
        url
    ]

    try:
        process = subprocess.run(command, capture_output=True, text=True)
        if process.returncode != 0:
            return JSONResponse(status_code=500, content={"detail": f"yt-dlp error: {process.stderr}"})

        # Find the downloaded file
        for file in os.listdir(temp_dir):
            if file.endswith(".mp3"):
                mp3_path = os.path.join(temp_dir, file)
                return FileResponse(mp3_path, media_type='audio/mpeg', filename=file)

        return JSONResponse(status_code=500, content={"detail": "Download succeeded but MP3 not found"})

    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})
    
