// node fetch_frinkiac.cjs
// Searches Frinkiac using specific search_query for each unflagged entry
// Prefers frames from the matching episode, falls back to first result
// Writes updated frinkiac_mapping.json with image_url filled in

const fs = require("fs");
const https = require("https");

const mapping = JSON.parse(fs.readFileSync("./frinkiac_mapping.json", "utf8"));

function get(url) {
  return new Promise((resolve) => {
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
  const results = [...mapping];

  for (let i = 0; i < results.length; i++) {
    const entry = results[i];

    // Skip flagged, already-filled, or no search query
    if (entry.flag || entry.image_url || !entry.search_query) {
      const status = entry.image_url ? "KEEP " : entry.flag ? "FLAG " : "SKIP ";
      console.log(`${status} id ${entry.id} — ${entry.episode_code}`);
      continue;
    }

    const url = `https://frinkiac.com/api/search?q=${encodeURIComponent(entry.search_query)}`;
    const frames = await get(url);

    if (!frames || frames.length === 0) {
      console.log(`MISS  id ${entry.id} — "${entry.search_query}"`);
    } else {
      const best = frames.find(f => f.Episode === entry.episode_code) || frames[0];
      const imageUrl = `https://frinkiac.com/img/${best.Episode}/${best.Timestamp}.jpg`;
      const matched = best.Episode === entry.episode_code ? "✓" : "~";
      console.log(`${matched} OK  id ${entry.id} — ${best.Episode}/${best.Timestamp} (wanted ${entry.episode_code})`);
      results[i] = { ...entry, image_url: imageUrl };
    }

    await sleep(300);
  }

  fs.writeFileSync("./frinkiac_mapping.json", JSON.stringify(results, null, 2));
  console.log("\nDone. frinkiac_mapping.json updated.");

  const filled = results.filter(r => r.image_url).length;
  const flagged = results.filter(r => r.flag).length;
  const missed = results.filter(r => !r.flag && !r.image_url).length;
  console.log(`Filled: ${filled} | Flagged (manual): ${flagged} | Missed: ${missed}`);
}

main();
