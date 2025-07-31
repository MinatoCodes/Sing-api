const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Same headers for both calls
const headers = {
  "Content-Type": "application/json",
  "Origin": "https://cnvmp3.com",
  "Referer": "https://cnvmp3.com/v28",
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9,en-GB;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Cookie": "_ga=GA1.1.1209357655.1752724276; _ga_MF283RRQCW=GS2.1.8175273162.880380810Sh0",
  "Sec-Ch-Ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
  "Sec-Ch-Ua-Mobile": "?1",
  "Sec-Ch-Ua-Platform": "\"Android\"",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin"
};

// Helper to sanitize filenames (remove bad chars)
function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-\. ]/gi, "_");
}

// Get video metadata (title) from /get_video_data.php
async function getVideoMetadata(url) {
  const payload = { token: "1234", url };

  try {
    const response = await axios.post("https://cnvmp3.com/get_video_data.php", payload, {
      headers,
      timeout: 15000
    });

    if (response.data.success && response.data.title) {
      return response.data.title;
    } else {
      throw new Error("Failed to get video metadata or title missing");
    }
  } catch (error) {
    throw new Error(`getVideoMetadata error: ${error.message}`);
  }
}

// Get MP3 download link from /download_video_ucep.php
async function getDownloadUrl(url) {
  const payload = {
    formatValue: 1,
    quality: 4,
    title: "",
    url
  };

  try {
    const response = await axios.post("https://cnvmp3.com/download_video_ucep.php", payload, {
      headers,
      timeout: 15000
    });

    if (response.data.success && response.data.download_link) {
      return response.data.download_link;
    } else {
      throw new Error("Failed to get download link");
    }
  } catch (error) {
    throw new Error(`getDownloadUrl error: ${error.message}`);
  }
}

// Metadata endpoint
app.get("/api/ytmeta", async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl) {
    return res.status(400).json({ success: false, message: "Missing 'url' query parameter." });
  }

  try {
    const title = await getVideoMetadata(youtubeUrl);
    res.json({ success: true, title });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// MP3 download endpoint with dynamic filename from metadata
app.get("/api/ytmp3", async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl) {
    return res.status(400).json({ success: false, message: "Missing 'url' query parameter." });
  }

  try {
    // 1. Get video title for filename
    const title = await getVideoMetadata(youtubeUrl);
    const safeTitle = sanitizeFilename(title) || "ytmp3_download";

    // 2. Get download link
    const downloadUrl = await getDownloadUrl(youtubeUrl);

    // 3. Stream MP3 to user with download headers
    const response = await axios.get(downloadUrl, {
      headers: {
        "User-Agent": headers["User-Agent"],
        "Accept": "*/*",
        "Referer": "https://cnvmp3.com",
        "Origin": "https://cnvmp3.com"
      },
      responseType: "stream",
      timeout: 30000
    });

    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.mp3"`);
    res.setHeader("Content-Type", "audio/mpeg");

    response.data.pipe(res);
  } catch (error) {
    console.error("[API] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
  
