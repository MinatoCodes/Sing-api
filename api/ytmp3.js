const express = require("express");
const { youtube } = require("btch-downloader");

const app = express();

app.get("/api/ytmp3", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url parameter" });

  try {
    const data = await youtube(url);

    // Respond only with mp3 info
    res.json({
      developer: "@prm2.0",
      title: data.title,
      thumbnail: data.thumbnail,
      author: data.channel,   // sometimes author field is `channel`
      mp3: data.mp3,          // btch-downloader gives mp3 directly
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch mp3" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ MP3 API running on ${PORT}`));
