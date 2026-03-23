import { useState, useMemo, useEffect } from "react";
import predictionsData from "./data/predictions.json";

const PREDICTIONS = predictionsData.predictions;
const CATS = ["all","politics","technology","sports","science","business","entertainment","health"];
const GOLD = "#B8903B";
const GOLD_LIGHT = "#fdf6e8";

function getOutcome(p) { return p.debunked ? "debunked" : p.outcome; }

function useWikiImage(episodeTitle) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    const bad = ["Unknown","Fabricated","AI-generated"];
    if (!episodeTitle || bad.some(b => episodeTitle.includes(b))) return;
    const t = encodeURIComponent(episodeTitle.replace(/ /g, "_"));
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${t}`)
      .then(r => r.json())
      .then(d => { if (d.thumbnail?.source) setImg(d.thumbnail.source.replace(/\/\d+px-/, "/480px-")); })
      .catch(() => {});
  }, [episodeTitle]);
  return img;
}

function Dots({ score }) {
  return (
    <span style={{ display:"inline-flex", gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{
          width:6, height:6, borderRadius:"50%",
          background: i <= score ? GOLD : "#fff",
          border:`1px solid ${i <= score ? GOLD : "#ccc"}`,
          display:"inline-block",
        }}/>
      ))}
    </span>
  );
}

const BADGE_STYLES = {
  true:     { bg:"#d4edda", color:"#0a3a0a", border:"#6aaa6a", label:"Confirmed"  },
  false:    { bg:"#f8d7da", color:"#3a0a0a", border:"#c07070", label:"Wrong"      },
  pending:  { bg:"#fff3cd", color:"#3a2800", border:"#c8a43a", label:"Pending"    },
  debunked: { bg:"#e8e0f8", color:"#2a0a4a", border:"#9070c0", label:"Debunked"   },
};

function Badge({ outcome }) {
  const b = BADGE_STYLES[outcome] || BADGE_STYLES.pending;
  return (
    <span style={{
      fontSize:8, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700,
      padding:"3px 8px", background:b.bg, color:b.color,
      border:`1px solid ${b.border}`, fontFamily:"Georgia,serif", whiteSpace:"nowrap",
    }}>{b.label}</span>
  );
}

function Modal({ p, onClose }) {
  const img = useWikiImage(p?.episode_title);
  if (!p) return null;
  const ok = getOutcome(p);

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:999,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"#fff", maxWidth:560, width:"100%", maxHeight:"92vh",
        overflowY:"auto", fontFamily:"Georgia,serif", borderTop:"4px solid #111",
      }}>
        {img ? (
          <div style={{ width:"100%", height:220, overflow:"hidden", background:"#f0ede6" }}>
            <img src={img} alt={p.episode_title}
              style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}
              onError={e => e.target.style.display="none"}/>
          </div>
        ) : (
          <div style={{
            width:"100%", height:110, background:"#f5f3ee",
            display:"flex", alignItems:"center", justifyContent:"center",
            borderBottom:"1px solid #e0ddd6",
          }}>
            <span style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:"#bbb" }}>
              {p.episode_code}
            </span>
          </div>
        )}

        <div style={{ padding:"20px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11, fontFamily:"'Courier New',monospace", color:"#888", marginBottom:4 }}>
                {p.episode_code}{p.air_date ? ` · ${p.air_date.slice(0,4)}` : ""}
              </div>
              <div style={{ fontSize:14, fontWeight:800, color:"#111", lineHeight:1.25 }}>{p.episode_title}</div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0, marginLeft:12 }}>
              <Badge outcome={ok}/>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#aaa", lineHeight:1, padding:0 }}>×</button>
            </div>
          </div>

          <div style={{ borderTop:"2px solid #111", borderBottom:"1px solid #ddd", padding:"12px 0", marginBottom:16 }}>
            <p style={{ fontSize:14, lineHeight:1.75, color:"#111", margin:0 }}>{p.prediction_text}</p>
          </div>

          {p.actual_event && (
            <div style={{ marginBottom:16, paddingLeft:12, borderLeft:`3px solid ${GOLD}` }}>
              <div style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:4 }}>What happened</div>
              <div style={{ fontSize:12, lineHeight:1.65, color:"#444" }}>{p.actual_event}</div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:"#e8e4dc", marginBottom:16 }}>
            {[
              { label:"Category",    val: p.category },
              { label:"Years lead",  val: p.years_lead != null ? `${p.years_lead} yrs` : "—" },
              { label:"Specificity", val: <Dots score={p.specificity_score}/> },
            ].map(({ label, val }, i) => (
              <div key={i} style={{ background:"#fff", padding:"10px 12px" }}>
                <div style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:5 }}>{label}</div>
                <div style={{ fontSize:13, color: label === "Years lead" ? GOLD : "#111", fontWeight:700 }}>{val}</div>
              </div>
            ))}
          </div>

          {p.notes && (
            <div style={{ borderTop:"1px solid #eee", paddingTop:12, marginBottom:16 }}>
              <div style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:5 }}>Analyst note</div>
              <p style={{ fontSize:11, lineHeight:1.7, color:"#777", fontStyle:"italic", margin:0 }}>{p.notes}</p>
            </div>
          )}

          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent((p.episode_title || "The_Simpsons").replace(/ /g,"_"))}`}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:GOLD, textDecoration:"none" }}
          >
            View episode on Wikipedia →
          </a>
        </div>
      </div>
    </div>
  );
}

