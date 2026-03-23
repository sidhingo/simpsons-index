import { useState, useMemo, useEffect } from "react";
import predictionsData from "./data/predictions.json";

const PREDICTIONS = predictionsData.predictions;

const CATS = ["all","politics","technology","sports","science","business","entertainment","health"];

const S = { fontFamily: "Georgia, serif" };
const GOLD = "#B8903B";
const GOLD_LIGHT = "#f7f0e0";

function getOutcome(p) { return p.debunked ? "debunked" : p.outcome; }

function Dots({ score }) {
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width:6, height:6, borderRadius:"50%",
          background: i <= score ? GOLD : "#fff",
          border: i <= score ? `1px solid ${GOLD}` : "1px solid #ccc",
        }}/>
      ))}
    </div>
  );
}

function WikiImage({ episodeTitle, episodeCode }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!episodeTitle || episodeTitle === "Unknown / Fabricated" || episodeTitle === "Fabricated" || episodeTitle === "AI-generated fake" || episodeTitle === "Fabricated / AI-generated") {
      setLoading(false);
      return;
    }
    const title = encodeURIComponent(episodeTitle.replace(/ /g, "_"));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.thumbnail && data.thumbnail.source) {
          setImgUrl(data.thumbnail.source.replace(/\/\d+px-/, "/400px-"));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [episodeTitle]);

  if (loading) {
    return (
      <div style={{ width:"100%", height:180, background:"#f5f5f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"#ccc", ...S }}>Loading...</span>
      </div>
    );
  }

  if (!imgUrl) {
    return (
      <div style={{
        width:"100%", height:180, background:"#f5f5f0",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        borderBottom:"1px solid #eee",
      }}>
        <div style={{ fontSize:32, marginBottom:8 }}>📺</div>
        <span style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#bbb", ...S }}>{episodeCode}</span>
      </div>
    );
  }

  return (
    <div style={{ width:"100%", height:180, overflow:"hidden", borderBottom:"1px solid #eee", background:"#f5f5f0" }}>
      <img
        src={imgUrl}
        alt={episodeTitle}
        style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
        onError={() => setImgUrl(null)}
      />
    </div>
  );
}

function Modal({ p, onClose }) {
  if (!p) return null;
  const ok = getOutcome(p);

  const badgeStyle = {
    true:     { background:"#ecf5ec", color:"#2d5a2d", border:"1px solid #b0d0b0" },
    false:    { background:"#fdf0f0", color:"#7a2a2a", border:"1px solid #d8b0b0" },
    pending:  { background:"#fdf4e0", color:"#8a6010", border:"1px solid #d8c070" },
    debunked: { background:"#f4f0f8", color:"#5a3a7a", border:"1px solid #c0a8e0" },
  }[ok];

  const outcomeLabel = { true:"Confirmed True", false:"Wrong", pending:"Pending", debunked:"Debunked" }[ok];

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"#fff", border:"1px solid #ddd",
        borderTop:`4px solid ${GOLD}`,
        maxWidth:560, width:"100%", maxHeight:"90vh", overflowY:"auto",
        ...S,
      }}>
        <WikiImage episodeTitle={p.episode_title} episodeCode={p.episode_code} />

        <div style={{ padding:"20px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:9, fontFamily:"'Courier New',monospace", color:"#bbb", marginBottom:4 }}>
                {p.episode_code} {p.air_date ? `· ${p.air_date.slice(0,4)}` : ""}
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:"#111", lineHeight:1.3 }}>{p.episode_title}</div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:8, letterSpacing:1.5, textTransform:"uppercase", padding:"3px 8px", ...badgeStyle }}>{outcomeLabel}</span>
              <button onClick={onClose} style={{ background:"none", border:"none", color:"#aaa", cursor:"pointer", fontSize:20, lineHeight:1, padding:0 }}>×</button>
            </div>
          </div>

          <div style={{ borderLeft:`3px solid ${GOLD}`, paddingLeft:14, marginBottom:16 }}>
            <p style={{ fontSize:14, lineHeight:1.7, color:"#222", ...S }}>{p.prediction_text}</p>
          </div>

          {p.actual_event && (
            <div style={{ background: ok === "true" ? "#ecf5ec" : ok === "false" ? "#fdf0f0" : ok === "pending" ? "#fdf4e0" : "#f4f0f8", padding:"12px 14px", marginBottom:14, borderLeft:"3px solid #ccc" }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#999", marginBottom:4 }}>What happened</div>
              <div style={{ fontSize:13, color:"#333", lineHeight:1.6, ...S }}>{p.actual_event}</div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            <div style={{ background:"#f8f8f6", padding:"10px 12px" }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:6 }}>Specificity score</div>
              <Dots score={p.specificity_score} />
            </div>
            <div style={{ background:"#f8f8f6", padding:"10px 12px" }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:4 }}>Years in advance</div>
              <div style={{ fontSize:24, fontWeight:900, color: p.years_lead ? GOLD : "#ccc", ...S }}>
                {p.years_lead != null ? `${p.years_lead}` : "—"}
              </div>
            </div>
          </div>

          {p.notes && (
            <div style={{ borderTop:"1px solid #eee", paddingTop:12 }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:6 }}>Analyst note</div>
              <div style={{ fontSize:12, color:"#777", lineHeight:1.65, fontStyle:"italic", ...S }}>{p.notes}</div>
            </div>
          )}

          <div style={{ borderTop:"1px solid #eee", paddingTop:12, marginTop:12 }}>
            <a
              href={`https://en.wikipedia.org/wiki/${encodeURIComponent(p.episode_title?.replace(/ /g,"_") || "The_Simpsons")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:GOLD, textDecoration:"none", ...S }}
            >
              View episode on Wikipedia →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ p, onClick, lead }) {
  const ok = getOutcome(p);
  const badgeStyle = {
    true:     { background:"#ecf5ec", color:"#2d5a2d", border:"1px solid #b0d0b0" },
    false:    { background:"#fdf0f0", color:"#7a2a2a", border:"1px solid #d8b0b0" },
    pending:  { background:"#fdf4e0", color:"#8a6010", border:"1px solid #d8c070" },
    debunked: { background:"#f4f0f8", color:"#5a3a7a", border:"1px solid #c0a8e0" },
  }[ok];
  const outcomeLabel = { true:"Confirmed", false:"Wrong", pending:"Pending", debunked:"Debunked" }[ok];

  return (
    <div
      onClick={() => onClick(p)}
      style={{
        background:"#fff",
        padding:20,
        cursor:"pointer",
        gridColumn: lead ? "span 2" : undefined,
        borderLeft: lead ? `3px solid ${GOLD}` : undefined,
        transition:"background 0.12s",
        display:"flex", flexDirection:"column",
      }}
      onMouseEnter={e => e.currentTarget.style.background="#faf8f4"}
      onMouseLeave={e => e.currentTarget.style.background="#fff"}
    >
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:9, fontFamily:"'Courier New',monospace", color:"#bbb", letterSpacing:0.5 }}>
          {p.episode_code} · {p.air_date ? p.air_date.slice(0,4) : "—"}
        </span>
        <span style={{ fontSize:8, letterSpacing:1.5, textTransform:"uppercase", padding:"2px 7px", ...badgeStyle }}>
          {outcomeLabel}
        </span>
      </div>
      <p style={{ fontSize: lead ? 13 : 12, lineHeight:1.65, color:"#333", marginBottom:12, flex:1, ...S }}>
        {p.prediction_text}
      </p>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #eee", paddingTop:9 }}>
        <span style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:"#ccc" }}>
          {p.category}{p.years_lead ? ` · ${p.years_lead} yr lead` : p.outcome === "pending" ? " · Open" : ""}
        </span>
        <Dots score={p.specificity_score} />
      </div>
    </div>
  );
}

const SpringfieldSkyline = () => (
  <svg style={{ position:"absolute", bottom:0, left:0, right:0, opacity:0.055, pointerEvents:"none", display:"block" }}
    viewBox="0 0 1200 140" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="100" width="1200" height="40" fill="#111"/>
    <rect x="20" y="62" width="46" height="78" fill="#111"/><rect x="34" y="44" width="15" height="20" fill="#111"/><rect x="38" y="26" width="7" height="20" fill="#111"/>
    <rect x="85" y="74" width="33" height="66" fill="#111"/><rect x="95" y="58" width="12" height="18" fill="#111"/>
    <rect x="132" y="48" width="65" height="92" fill="#111"/><rect x="150" y="32" width="24" height="18" fill="#111"/><ellipse cx="162" cy="30" rx="17" ry="11" fill="#111"/>
    <rect x="210" y="78" width="36" height="62" fill="#111"/>
    <rect x="260" y="38" width="56" height="102" fill="#111"/><rect x="274" y="20" width="8" height="20" fill="#111"/><rect x="285" y="20" width="8" height="20" fill="#111"/>
    <rect x="330" y="68" width="32" height="72" fill="#111"/><rect x="335" y="52" width="22" height="18" fill="#111"/>
    <rect x="376" y="42" width="74" height="98" fill="#111"/><rect x="393" y="24" width="40" height="20" fill="#111"/>
    <ellipse cx="413" cy="22" rx="24" ry="13" fill="#111"/><rect x="409" y="6" width="7" height="20" fill="#111"/>
    <rect x="463" y="78" width="28" height="62" fill="#111"/>
    <rect x="505" y="52" width="44" height="88" fill="#111"/><rect x="517" y="36" width="14" height="18" fill="#111"/><ellipse cx="524" cy="34" rx="11" ry="8" fill="#111"/>
    <rect x="562" y="68" width="48" height="72" fill="#111"/><rect x="574" y="50" width="24" height="20" fill="#111"/>
    <rect x="624" y="38" width="58" height="102" fill="#111"/><rect x="636" y="20" width="9" height="20" fill="#111"/><rect x="648" y="20" width="9" height="20" fill="#111"/>
    <rect x="696" y="72" width="38" height="68" fill="#111"/><rect x="706" y="56" width="12" height="18" fill="#111"/>
    <rect x="748" y="46" width="62" height="94" fill="#111"/><ellipse cx="779" cy="44" rx="19" ry="11" fill="#111"/><rect x="776" y="24" width="6" height="24" fill="#111"/>
    <rect x="824" y="62" width="42" height="78" fill="#111"/><rect x="835" y="46" width="20" height="18" fill="#111"/>
    <rect x="880" y="52" width="52" height="88" fill="#111"/><rect x="892" y="34" width="28" height="20" fill="#111"/>
    <rect x="946" y="68" width="36" height="72" fill="#111"/><rect x="956" y="52" width="12" height="18" fill="#111"/>
    <rect x="996" y="58" width="44" height="82" fill="#111"/><rect x="1007" y="38" width="24" height="22" fill="#111"/>
    <rect x="1054" y="70" width="46" height="70" fill="#111"/><rect x="1065" y="52" width="14" height="20" fill="#111"/>
    <rect x="1114" y="72" width="48" height="68" fill="#111"/>
  </svg>
);

export default function SimpsonsIndex() {
  const [tab, setTab]           = useState("scoreboard");
  const [cat, setCat]           = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState(null); // null = no filter
  const [selected, setSelected] = useState(null);

  const counts = useMemo(() => ({
    true:     PREDICTIONS.filter(p => !p.debunked && p.outcome === "true").length,
    pending:  PREDICTIONS.filter(p => !p.debunked && p.outcome === "pending").length,
    false:    PREDICTIONS.filter(p => !p.debunked && p.outcome === "false").length,
    debunked: PREDICTIONS.filter(p => p.debunked).length,
  }), []);

  const filtered = useMemo(() => {
    let data = PREDICTIONS;

    // Tab logic
    if (tab === "scoreboard") {
      // Scoreboard: only verified scored predictions, ranked by specificity
      data = data.filter(p => !p.debunked && p.outcome !== "pending");
      data = [...data].sort((a,b) => b.specificity_score - a.specificity_score);
    } else if (tab === "pending") {
      // Pending signals: only pending, sorted by years_lead desc
      data = data.filter(p => !p.debunked && p.outcome === "pending");
    } else {
      // All predictions: everything, default order
      data = [...data].sort((a,b) => (a.season || 99) - (b.season || 99));
    }

    // Outcome filter from stat bar clicks
    if (outcomeFilter) {
      if (outcomeFilter === "debunked") {
        data = data.filter(p => p.debunked);
      } else {
        data = data.filter(p => !p.debunked && p.outcome === outcomeFilter);
      }
    }

    // Category filter
    if (cat !== "all") {
      data = data.filter(p => p.category === cat);
    }

    return data;
  }, [tab, cat, outcomeFilter]);

  function handleStatClick(key) {
    // Toggle: clicking again clears the filter
    setOutcomeFilter(prev => prev === key ? null : key);
    // Switch to all predictions tab so filter makes sense
    setTab("browse");
  }

  const TAB_DESCRIPTIONS = {
    scoreboard: "Ranked by specificity — only scored, confirmed or wrong predictions",
    pending:    "Open predictions that haven't resolved yet — your signal tab",
    browse:     "All 55 predictions including debunked claims",
  };

  return (
    <div style={{ ...S, background:"#fff", color:"#111", minHeight:"100vh" }}>

      {/* ── HERO ── */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"3px solid #111" }}>
        <SpringfieldSkyline />
        <div style={{ position:"relative", zIndex:2, padding:"24px 24px 18px" }}>
          <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"#aaa", marginBottom:10 }}>
            Springfield, USA &nbsp;·&nbsp;
            <span style={{ color:GOLD, fontWeight:700 }}>Est. 2026</span>
          </div>
          <div style={{
            display:"flex", alignItems:"baseline",
            borderTop:"2px solid #111", borderBottom:"1px solid #ccc",
            padding:"8px 0", marginBottom:10, gap:14,
          }}>
            <div style={{ fontSize:46, fontWeight:900, letterSpacing:-2, lineHeight:1, flex:1 }}>
              The Simpsons <span style={{ color:GOLD }}>Index</span>
            </div>
            <div style={{
              fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa",
              borderLeft:"1px solid #ccc", paddingLeft:12, lineHeight:1.9,
              alignSelf:"flex-end", paddingBottom:3,
            }}>
              Prediction<br/>Intelligence<br/>Database
            </div>
          </div>
          <div style={{ fontSize:12, color:"#777", fontStyle:"italic" }}>
            790 episodes tracked for predictive accuracy &nbsp;·&nbsp; Every claim scored, sourced and verified against real-world outcomes
          </div>
        </div>
      </div>

      {/* ── STAT BAR — clickable ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:"2px solid #111" }}>
        {[
          { key:"true",     num:counts.true,     label:"Confirmed true", col:"#2d5a2d" },
          { key:"pending",  num:counts.pending,  label:"Pending",         col:GOLD },
          { key:"false",    num:counts.false,    label:"Wrong",           col:"#7a2a2a" },
          { key:"debunked", num:counts.debunked, label:"Fake / debunked", col:"#bbb" },
        ].map((s,i) => (
          <div
            key={s.key}
            onClick={() => handleStatClick(s.key)}
            style={{
              padding:"14px 20px",
              borderRight: i < 3 ? "1px solid #eee" : "none",
              cursor:"pointer",
              background: outcomeFilter === s.key ? GOLD_LIGHT : "transparent",
              borderBottom: outcomeFilter === s.key ? `2px solid ${GOLD}` : "2px solid transparent",
              marginBottom:-2,
              transition:"background 0.12s",
            }}
            onMouseEnter={e => { if(outcomeFilter !== s.key) e.currentTarget.style.background="#f8f8f6"; }}
            onMouseLeave={e => { if(outcomeFilter !== s.key) e.currentTarget.style.background="transparent"; }}
          >
            <div style={{ fontSize:30, fontWeight:900, lineHeight:1, marginBottom:3, color:s.col }}>{s.num}</div>
            <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa" }}>{s.label}</div>
            <div style={{ fontSize:9, color: outcomeFilter === s.key ? GOLD : "#ccc", marginTop:2, fontStyle:"italic" }}>
              {outcomeFilter === s.key ? "Filtering ↓ click to clear" : "Click to filter"}
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={{ display:"flex", padding:"0 24px", borderBottom:"1px solid #eee", background:"#fff" }}>
        {[
          ["scoreboard",  "Scoreboard"],
          ["pending",     "Pending signals"],
          ["browse",      "All predictions"],
        ].map(([id, lbl]) => (
          <div key={id} onClick={() => { setTab(id); setOutcomeFilter(null); }} style={{
            padding:"11px 0", marginRight:22, fontSize:10, letterSpacing:2,
            textTransform:"uppercase", cursor:"pointer",
            color: tab === id ? "#111" : "#bbb",
            borderBottom: tab === id ? `2px solid ${GOLD}` : "2px solid transparent",
            marginBottom:-1, transition:"color .12s, border-color .12s",
          }}>{lbl}</div>
        ))}
      </div>

      {/* Tab description */}
      <div style={{ padding:"8px 24px", background:"#f8f8f6", borderBottom:"1px solid #eee" }}>
        <span style={{ fontSize:11, color:"#999", fontStyle:"italic" }}>{TAB_DESCRIPTIONS[tab]}</span>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div style={{ display:"flex", gap:5, padding:"10px 24px", borderBottom:"1px solid #eee", background:"#f5f5f2", flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:9, letterSpacing:2, color:"#ccc", textTransform:"uppercase", marginRight:4 }}>Category</span>
        {CATS.map(c => (
          <span key={c} onClick={() => setCat(c)} style={{
            padding:"3px 10px", border:`1px solid ${cat === c ? "#111" : "#ddd"}`,
            fontSize:9, letterSpacing:1.5, textTransform:"uppercase",
            color: cat === c ? "#111" : "#999", cursor:"pointer",
            background: cat === c ? "#fff" : "#f5f5f2",
            transition:"all .12s",
          }}>{c}</span>
        ))}
        {outcomeFilter && (
          <span
            onClick={() => setOutcomeFilter(null)}
            style={{
              padding:"3px 10px", border:`1px solid ${GOLD}`,
              fontSize:9, letterSpacing:1.5, textTransform:"uppercase",
              color:GOLD, cursor:"pointer", background:GOLD_LIGHT, marginLeft:8,
            }}
          >
            ✕ Clear outcome filter
          </span>
        )}
      </div>

      {/* ── CARDS GRID ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:1, background:"#ddd" }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn:"span 3", padding:60, textAlign:"center", color:"#aaa", fontStyle:"italic", background:"#fff" }}>
            No predictions match this filter.
          </div>
        ) : tab === "scoreboard" ? (
          <>
            <Card key={filtered[0].id} p={filtered[0]} onClick={setSelected} lead />
            {filtered.slice(1).map(p => <Card key={p.id} p={p} onClick={setSelected} />)}
          </>
        ) : (
          filtered.map(p => <Card key={p.id} p={p} onClick={setSelected} />)
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        padding:"14px 24px", borderTop:"3px solid #111",
        display:"flex", justifyContent:"space-between", background:"#fff",
      }}>
        <span style={{ fontSize:9, letterSpacing:1.5, textTransform:"uppercase", color:"#bbb" }}>
          The Simpsons Index · Est. 2026 · {PREDICTIONS.length} predictions · 6 sources
        </span>
        <span style={{ fontSize:10, color:"#ccc", fontStyle:"italic" }}>Not financial advice. D'oh.</span>
      </div>

      <Modal p={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
