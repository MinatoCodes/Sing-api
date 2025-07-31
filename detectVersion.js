// File: detectVersion.js
const axios = require("axios");

const BASE = "https://cnvmp3.com/";

module.exports = async function detectVersion() {
  for (let i = 35; i >= 20; i--) {
    const url = `${BASE}v${i}/get_video_data.php`;
    try {
      const res = await axios.post(url, {
        token: "1234",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }, {
        headers: {
          "Content-Type": "application/json",
          "Origin": BASE,
          "Referer": `${BASE}v${i}`,
          "User-Agent": "Mozilla/5.0"
        },
        timeout: 5000
      });

      if (res.data?.success) {
        return `${BASE}v${i}/`;
      }
    } catch (e) {
      continue; // skip failed versions
    }
  }

  throw new Error("No working version found for CNVMP3");
};
