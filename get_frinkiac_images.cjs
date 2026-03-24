// Run this once from your Simpsons project folder:
// node get_frinkiac_images.js
//
// It reads your predictions.json, fetches the best Frinkiac image URL
// for every S1-S17 prediction, and writes image_urls.json with the results.
// Then you copy the image_url values into predictions.json.

const fs = require("fs");
const https = require("https");

const data = JSON.parse(fs.readFileSync("./src/data/predictions.json", "utf8"));
const predictions = data.predictions;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve([]); }
      });
    }).on("error", () => resolve([]));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const results = [];

  for (const p of predictions) {
    const match = p.episode_code?.match(/S(\d+)E/);
    const season = match ? parseInt(match[1]) : 99;

    if (season > 17) {
      console.log(`SKIP  ${p.episode_code} (S${season}, no Frinkiac coverage) — id ${p.id}`);
      results.push({ id: p.id, episode_code: p.episode_code, image_url: null });
      continue;
    }

    // Use first 5 words of prediction text as search query
    const query = p.prediction_text
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .slice(0, 5)
      .join(" ");

    const url = `https://frinkiac.com/api/search?q=${encodeURIComponent(query)}`;
    const frames = await get(url);

    if (!frames || frames.length === 0) {
      console.log(`MISS  ${p.episode_code} — "${query}" — id ${p.id}`);
      results.push({ id: p.id, episode_code: p.episode_code, image_url: null });
    } else {
      // Prefer a frame from the matching episode, else use first result
      const best =
        frames.find((f) => f.Episode === p.episode_code) || frames[0];
      const imageUrl = `https://frinkiac.com/img/${best.Episode}/${best.Timestamp}.jpg`;
      console.log(`OK    ${p.episode_code} → ${best.Episode}/${best.Timestamp} — id ${p.id}`);
      results.push({ id: p.id, episode_code: p.episode_code, image_url: imageUrl });
    }

    // Be polite — don't hammer Frinkiac
    await sleep(300);
  }

  fs.writeFileSync("./image_urls.json", JSON.stringify(results, null, 2));
  console.log("\nDone. Results written to image_urls.json");
  console.log(`Total: ${results.length} | With image: ${results.filter(r => r.image_url).length} | Without: ${results.filter(r => !r.image_url).length}`);
}

main();
