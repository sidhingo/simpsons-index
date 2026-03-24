// node clean_predictions.cjs
const fs = require("fs");

const data = JSON.parse(fs.readFileSync("./src/data/predictions.json", "utf8"));

// IDs to remove — duplicates and misattributed entries
const REMOVE = new Set([1, 38, 45, 64, 69, 70, 71, 80, 87]);

// Episode code fixes
const FIX_EPISODE = {
  35: { code: "S04E16", title: "Whacking Day" },
};

let predictions = data.predictions
  .filter(p => !REMOVE.has(p.id))
  .map(p => {
    if (FIX_EPISODE[p.id]) {
      return {
        ...p,
        episode_code: FIX_EPISODE[p.id].code,
        episode_title: FIX_EPISODE[p.id].title,
      };
    }
    return p;
  });

fs.writeFileSync(
  "./src/data/predictions.json",
  JSON.stringify({ predictions }, null, 2)
);

console.log(`Done. ${predictions.length} predictions remaining.`);
console.log(`Removed: ${[...REMOVE].join(", ")}`);
console.log(`Fixed episode codes: id 35 → S04E16 Whacking Day`);
