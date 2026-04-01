// node merge_frinkiac.cjs
// Reads frinkiac_mapping.json and patches image_url into predictions.json
// Only updates entries that have an image_url in the mapping

const fs = require("fs");

const predictions = JSON.parse(
  fs.readFileSync("./src/data/predictions.json", "utf8")
).predictions;

const mapping = JSON.parse(fs.readFileSync("./frinkiac_mapping.json", "utf8"));

const urlMap = {};
for (const entry of mapping) {
  if (entry.image_url) urlMap[entry.id] = entry.image_url;
}

let updated = 0;
const patched = predictions.map(p => {
  if (urlMap[p.id]) {
    updated++;
    return { ...p, image_url: urlMap[p.id] };
  }
  return p;
});

fs.writeFileSync(
  "./src/data/predictions.json",
  JSON.stringify({ predictions: patched }, null, 2)
);

console.log(`Done. ${updated} predictions updated with image URLs.`);
console.log(`${patched.length - updated} still have no image (placeholder will show).`);