function Card({ p, onClick, lead }) {
  const ok = getOutcome(p);
  return (
    <div
      onClick={() => onClick(p)}
      style={{
        background:"#fff", padding:"18px 16px 14px", cursor:"pointer",
        gridColumn: lead ? "span 2" : undefined,
        borderLeft: lead ? `3px solid ${GOLD}` : "none",
        transition:"background 0.1s", display:"flex", flexDirection:"column",
      }}
      onMouseEnter={e => e.currentTarget.style.background="#faf8f4"}
      onMouseLeave={e => e.currentTarget.style.background="#fff"}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"#666", fontFamily:"Georgia,serif" }}>
          {p.category}{p.years_lead ? ` · ${p.years_lead} yr lead` : p.outcome === "pending" ? " · Open" : ""}
        </span>
        <Badge outcome={ok}/>
      </div>

      <div style={{
        fontSize: lead ? 17 : 14, fontWeight:800, lineHeight:1.35,
        color:"#111", marginBottom:12, fontFamily:"Georgia,serif", flex:1,
      }}>
        {p.prediction_text}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #eee", paddingTop:10 }}>
        <span style={{ fontSize:11, fontFamily:"'Courier New',monospace", color:"#888", letterSpacing:0.5 }}>
          {p.episode_code} · {p.air_date ? p.air_date.slice(0,4) : "—"}
        </span>
        <Dots score={p.specificity_score}/>
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

const TAB_DESC = {
  scoreboard: "Ranked by specificity — confirmed and wrong predictions only",
  pending:    "Unresolved predictions — the investment signal tab",
  browse:     "All 55 predictions including debunked claims",
};

