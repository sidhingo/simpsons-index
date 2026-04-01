// node clean_duplicates.cjs
// Removes duplicate predictions and fixes incorrect episode metadata
const fs = require("fs");

const data = JSON.parse(fs.readFileSync("./src/data/predictions.json", "utf8"));

// IDs to remove — duplicates with wrong episode codes or same scene as another entry
const REMOVE = new Set([
  36,  // Doughnut universe duplicate — wrong ep S10E22→correct, but id 67 is the keeper after fix
  43,  // Robot malfunction S06E04 — duplicate of id 63 (same episode, same scene, less specific)
  55,  // Rolling Stones — wrong episode S14E02, id 90 (S06E19) is correct
  60,  // Subliminal messaging — wrong episode S04E02, id 61 (S12E14) is correct
]);

// Fixes for surviving entries that have wrong metadata
const FIXES = {
  67: {
    episode_code: "S10E22",
    episode_title: "They Saved Lisa's Brain",
    season: 10,
    air_date: "1999-05-09",
    prediction_text: "A doughnut-shaped (torus) universe theory gains serious scientific attention.",
    notes: "Stephen Hawking tells Homer 'Your theory of a doughnut-shaped universe is intriguing — I may have to steal it.' Scene in Moe's tavern, S10E22. The torus universe model gained renewed mainstream scientific traction in Nature (2008) and subsequent cosmology papers.",
  },
};

let predictions = data.predictions
  .filter(p => !REMOVE.has(p.id))
  .map(p => {
    if (FIXES[p.id]) {
      return { ...p, ...FIXES[p.id] };
    }
    return p;
  });

fs.writeFileSync(
  "./src/data/predictions.json",
  JSON.stringify({ predictions }, null, 2)
);

console.log(`Done. ${predictions.length} predictions remaining.`);
console.log(`Removed ids: ${[...REMOVE].join(", ")}`);
console.log(`Fixed: id 67 → S10E22 They Saved Lisa's Brain`);
