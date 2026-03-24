// Run from your Simpsons project root:
// node merge_images.cjs

const fs = require("fs");

const predictions = JSON.parse(
  fs.readFileSync("./src/data/predictions.json", "utf8")
).predictions;

const imageUrls = JSON.parse(
  fs.readFileSync("./image_urls.json", "utf8")
);

// Only keep URLs where the Frinkiac episode matches the prediction episode
// If mismatched, set to null — app will show placeholder
const urlMap = {};
for (const entry of imageUrls) {
  if (!entry.image_url) {
    urlMap[entry.id] = null;
    continue;
  }
  // Extract episode from the Frinkiac URL e.g. https://frinkiac.com/img/S11E17/927160.jpg
  const frinkiacEpisode = entry.image_url.split("/img/")[1]?.split("/")[0];
  if (frinkiacEpisode === entry.episode_code) {
    urlMap[entry.id] = entry.image_url;
  } else {
    urlMap[entry.id] = null;
  }
}

// Patch predictions
const patched = predictions.map(p => ({
  ...p,
  image_url: urlMap[p.id] ?? null,
}));

const output = JSON.stringify({ predictions: patched }, null, 2);
fs.writeFileSync("./src/data/predictions.json", output);

const withImage = patched.filter(p => p.image_url).length;
console.log(`Done. ${withImage} predictions have matched images, ${patched.length - withImage} will show placeholder.`);