export default function SimpsonsIndex() {
  const [tab, setTab]                     = useState("scoreboard");
  const [cat, setCat]                     = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState(null);
  const [selected, setSelected]           = useState(null);

  const counts = useMemo(() => ({
    true:     PREDICTIONS.filter(p => !p.debunked && p.outcome === "true").length,
    pending:  PREDICTIONS.filter(p => !p.debunked && p.outcome === "pending").length,
    false:    PREDICTIONS.filter(p => !p.debunked && p.outcome === "false").length,
    debunked: PREDICTIONS.filter(p => p.debunked).length,
  }), []);

  const filtered = useMemo(() => {
    let data = [...PREDICTIONS];
    if (tab === "scoreboard") {
      data = data.filter(p => !p.debunked && p.outcome !== "pending");
      data.sort((a, b) => b.specificity_score - a.specificity_score);
    } else if (tab === "pending") {
      data = data.filter(p => !p.debunked && p.outcome === "pending");
    } else {
      data.sort((a, b) => (a.season || 99) - (b.season || 99));
    }
    if (outcomeFilter) {
      data = outcomeFilter === "debunked"
        ? data.filter(p => p.debunked)
        : data.filter(p => !p.debunked && p.outcome === outcomeFilter);
    }
    if (cat !== "all") data = data.filter(p => p.category === cat);
    return data;
  }, [tab, cat, outcomeFilter]);

  function handleStatClick(key) {
    setOutcomeFilter(prev => prev === key ? null : key);
    setTab("browse");
  }

  return (
    <div style={{ fontFamily:"Georgia,serif", background:"#fff", color:"#111", minHeight:"100vh" }}>

      {/* ── MASTHEAD ── */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"3px solid #111", background:"#fff" }}>
        <SpringfieldSkyline/>
        <div style={{ position:"relative", zIndex:2, padding:"20px 16px 14px" }}>
          <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"#999", marginBottom:10 }}>
            Springfield, USA &nbsp;·&nbsp;
            <span style={{ color:GOLD, fontWeight:700 }}>Est. 2026</span>
          </div>
          <div style={{
            display:"flex", alignItems:"baseline", gap:16,
            borderTop:"2.5px solid #111", borderBottom:"1px solid #bbb",
            padding:"10px 0", marginBottom:10,
          }}>
            <h1 style={{
              fontSize:58, fontWeight:900, letterSpacing:-2.5, lineHeight:1,
              margin:0, flex:1, color:"#111", fontFamily:"Georgia,serif",
            }}>
              The Simpsons <span style={{ color:GOLD }}>Index</span>
            </h1>
            <div style={{
              fontSize:9, letterSpacing:2.5, textTransform:"uppercase", color:"#aaa",
              borderLeft:"1px solid #ccc", paddingLeft:14, lineHeight:2,
              alignSelf:"flex-end", paddingBottom:2, flexShrink:0,
            }}>
              Prediction<br/>Intelligence<br/>Database
            </div>
          </div>
          <p style={{ fontSize:12, color:"#666", fontStyle:"italic", margin:0 }}>
            790 episodes tracked for predictive accuracy &nbsp;·&nbsp; Every claim scored, sourced and verified against real-world outcomes
          </p>
        </div>
      </div>

      {/* ── STAT BAR ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:"2px solid #111" }}>
        {[
          { key:"true",     num:counts.true,     label:"Confirmed true", col:"#2d5a2d" },
          { key:"pending",  num:counts.pending,  label:"Pending",         col:GOLD      },
          { key:"false",    num:counts.false,    label:"Wrong",           col:"#7a2a2a" },
          { key:"debunked", num:counts.debunked, label:"Fake / debunked", col:"#999"    },
        ].map((s, i) => (
          <div key={s.key} onClick={() => handleStatClick(s.key)} style={{
            padding:"13px 16px", borderRight: i < 3 ? "1px solid #eee" : "none",
            cursor:"pointer",
            background: outcomeFilter === s.key ? GOLD_LIGHT : "#fff",
            borderBottom: outcomeFilter === s.key ? `2px solid ${GOLD}` : "2px solid transparent",
            marginBottom:-2, transition:"background 0.12s",
          }}
          onMouseEnter={e => { if (outcomeFilter !== s.key) e.currentTarget.style.background="#faf8f4"; }}
          onMouseLeave={e => { if (outcomeFilter !== s.key) e.currentTarget.style.background="#fff"; }}
          >
            <div style={{ fontSize:30, fontWeight:900, lineHeight:1, marginBottom:3, color:s.col }}>{s.num}</div>
            <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"#555" }}>{s.label}</div>
            <div style={{ fontSize:11, color: outcomeFilter === s.key ? GOLD : "#999", marginTop:2, fontStyle:"italic" }}>
              {outcomeFilter === s.key ? "Filtering ↓  click to clear" : "Click to filter"}
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={{ display:"flex", padding:"0 16px", borderBottom:"1px solid #ddd", background:"#fff" }}>
        {[["scoreboard","Scoreboard"],["pending","Pending signals"],["browse","All predictions"]].map(([id,lbl]) => (
          <div key={id} onClick={() => { setTab(id); setOutcomeFilter(null); }} style={{
            padding:"11px 0", marginRight:24, fontSize:10, letterSpacing:2,
            textTransform:"uppercase", cursor:"pointer",
            color: tab === id ? "#111" : "#aaa",
            borderBottom: tab === id ? `2px solid ${GOLD}` : "2px solid transparent",
            marginBottom:-1, transition:"color .12s",
          }}>{lbl}</div>
        ))}
      </div>

      {/* Tab description */}
      <div style={{ padding:"7px 16px", background:"#faf9f6", borderBottom:"1px solid #eee" }}>
        <span style={{ fontSize:11, color:"#999", fontStyle:"italic" }}>{TAB_DESC[tab]}</span>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div style={{ display:"flex", gap:5, padding:"9px 16px", borderBottom:"1px solid #eee", background:"#f5f4f0", flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:9, letterSpacing:2, color:"#bbb", textTransform:"uppercase", marginRight:4 }}>Category</span>
        {CATS.map(c => (
          <span key={c} onClick={() => setCat(c)} style={{
            padding:"3px 10px", border:`1px solid ${cat === c ? "#111" : "#ddd"}`,
            fontSize:9, letterSpacing:1.5, textTransform:"uppercase",
            color: cat === c ? "#111" : "#999", cursor:"pointer",
            background: cat === c ? "#fff" : "#f5f4f0", transition:"all .12s",
          }}>{c}</span>
        ))}
        {outcomeFilter && (
          <span onClick={() => setOutcomeFilter(null)} style={{
            padding:"3px 10px", border:`1px solid ${GOLD}`,
            fontSize:9, letterSpacing:1.5, textTransform:"uppercase",
            color:GOLD, cursor:"pointer", background:GOLD_LIGHT, marginLeft:8,
          }}>✕ Clear filter</span>
        )}
      </div>

      {/* ── CARD GRID ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:"1px", background:"#ddd" }}>
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
      <div style={{ padding:"13px 16px", borderTop:"3px solid #111", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fff" }}>
        <span style={{ fontSize:9, letterSpacing:1.5, textTransform:"uppercase", color:"#bbb" }}>
          The Simpsons Index · Est. 2026 · {PREDICTIONS.length} predictions · 6 sources
        </span>
        <span style={{ fontSize:10, color:"#bbb", fontStyle:"italic" }}>Not financial advice. D'oh.</span>
      </div>

      <Modal p={selected} onClose={() => setSelected(null)}/>
    </div>
  );
}
