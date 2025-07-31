const express = require("express");
const axios = require("axios");
const detectVersion = require("./detectVersion");

const app = express();
const PORT = process.env.PORT || 3000;

let CNV_BASE = "https://cnvmp3.com/v28"; // fallback base

(async () => {
  try {
    CNV_BASE = await detectVersion();
    console.log(`✅ CNVMP3 version detected: ${CNV_BASE}`);
  } catch (err) {
    console.warn("⚠️ Failed to detect version, using fallback:", err.message);
  }
})();

const headers = {
  "Content-Type": "application/json",
  "Origin": "https://cnvmp3.com",
  "Referer": CNV_BASE,
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br"
};

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-\. ]/gi, "_");
}

async function getVideoMetadata(url) {
  const payload = { token: "1234", url };

  try {
    const response = await axios.post(`${CNV_BASE}get_video_data.php`, payload, {
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

async function getDownloadUrl(url) {
  const payload = {
    formatValue: 1,
    quality: 4,
    title: "",
    url
  };

  try {
    const response = await axios.post(`${CNV_BASE}download_video_ucep.php`, payload, {
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

app.get("/api/ytmp3", async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl) {
    return res.status(400).json({ success: false, message: "Missing 'url' query parameter." });
  }

  try {
    const title = await getVideoMetadata(youtubeUrl);
    const safeTitle = sanitizeFilename(title) || "ytmp3_download";

    const downloadUrl = await getDownloadUrl(youtubeUrl);

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
  console.log(`🎧 Server running at http://localhost:${PORT}`);
});
  
