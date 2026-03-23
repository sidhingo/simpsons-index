import { useState, useMemo } from "react";

const PREDICTIONS = [
  { id: 1, episode_code: "S11E17", episode_title: "Bart to the Future", season: 11, air_date: "2000-03-19", prediction_text: "Donald Trump becomes President, leaving a massive budget deficit for his successor", category: "politics", specificity_score: 5, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Donald Trump elected 45th President in 2016, re-elected in 2024", years_lead: 16, notes: "Writer Dan Greaney confirmed intent was satirical — written during Trump's 2000 Reform Party exploratory run." },
  { id: 2, episode_code: "S10E05", episode_title: "When You Dish Upon a Star", season: 10, air_date: "1998-11-08", prediction_text: "Disney acquires 20th Century Fox", category: "business", specificity_score: 5, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Disney completed $71B acquisition of 21st Century Fox assets in 2019", years_lead: 21, notes: "A sign reading '20th Century Fox, a Division of Walt Disney Co.' appears as a background gag." },
  { id: 3, episode_code: "S05E10", episode_title: "$pringfield", season: 5, air_date: "1993-12-16", prediction_text: "Siegfried and Roy are attacked by their white tiger during a live performance", category: "entertainment", specificity_score: 4, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Roy Horn mauled by white Bengal tiger on stage in October 2003", years_lead: 10, notes: "The show's parody duo Gunter and Ernst are attacked during their act — mirrors the real 2003 incident almost exactly." },
  { id: 4, episode_code: "S06E19", episode_title: "Lisa's Wedding", season: 6, air_date: "1995-03-19", prediction_text: "Smartwatches with screens become mainstream", category: "technology", specificity_score: 3, predicted_timeframe: "2010", outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Apple Watch launched 2014; Samsung Gear in 2013", years_lead: 19, notes: "Show predicted 2010; actual smartwatches arrived 2013-2014. Close but not exact on timeline." },
  { id: 5, episode_code: "S06E19", episode_title: "Lisa's Wedding", season: 6, air_date: "1995-03-19", prediction_text: "Video calling becomes standard communication", category: "technology", specificity_score: 3, predicted_timeframe: "2010", outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Apple FaceTime launched 2010, exactly as predicted", years_lead: 15, notes: "The 2010 timeframe was actually correct for FaceTime." },
  { id: 6, episode_code: "S03E12", episode_title: "Lisa the Greek", season: 3, air_date: "1992-01-23", prediction_text: "Washington Redskins win Super Bowl XXVI", category: "sports", specificity_score: 5, predicted_timeframe: "1992", outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Washington Redskins defeated Buffalo Bills in Super Bowl XXVI, January 1992", years_lead: 0, notes: "Episode aired days before the game. Reruns re-dubbed with correct teams each year — Dallas Cowboys 1993, also correct." },
  { id: 7, episode_code: "S25E10", episode_title: "You Don't Have to Live Like a Referee", season: 25, air_date: "2014-03-23", prediction_text: "FIFA officials arrested on corruption and bribery charges", category: "sports", specificity_score: 4, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "14 FIFA officials indicted by U.S. Dept of Justice in May 2015", years_lead: 1, notes: "Same episode also correctly predicted Germany defeating Brazil in the 2014 World Cup." },
  { id: 8, episode_code: "S25E10", episode_title: "You Don't Have to Live Like a Referee", season: 25, air_date: "2014-03-23", prediction_text: "Germany defeats Brazil in the World Cup", category: "sports", specificity_score: 4, predicted_timeframe: "2014", outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Germany defeated Brazil 7-1 in 2014 World Cup semi-final", years_lead: 0, notes: "Same episode that predicted the FIFA scandal." },
  { id: 9, episode_code: "S22E01", episode_title: "Elementary School Musical", season: 22, air_date: "2010-09-26", prediction_text: "Bengt Holmström wins the Nobel Prize in Economics", category: "science", specificity_score: 5, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Holmström won Nobel Memorial Prize in Economic Sciences in 2016", years_lead: 6, notes: "Named by name on a betting card. One of the most specific predictions in the dataset." },
  { id: 10, episode_code: "S10E19", episode_title: "Mom and Pop Art", season: 10, air_date: "1999-04-11", prediction_text: "U.S. Olympic curling team beats Sweden to win gold", category: "sports", specificity_score: 5, predicted_timeframe: "2010", outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "U.S. men's curling team defeated Sweden 10-7 at 2018 Winter Olympics", years_lead: 8, notes: "Got the exact opponent AND the upset result correct. Highest-specificity hit in the dataset." },
  { id: 11, episode_code: "S04E21", episode_title: "Marge in Chains", season: 4, air_date: "1993-05-06", prediction_text: "A viral illness from east Asia spreads globally, causing mass panic", category: "health", specificity_score: 3, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "medium", actual_event: "COVID-19 pandemic originated in Wuhan, China in 2019-2020", years_lead: 27, notes: "Writer Bill Oakley said the comparison is coincidental — flu pandemics from Asia are a recurring historical pattern." },
  { id: 12, episode_code: "S10E22", episode_title: "The Wizard of Evergreen Terrace", season: 10, air_date: "1998-09-20", prediction_text: "Homer's equation approximates the mass of the Higgs boson particle", category: "science", specificity_score: 4, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Higgs boson confirmed by CERN in 2012", years_lead: 14, notes: "Dr. Simon Singh verified the equation. Writer David X. Cohen had a physics background." },
  { id: 13, episode_code: "S07E24", episode_title: "Homerpalooza", season: 7, air_date: "1996-05-19", prediction_text: "Cypress Hill performs with the London Symphony Orchestra", category: "entertainment", specificity_score: 5, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "Cypress Hill performed with the LSO at Royal Albert Hall, July 10, 2024", years_lead: 28, notes: "The joke was that someone ordered the LSO 'possibly while high.' The real performance actually happened." },
  { id: 14, episode_code: "S15E14", episode_title: "The Ziff Who Came to Dinner", season: 15, air_date: "2004-03-14", prediction_text: "A fourth Matrix film is released around Christmas", category: "entertainment", specificity_score: 4, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "The Matrix Resurrections released December 22, 2021", years_lead: 17, notes: "Poster for 'Matrix 4' shown in background. Released Christmas week exactly as the gag implied." },
  { id: 15, episode_code: "S27E17", episode_title: "The Marge-ian Chronicles", season: 27, air_date: "2016-03-13", prediction_text: "A private company attempts Mars colonization, targeting 2026", category: "science", specificity_score: 4, predicted_timeframe: "2026", outcome: "false", verified: true, debunked: false, confidence: "medium", actual_event: "SpaceX pushed Mars colonization to 2028+. No human mission yet.", years_lead: null, notes: "The 2026 date was not met. Direction is right, timing is off. Parody of Mars One, which went bankrupt." },
  { id: 16, episode_code: "S23E12", episode_title: "Them, Robot", season: 23, air_date: "2012-03-18", prediction_text: "AI and automation replace large portions of the human workforce", category: "technology", specificity_score: 3, predicted_timeframe: null, outcome: "pending", verified: true, debunked: false, confidence: "medium", actual_event: "Ongoing — AI job displacement accelerating 2024-2026", years_lead: null, notes: "Mr. Burns replaces plant workers with robots. US Senate report suggests AI could displace ~100M jobs over next decade." },
  { id: 17, episode_code: "S11E17", episode_title: "Bart to the Future", season: 11, air_date: "2000-03-19", prediction_text: "The first female President of the United States", category: "politics", specificity_score: 3, predicted_timeframe: null, outcome: "pending", verified: true, debunked: false, confidence: "medium", actual_event: null, years_lead: null, notes: "Lisa becomes president in the episode. The Trump part came true; the female president part has not yet." },
  { id: 18, episode_code: "S08E10", episode_title: "The Springfield Files", season: 8, air_date: "1997-01-12", prediction_text: "U.S. government officially acknowledges the existence of extraterrestrial life", category: "science", specificity_score: 2, predicted_timeframe: null, outcome: "pending", verified: true, debunked: false, confidence: "low", actual_event: null, years_lead: null, notes: "Fans in early 2026 began speculating this could happen as UAP congressional hearings continued." },
  { id: 19, episode_code: "S11E05", episode_title: "E-I-E-I-(Annoyed Grunt)", season: 11, air_date: "1999-11-07", prediction_text: "A real minor league baseball team called the Albuquerque Isotopes is established", category: "sports", specificity_score: 5, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "high", actual_event: "The Albuquerque Isotopes officially adopted the name in 2003, after fan demand inspired by the episode", years_lead: 4, notes: "Self-fulfilling prophecy — the team actually named themselves after the Simpsons episode." },
  { id: 20, episode_code: "S06E19", episode_title: "Lisa's Wedding", season: 6, air_date: "1995-03-19", prediction_text: "The Shard skyscraper built near Big Ben on the London skyline", category: "architecture", specificity_score: 4, predicted_timeframe: "2010", outcome: "true", verified: true, debunked: false, confidence: "medium", actual_event: "The Shard completed in 2012, visible from near Big Ben with similar shape and position", years_lead: 17, notes: "A pointed spire visible in a background shot of London. The Shard's position and shape match closely." },
  { id: 21, episode_code: "S23E22", episode_title: "Lisa Goes Gaga", season: 23, air_date: "2012-05-20", prediction_text: "Lady Gaga performs at the Super Bowl halftime show descending from cables", category: "entertainment", specificity_score: 3, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "medium", actual_event: "Lady Gaga performed Super Bowl LI halftime show in 2017, descending from the stadium roof", years_lead: 5, notes: "Snopes rated this mixed — Gaga was depicted performing suspended, but not at the Super Bowl in the episode. Some images were doctored." },
  { id: 22, episode_code: "S34E01", episode_title: "Habeas Tortoise", season: 34, air_date: "2022-10-02", prediction_text: "Elon Musk acquires Twitter and dismantles its moderation policies", category: "business", specificity_score: 3, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "medium", actual_event: "Musk acquired Twitter in October 2022 for $44B, rebranded to X", years_lead: 0, notes: "Episode aired same month as the acquisition — more commentary than prediction." },
  { id: 23, episode_code: "S16E05", episode_title: "Midnight Rx", season: 16, air_date: "2005-01-16", prediction_text: "Recreational marijuana legalized in Canada", category: "politics", specificity_score: 3, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "medium", actual_event: "Canada legalized recreational marijuana October 17, 2018", years_lead: 13, notes: "Homer and friends travel to Canada to buy cheap drugs." },
  { id: 24, episode_code: "S18E09", episode_title: "Please Homer Don't Hammer Em", season: 18, air_date: "2006-12-03", prediction_text: "JCPenney files for bankruptcy", category: "business", specificity_score: 4, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "medium", actual_event: "JCPenney filed for Chapter 11 bankruptcy in May 2020 during COVID-19 pandemic", years_lead: 13, notes: "Marge walks past a derelict JCPenney. Department store decline was observable even then." },
  { id: 25, episode_code: "S09E01", episode_title: "The City of New York vs. Homer Simpson", season: 9, air_date: "1997-09-21", prediction_text: "Simpsons 'predicted' 9/11 via a '$9' brochure next to the Twin Towers", category: "politics", specificity_score: 1, predicted_timeframe: null, outcome: "false", verified: false, debunked: true, confidence: "low", actual_event: "September 11, 2001 attacks", years_lead: null, notes: "DEBUNKED — Requires interpreting '$9' + Twin Towers image as '9/11'. Snopes and RationalWiki classify this as a stretch." },
  { id: 26, episode_code: "S14E01", episode_title: "Treehouse of Horror XIII", season: 14, air_date: "2002-11-03", prediction_text: "Holographic display technology enters mainstream use", category: "technology", specificity_score: 2, predicted_timeframe: null, outcome: "pending", verified: true, debunked: false, confidence: "low", actual_event: null, years_lead: null, notes: "Bart receives a holographic message. Limited commercial holograms exist but are far from mainstream." },
  { id: 27, episode_code: "S05E02", episode_title: "Cape Feare", season: 5, air_date: "1993-10-07", prediction_text: "A three-eyed fish discovered near a nuclear power plant", category: "science", specificity_score: 4, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "medium", actual_event: "A three-eyed fish was discovered near a nuclear plant in Córdoba, Argentina in 2011", years_lead: 18, notes: "The fish's exact deformity and breed didn't match Blinky exactly, but the nuclear-plant connection is notable." },
  { id: 28, episode_code: "S16E01", episode_title: "Treehouse of Horror XV", season: 16, air_date: "2004-11-07", prediction_text: "Greece defaults on its international debt obligations", category: "economics", specificity_score: 3, predicted_timeframe: null, outcome: "true", verified: true, debunked: false, confidence: "medium", actual_event: "Greece became first developed country to default to IMF in 2015", years_lead: 11, notes: "A news ticker reads 'Europe puts Greece on eBay' — satirizing EU bailout dynamics." }
];

const CATEGORY_COLORS = {
  politics: "#FF6B35",
  technology: "#4ECDC4",
  sports: "#FFE66D",
  entertainment: "#FF6B9D",
  business: "#C3B1E1",
  science: "#6BCB77",
  health: "#FF8B94",
  culture: "#FFC300",
  economics: "#845EC2",
  architecture: "#B5EAD7",
};

const CATEGORY_EMOJI = {
  politics: "🏛️",
  technology: "💻",
  sports: "⚽",
  entertainment: "🎬",
  business: "💼",
  science: "🔬",
  health: "🏥",
  culture: "🎭",
  economics: "📈",
  architecture: "🏗️",
};

const OUTCOME_CONFIG = {
  true: { label: "✅ CAME TRUE", bg: "#1a3a1a", border: "#4ade80", text: "#4ade80" },
  false: { label: "❌ WRONG", bg: "#3a1a1a", border: "#f87171", text: "#f87171" },
  pending: { label: "⏳ PENDING", bg: "#2a2a1a", border: "#fbbf24", text: "#fbbf24" },
  debunked: { label: "🚫 FAKE/DEBUNKED", bg: "#2a1a2a", border: "#c084fc", text: "#c084fc" },
};

function getOutcomeKey(p) {
  if (p.debunked) return "debunked";
  return p.outcome;
}

function SpecificityDots({ score }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: i <= score ? "#FFD700" : "#333",
            border: "1px solid #555",
          }}
        />
      ))}
    </div>
  );
}

function PredictionCard({ prediction, onClick }) {
  const outcome = getOutcomeKey(prediction);
  const oc = OUTCOME_CONFIG[outcome];
  const cat = prediction.category;

  return (
    <div
      onClick={() => onClick(prediction)}
      style={{
        background: "#1a1a1a",
        border: `1px solid #333`,
        borderLeft: `4px solid ${CATEGORY_COLORS[cat] || "#FFD700"}`,
        borderRadius: 8,
        padding: "16px",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace", fontWeight: 700 }}>
          {prediction.episode_code}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 20,
            background: oc.bg,
            border: `1px solid ${oc.border}`,
            color: oc.text,
            whiteSpace: "nowrap",
          }}
        >
          {oc.label}
        </span>
      </div>

      <p style={{ margin: "0 0 10px", fontSize: 13, color: "#e5e5e5", lineHeight: 1.4, fontWeight: 500 }}>
        {prediction.prediction_text}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 20,
            background: `${CATEGORY_COLORS[cat]}22`,
            color: CATEGORY_COLORS[cat],
            border: `1px solid ${CATEGORY_COLORS[cat]}55`,
            fontWeight: 700,
          }}>
            {CATEGORY_EMOJI[cat]} {cat}
          </span>
          {prediction.years_lead > 0 && (
            <span style={{ fontSize: 10, color: "#666" }}>{prediction.years_lead}yr lead</span>
          )}
        </div>
        <SpecificityDots score={prediction.specificity_score} />
      </div>
    </div>
  );
}

function Modal({ prediction, onClose }) {
  if (!prediction) return null;
  const outcome = getOutcomeKey(prediction);
  const oc = OUTCOME_CONFIG[outcome];

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1a1a1a", border: "1px solid #333", borderRadius: 12,
          padding: 28, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: "monospace", color: "#888", fontWeight: 700 }}>{prediction.episode_code}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        <h3 style={{ margin: "0 0 4px", color: "#FFD700", fontSize: 15 }}>{prediction.episode_title}</h3>
        <p style={{ margin: "0 0 16px", color: "#666", fontSize: 12 }}>Aired: {prediction.air_date}</p>

        <div style={{ background: "#111", borderRadius: 8, padding: 14, marginBottom: 16, borderLeft: `3px solid ${CATEGORY_COLORS[prediction.category]}` }}>
          <p style={{ margin: 0, color: "#e5e5e5", fontSize: 14, lineHeight: 1.5 }}>📺 {prediction.prediction_text}</p>
        </div>

        <div style={{
          background: OUTCOME_CONFIG[outcome].bg, border: `1px solid ${OUTCOME_CONFIG[outcome].border}`,
          borderRadius: 8, padding: 14, marginBottom: 16
        }}>
          <p style={{ margin: "0 0 4px", fontWeight: 700, color: OUTCOME_CONFIG[outcome].text, fontSize: 12 }}>{OUTCOME_CONFIG[outcome].label}</p>
          {prediction.actual_event && <p style={{ margin: 0, color: "#ccc", fontSize: 13 }}>{prediction.actual_event}</p>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#111", borderRadius: 8, padding: 12 }}>
            <p style={{ margin: "0 0 4px", color: "#666", fontSize: 11, fontWeight: 700 }}>SPECIFICITY</p>
            <SpecificityDots score={prediction.specificity_score} />
          </div>
          <div style={{ background: "#111", borderRadius: 8, padding: 12 }}>
            <p style={{ margin: "0 0 4px", color: "#666", fontSize: 11, fontWeight: 700 }}>YEARS IN ADVANCE</p>
            <p style={{ margin: 0, color: "#FFD700", fontWeight: 700, fontSize: 16 }}>
              {prediction.years_lead != null ? `${prediction.years_lead} yrs` : "—"}
            </p>
          </div>
        </div>

        {prediction.notes && (
          <div style={{ background: "#111", borderRadius: 8, padding: 14 }}>
            <p style={{ margin: "0 0 4px", color: "#666", fontSize: 11, fontWeight: 700 }}>🎩 ANALYST NOTE</p>
            <p style={{ margin: 0, color: "#aaa", fontSize: 12, lineHeight: 1.5, fontStyle: "italic" }}>{prediction.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreboardTab({ data }) {
  const total = data.length;
  const trueCount = data.filter((p) => !p.debunked && p.outcome === "true").length;
  const falseCount = data.filter((p) => !p.debunked && p.outcome === "false").length;
  const pendingCount = data.filter((p) => !p.debunked && p.outcome === "pending").length;
  const debunkedCount = data.filter((p) => p.debunked).length;
  const hitRate = Math.round((trueCount / (total - debunkedCount - pendingCount)) * 100);

  const byCategory = useMemo(() => {
    const cats = {};
    data.filter(p => !p.debunked && p.outcome !== "pending").forEach((p) => {
      if (!cats[p.category]) cats[p.category] = { true: 0, total: 0 };
      cats[p.category].total++;
      if (p.outcome === "true") cats[p.category].true++;
    });
    return Object.entries(cats).sort((a, b) => (b[1].true / b[1].total) - (a[1].true / a[1].total));
  }, [data]);

  const highSpec = data.filter((p) => !p.debunked && p.specificity_score >= 4 && p.outcome !== "pending");
  const highSpecHitRate = Math.round((highSpec.filter((p) => p.outcome === "true").length / highSpec.length) * 100);

  return (
    <div>
      <div style={{ background: "#111", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid #2a2a2a" }}>
        <p style={{ margin: "0 0 8px", color: "#888", fontSize: 12, fontStyle: "italic" }}>
          ⚠️ The Simpsons has produced 790+ episodes over 35 years. With thousands of jokes about the future, some will always land by probability alone. <strong style={{ color: "#FFD700" }}>Al Jean (showrunner): "If you throw enough darts, you're going to get some bullseyes."</strong> We score predictions honestly.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "OVERALL HIT RATE", value: `${hitRate}%`, sub: "of scored predictions", color: "#4ade80" },
          { label: "HIGH-SPECIFICITY HIT RATE", value: `${highSpecHitRate}%`, sub: "specificity ≥4 only", color: "#FFD700" },
          { label: "PREDICTIONS TRACKED", value: total, sub: `${trueCount} true · ${falseCount} wrong · ${pendingCount} pending`, color: "#4ECDC4" },
          { label: "FAKE / DEBUNKED", value: debunkedCount, sub: "flagged in database", color: "#c084fc" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: 16 }}>
            <p style={{ margin: "0 0 4px", color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{s.label}</p>
            <p style={{ margin: "0 0 4px", color: s.color, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{s.value}</p>
            <p style={{ margin: 0, color: "#555", fontSize: 11 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: 16 }}>
        <p style={{ margin: "0 0 16px", color: "#888", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>HIT RATE BY CATEGORY (scored only)</p>
        {byCategory.map(([cat, stats]) => {
          const pct = Math.round((stats.true / stats.total) * 100);
          return (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#ccc", fontSize: 12 }}>{CATEGORY_EMOJI[cat]} {cat}</span>
                <span style={{ color: "#888", fontSize: 11 }}>{stats.true}/{stats.total} · {pct}%</span>
              </div>
              <div style={{ background: "#111", borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: CATEGORY_COLORS[cat], borderRadius: 4, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SimpsonsIndex() {
  const [activeTab, setActiveTab] = useState("scoreboard");
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("season");

  const categories = useMemo(() => ["all", ...new Set(PREDICTIONS.map((p) => p.category))], []);

  const filtered = useMemo(() => {
    let data = PREDICTIONS;

    if (activeTab === "pending") data = data.filter((p) => !p.debunked && p.outcome === "pending");
    else if (activeTab === "browse") {
      if (filter !== "all") {
        if (filter === "debunked") data = data.filter((p) => p.debunked);
        else data = data.filter((p) => !p.debunked && p.outcome === filter);
      }
    }

    if (categoryFilter !== "all") data = data.filter((p) => p.category === categoryFilter);

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.prediction_text.toLowerCase().includes(s) ||
          p.episode_title.toLowerCase().includes(s) ||
          p.episode_code.toLowerCase().includes(s)
      );
    }

    if (sortBy === "season") data = [...data].sort((a, b) => a.season - b.season);
    else if (sortBy === "specificity") data = [...data].sort((a, b) => b.specificity_score - a.specificity_score);
    else if (sortBy === "years_lead") data = [...data].sort((a, b) => (b.years_lead || 0) - (a.years_lead || 0));

    return data;
  }, [activeTab, filter, categoryFilter, search, sortBy]);

  const tabs = [
    { id: "scoreboard", label: "📊 Scoreboard" },
    { id: "pending", label: "⏳ Pending" },
    { id: "browse", label: "🔍 Browse All" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d0d",
      color: "#e5e5e5",
      fontFamily: "'Georgia', serif",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #FFD700 0%, #FF6B00 50%, #FFD700 100%)",
        padding: "24px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)"
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 40, marginBottom: 4 }}>🍩</div>
          <h1 style={{
            margin: "0 0 4px",
            fontSize: 32,
            fontWeight: 900,
            color: "#1a1a1a",
            letterSpacing: -1,
            textShadow: "2px 2px 0 rgba(255,255,255,0.3)",
          }}>
            The Simpsons Index
          </h1>
          <p style={{ margin: 0, color: "#3a2a00", fontSize: 13, fontStyle: "italic" }}>
            790 episodes · 35 years · tracking every prediction Springfield ever made
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #222", background: "#111", overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "14px 24px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "3px solid #FFD700" : "3px solid transparent",
              color: activeTab === tab.id ? "#FFD700" : "#666",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? 700 : 400,
              fontSize: 14,
              whiteSpace: "nowrap",
              fontFamily: "Georgia, serif",
              transition: "color 0.2s",
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        {activeTab === "scoreboard" && <ScoreboardTab data={PREDICTIONS} />}

        {activeTab === "pending" && (
          <div>
            <div style={{ background: "#1a1a0a", border: "1px solid #FFD70044", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <p style={{ margin: 0, color: "#FFD700", fontSize: 13 }}>
                ⚡ <strong>The investment angle.</strong> These are Springfield's open prophecies — predictions that haven't resolved yet. Higher specificity scores = stronger signal. Use with appropriate skepticism.
              </p>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {filtered.map((p) => (
                <PredictionCard key={p.id} prediction={p} onClick={setSelectedPrediction} />
              ))}
            </div>
            {filtered.length === 0 && <p style={{ color: "#555", textAlign: "center", padding: 40 }}>No pending predictions found.</p>}
          </div>
        )}

        {activeTab === "browse" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search predictions, episodes..."
                style={{
                  background: "#1a1a1a", border: "1px solid #333", borderRadius: 8,
                  padding: "10px 14px", color: "#e5e5e5", fontSize: 14, fontFamily: "Georgia, serif",
                  outline: "none", width: "100%", boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["all", "true", "false", "pending", "debunked"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "6px 14px", borderRadius: 20, border: "1px solid",
                      borderColor: filter === f ? "#FFD700" : "#333",
                      background: filter === f ? "#FFD70022" : "#1a1a1a",
                      color: filter === f ? "#FFD700" : "#888",
                      cursor: "pointer", fontSize: 12, fontWeight: filter === f ? 700 : 400,
                    }}
                  >
                    {f === "all" ? "All" : f === "true" ? "✅ True" : f === "false" ? "❌ Wrong" : f === "pending" ? "⏳ Pending" : "🚫 Debunked"}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    style={{
                      padding: "4px 10px", borderRadius: 20, border: "1px solid",
                      borderColor: categoryFilter === c ? (CATEGORY_COLORS[c] || "#FFD700") : "#333",
                      background: categoryFilter === c ? `${CATEGORY_COLORS[c] || "#FFD700"}22` : "#1a1a1a",
                      color: categoryFilter === c ? (CATEGORY_COLORS[c] || "#FFD700") : "#888",
                      cursor: "pointer", fontSize: 11,
                    }}
                  >
                    {c === "all" ? "All Categories" : `${CATEGORY_EMOJI[c] || ""} ${c}`}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#666", fontSize: 12 }}>Sort:</span>
                {[["season", "Season"], ["specificity", "Specificity"], ["years_lead", "Years Lead"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSortBy(val)}
                    style={{
                      padding: "4px 10px", borderRadius: 20, border: "1px solid",
                      borderColor: sortBy === val ? "#4ECDC4" : "#333",
                      background: sortBy === val ? "#4ECDC422" : "#1a1a1a",
                      color: sortBy === val ? "#4ECDC4" : "#888",
                      cursor: "pointer", fontSize: 11,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ color: "#555", fontSize: 12, marginBottom: 16 }}>{filtered.length} predictions shown</p>
            <div style={{ display: "grid", gap: 12 }}>
              {filtered.map((p) => (
                <PredictionCard key={p.id} prediction={p} onClick={setSelectedPrediction} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 16px", color: "#444", fontSize: 11, borderTop: "1px solid #1a1a1a" }}>
        <p style={{ margin: 0 }}>The Simpsons Index · Seed dataset v1.0 · 36 predictions tracked</p>
        <p style={{ margin: "4px 0 0", fontStyle: "italic" }}>Not financial advice. D'oh.</p>
      </div>

      <Modal prediction={selectedPrediction} onClose={() => setSelectedPrediction(null)} />
    </div>
  );
}
