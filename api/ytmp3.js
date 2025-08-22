const express = require("express");
const { youtube } = require("btch-downloader");

const app = express();

app.get("/api/ytmp3", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: "Missing url parameter" });

  try {
    const data = await youtube(url);

    res.json({
      success: true,
      creator: "Minato",
      download_url: data.mp3   // only mp3 link returned
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch mp3" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ MP3 API running on ${PORT}`));
           
