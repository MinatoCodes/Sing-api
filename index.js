const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const headers = {
  "Content-Type": "application/json",
  "Origin": "https://cnvmp3.com",
  "Referer": "https://cnvmp3.com/v25",
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9,en-GB;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Ch-Ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
  "Sec-Ch-Ua-Mobile": "?1",
  "Sec-Ch-Ua-Platform": "\"Android\"",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin"
};

async function getDownloadUrl(youtubeUrl) {
  const payload = {
    formatValue: 1,
    quality: 4,
    title: "",
    url: youtubeUrl
  };

  try {
    const response = await axios.post("https://cnvmp3.com/download_video_ucep.php", payload, {
      headers,
      timeout: 15000
    });

    if (response.data.success && response.data.download_link) {
      return response.data.download_link;
    } else {
      throw new Error("API responded but no download_link found");
    }
  } catch (error) {
    console.error("[getDownloadUrl] Error:", error.message);
    throw error;
  }
}

function extractVideoId(url) {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

app.get("/api/ytmp3", async (req, res) => {
  const youtubeUrl = req.query.url;
  if (!youtubeUrl) {
    return res.status(400).json({
      success: false,
      author: "MinatoCodes",
      message: "Missing 'url' parameter"
    });
  }

  try {
    const downloadLink = await getDownloadUrl(youtubeUrl);
    const videoId = extractVideoId(youtubeUrl);

    res.json({
      success: true,
      author: "MinatoCodes",
      yt_link: youtubeUrl,
      vid_id: videoId,
      download_link: downloadLink
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      author: "MinatoCodes",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
