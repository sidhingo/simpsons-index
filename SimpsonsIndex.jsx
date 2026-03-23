import { useState, useMemo } from "react";

const PREDICTIONS = [
  { id:1, episode_code:"S11E17", episode_title:"Bart to the Future", season:11, air_date:"2000-03-19", prediction_text:"Donald Trump becomes President of the United States, inheriting a massive budget deficit — named explicitly in a cabinet scene 16 years before the 2016 election.", category:"politics", specificity_score:5, outcome:"true", debunked:false, confidence:"high", actual_event:"Trump elected 45th President 2016, re-elected 47th in 2024", years_lead:16, notes:"Writer Dan Greaney confirmed satirical intent. A background poster even showed '2024' next to Trump's image." },
  { id:2, episode_code:"S10E05", episode_title:"When You Dish Upon a Star", season:10, air_date:"1998-11-08", prediction_text:"Disney acquires 20th Century Fox — visible as a background sign 21 years before the $71B deal closed.", category:"business", specificity_score:5, outcome:"true", debunked:false, confidence:"high", actual_event:"Disney completed $71.3B acquisition in March 2019", years_lead:21, notes:"One of the most specific and verifiable predictions in the dataset." },
  { id:3, episode_code:"S21E12", episode_title:"Boy Meets Curl", season:21, air_date:"2010-02-07", prediction_text:"U.S. Olympic curling team defeats Sweden for gold — correct opponent, correct upset result, 8 years in advance.", category:"sports", specificity_score:5, outcome:"true", debunked:false, confidence:"high", actual_event:"US defeated Sweden 10-7 at 2018 Winter Olympics, Pyeongchang", years_lead:8, notes:"Got both the exact opponent AND the underdog result. Highest-specificity sports hit." },
  { id:4, episode_code:"S22E01", episode_title:"Elementary School Musical", season:22, air_date:"2010-09-26", prediction_text:"Bengt Holmström wins the Nobel Prize in Economics — named specifically on a freeze-frame betting card, 6 years early.", category:"science", specificity_score:5, outcome:"true", debunked:false, confidence:"high", actual_event:"Holmström won Nobel Memorial Prize in Economic Sciences, October 2016", years_lead:6, notes:"Named by name. One of the most remarkable specific predictions in the dataset." },
  { id:5, episode_code:"S07E24", episode_title:"Homerpalooza", season:7, air_date:"1996-05-19", prediction_text:"Cypress Hill performs with the London Symphony Orchestra.", category:"entertainment", specificity_score:5, outcome:"true", debunked:false, confidence:"high", actual_event:"Cypress Hill performed with the LSO at Royal Albert Hall, July 10, 2024", years_lead:28, notes:"B-Real confirmed the Simpsons episode directly inspired the real performance." },
  { id:6, episode_code:"S25E10", episode_title:"You Don't Have to Live Like a Referee", season:25, air_date:"2014-03-23", prediction_text:"FIFA officials arrested on corruption and bribery charges.", category:"sports", specificity_score:4, outcome:"true", debunked:false, confidence:"high", actual_event:"14 FIFA officials indicted by U.S. Dept of Justice, May 2015", years_lead:1, notes:"Same episode also correctly predicted Germany defeating Brazil in the 2014 World Cup." },
  { id:7, episode_code:"S04E21", episode_title:"Marge in Chains", season:4, air_date:"1993-05-06", prediction_text:"A viral illness originating in east Asia spreads globally via shipped goods, causing mass panic.", category:"health", specificity_score:3, outcome:"true", debunked:false, confidence:"low", actual_event:"COVID-19 pandemic, 2020", years_lead:27, notes:"Writer Bill Oakley: 'It's mainly just coincidence.' Asian flu pandemics are a recurring historical pattern." },
  { id:8, episode_code:"S10E22", episode_title:"The Wizard of Evergreen Terrace", season:10, air_date:"1998-09-20", prediction_text:"Homer's chalkboard equation approximates the mass of the Higgs boson particle, 14 years before discovery.", category:"science", specificity_score:4, outcome:"true", debunked:false, confidence:"high", actual_event:"Higgs boson confirmed by CERN, July 2012", years_lead:14, notes:"Verified by physicist Dr. Simon Singh. Writer David X. Cohen had a physics background." },
  { id:9, episode_code:"S15E14", episode_title:"The Ziff Who Came to Dinner", season:15, air_date:"2004-03-14", prediction_text:"A fourth Matrix film is released with a Christmas-week premiere.", category:"entertainment", specificity_score:4, outcome:"true", debunked:false, confidence:"high", actual_event:"The Matrix Resurrections released December 22, 2021", years_lead:17, notes:"Background poster showed 'Matrix 4' with a Christmas date. Came true 17 years later." },
  { id:10, episode_code:"S23E12", episode_title:"Them, Robot", season:23, air_date:"2012-03-18", prediction_text:"AI and automation displace large portions of the human workforce.", category:"technology", specificity_score:3, outcome:"pending", debunked:false, confidence:"medium", actual_event:"Actively unfolding — AI layoffs at Google, Microsoft, Salesforce in 2024-26", years_lead:null, notes:"US Senate estimates AI could displace ~100M jobs over the next decade." },
  { id:11, episode_code:"S11E17", episode_title:"Bart to the Future", season:11, air_date:"2000-03-19", prediction_text:"The first female President of the United States.", category:"politics", specificity_score:3, outcome:"pending", debunked:false, confidence:"medium", actual_event:null, years_lead:null, notes:"The Trump prediction from the same episode came true; the female president half has not yet." },
  { id:12, episode_code:"S27E17", episode_title:"The Marge-ian Chronicles", season:27, air_date:"2016-03-13", prediction_text:"A private company targets 2026 for Mars colonization.", category:"science", specificity_score:4, outcome:"false", debunked:false, confidence:"medium", actual_event:"SpaceX's 2026 Mars target was not met. Cargo missions pushed to 2028+.", years_lead:null, notes:"Direction correct (private Mars missions), but 2026 date definitively missed." },
  { id:13, episode_code:"S09E01", episode_title:"The City of New York vs. Homer Simpson", season:9, air_date:"1997-09-21", prediction_text:"Simpsons 'predicted' 9/11 via a $9 brochure next to Twin Towers imagery.", category:"politics", specificity_score:1, outcome:"false", debunked:true, confidence:"low", actual_event:"September 11 attacks, 2001", years_lead:null, notes:"DEBUNKED — Snopes: requires interpreting '$9' + Twin Towers as '9/11'. Classic confirmation bias. Al Jean: 'The 9/11 one is so bizarre.'" },
  { id:14, episode_code:"UNKNOWN", episode_title:"Fabricated / AI-generated", season:null, air_date:null, prediction_text:"The Simpsons predicted the Beirut explosion via a spliced clip.", category:"politics", specificity_score:1, outcome:"false", debunked:true, confidence:"low", actual_event:"Beirut port explosion, August 4, 2020", years_lead:null, notes:"DEBUNKED — Snopes confirmed the clip was spliced from two unrelated episodes." },
  { id:15, episode_code:"S05E10", episode_title:"$pringfield", season:5, air_date:"1993-12-16", prediction_text:"Siegfried and Roy are attacked by their white tiger during a live performance.", category:"entertainment", specificity_score:4, outcome:"true", debunked:false, confidence:"high", actual_event:"Roy Horn mauled by white Bengal tiger, October 2003", years_lead:10, notes:"Show's parody duo Gunter and Ernst mirrors the real 2003 incident closely." },
];

const CATS = ["all","politics","technology","sports","science","business","entertainment","health"];

const OUTCOME = {
  true:    { label:"Confirmed", cls:"badge-true" },
  false:   { label:"Wrong",     cls:"badge-false" },
  pending: { label:"Pending",   cls:"badge-pending" },
  debunked:{ label:"Debunked",  cls:"badge-debunked" },
};

function getOutcome(p) { return p.debunked ? "debunked" : p.outcome; }

function Dots({ score }) {
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width:6, height:6, borderRadius:"50%",
          background: i <= score ? "#B8903B" : "#f9f7f2",
          border: i <= score ? "1px solid #B8903B" : "1px solid #ccc",
        }}/>
      ))}
    </div>
  );
}

function Card({ p, onClick, lead }) {
  const ok = getOutcome(p);
  const oc = OUTCOME[ok];
  return (
    <div onClick={() => onClick(p)} style={{
      background:"#f9f7f2",
      padding:20,
      cursor:"pointer",
      gridColumn: lead ? "span 2" : undefined,
      borderLeft: lead ? "3px solid #B8903B" : undefined,
      transition:"background 0.12s",
    }}
    onMouseEnter={e => e.currentTarget.style.background="#ece8e0"}
    onMouseLeave={e => e.currentTarget.style.background="#f9f7f2"}
    >
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:9, fontFamily:"'Courier New',monospace", color:"#ccc", letterSpacing:0.5 }}>
          {p.episode_code} · {p.air_date ? p.air_date.slice(0,4) : "—"}
        </span>
        <span style={{
          fontSize:8, letterSpacing:1.5, textTransform:"uppercase", padding:"2px 7px",
          borderRadius:1,
          ...(ok === "true"     ? { background:"#ecf5ec", color:"#2d5a2d", border:"1px solid #b0d0b0" } :
              ok === "pending"  ? { background:"#fdf4e0", color:"#8a6010", border:"1px solid #d8c070" } :
              ok === "false"    ? { background:"#fdf0f0", color:"#7a2a2a", border:"1px solid #d8b0b0" } :
                                  { background:"#f4f0f8", color:"#5a3a7a", border:"1px solid #c0a8e0" })
        }}>
          {oc.label}
        </span>
      </div>
      <p style={{ fontSize: lead ? 13 : 12, lineHeight:1.65, color:"#333", marginBottom:12, fontFamily:"Georgia,serif" }}>
        {p.prediction_text}
      </p>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #e5e1d8", paddingTop:9 }}>
        <span style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:"#ccc" }}>
          {p.category}{p.years_lead ? ` · ${p.years_lead} yr lead` : p.outcome === "pending" ? " · Open" : ""}
        </span>
        <Dots score={p.specificity_score} />
      </div>
    </div>
  );
}

function Modal({ p, onClose }) {
  if (!p) return null;
  const ok = getOutcome(p);
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"#f9f7f2", border:"1px solid #ddd", borderLeft:"4px solid #B8903B",
        borderRadius:0, padding:28, maxWidth:540, width:"100%", maxHeight:"85vh", overflowY:"auto",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
          <span style={{ fontFamily:"'Courier New',monospace", fontSize:11, color:"#aaa" }}>{p.episode_code}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#aaa", cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
        </div>
        <h3 style={{ fontFamily:"Georgia,serif", color:"#B8903B", fontSize:14, marginBottom:4, fontWeight:700 }}>{p.episode_title}</h3>
        {p.air_date && <p style={{ fontSize:11, color:"#aaa", marginBottom:16 }}>Aired {p.air_date}</p>}
        <p style={{ fontFamily:"Georgia,serif", fontSize:14, lineHeight:1.65, color:"#222", marginBottom:16, borderLeft:"3px solid #e5e1d8", paddingLeft:12 }}>
          {p.prediction_text}
        </p>
        {p.actual_event && (
          <div style={{ background: ok === "true" ? "#ecf5ec" : ok === "false" ? "#fdf0f0" : "#fdf4e0", border:"1px solid #ddd", padding:12, marginBottom:14 }}>
            <p style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:4 }}>Outcome</p>
            <p style={{ fontFamily:"Georgia,serif", fontSize:13, color:"#333" }}>{p.actual_event}</p>
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div style={{ background:"#f0ece4", padding:10 }}>
            <p style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:6 }}>Specificity</p>
            <Dots score={p.specificity_score} />
          </div>
          <div style={{ background:"#f0ece4", padding:10 }}>
            <p style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:4 }}>Years in advance</p>
            <p style={{ fontFamily:"Georgia,serif", fontWeight:900, fontSize:22, color:"#B8903B" }}>
              {p.years_lead != null ? `${p.years_lead}` : "—"}
            </p>
          </div>
        </div>
        {p.notes && (
          <div style={{ borderTop:"1px solid #e5e1d8", paddingTop:12 }}>
            <p style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa", marginBottom:6 }}>Analyst note</p>
            <p style={{ fontFamily:"Georgia,serif", fontSize:12, color:"#666", lineHeight:1.6, fontStyle:"italic" }}>{p.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const SpringfieldSkyline = () => (
  <svg style={{ position:"absolute", bottom:0, left:0, right:0, opacity:0.06, pointerEvents:"none", lineHeight:0 }}
    viewBox="0 0 1200 140" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="90" width="1200" height="50" fill="#111"/>
    <rect x="20" y="58" width="46" height="82" fill="#111"/><rect x="34" y="40" width="15" height="20" fill="#111"/><rect x="38" y="22" width="7" height="20" fill="#111"/>
    <rect x="85" y="70" width="33" height="70" fill="#111"/><rect x="95" y="54" width="12" height="18" fill="#111"/>
    <rect x="132" y="44" width="65" height="96" fill="#111"/><rect x="150" y="28" width="24" height="18" fill="#111"/><ellipse cx="162" cy="26" rx="17" ry="11" fill="#111"/>
    <rect x="210" y="74" width="36" height="66" fill="#111"/>
    <rect x="260" y="34" width="56" height="106" fill="#111"/><rect x="274" y="16" width="8" height="20" fill="#111"/><rect x="285" y="16" width="8" height="20" fill="#111"/>
    <rect x="330" y="64" width="32" height="76" fill="#111"/><rect x="335" y="48" width="22" height="18" fill="#111"/>
    <rect x="376" y="38" width="74" height="102" fill="#111"/><rect x="393" y="20" width="40" height="20" fill="#111"/>
    <ellipse cx="413" cy="18" rx="24" ry="13" fill="#111"/><rect x="409" y="2" width="7" height="20" fill="#111"/>
    <rect x="463" y="74" width="28" height="66" fill="#111"/>
    <rect x="505" y="48" width="44" height="92" fill="#111"/><rect x="517" y="32" width="14" height="18" fill="#111"/><ellipse cx="524" cy="30" rx="11" ry="8" fill="#111"/>
    <rect x="562" y="64" width="48" height="76" fill="#111"/><rect x="574" y="46" width="24" height="20" fill="#111"/>
    <rect x="624" y="34" width="58" height="106" fill="#111"/><rect x="636" y="16" width="9" height="20" fill="#111"/><rect x="648" y="16" width="9" height="20" fill="#111"/>
    <rect x="696" y="68" width="38" height="72" fill="#111"/><rect x="706" y="52" width="12" height="18" fill="#111"/>
    <rect x="748" y="42" width="62" height="98" fill="#111"/><ellipse cx="779" cy="40" rx="19" ry="11" fill="#111"/><rect x="776" y="20" width="6" height="24" fill="#111"/>
    <rect x="824" y="58" width="42" height="82" fill="#111"/><rect x="835" y="42" width="20" height="18" fill="#111"/>
    <rect x="880" y="48" width="52" height="92" fill="#111"/><rect x="892" y="30" width="28" height="20" fill="#111"/>
    <rect x="946" y="64" width="36" height="76" fill="#111"/><rect x="956" y="48" width="12" height="18" fill="#111"/>
    <rect x="996" y="54" width="44" height="86" fill="#111"/><rect x="1007" y="34" width="24" height="22" fill="#111"/>
    <rect x="1054" y="66" width="46" height="74" fill="#111"/><rect x="1065" y="48" width="14" height="20" fill="#111"/>
    <rect x="1114" y="68" width="48" height="72" fill="#111"/>
  </svg>
);

export default function SimpsonsIndex() {
  const [tab, setTab] = useState("scoreboard");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let data = PREDICTIONS;
    if (tab === "pending") data = data.filter(p => !p.debunked && p.outcome === "pending");
    if (cat !== "all") data = data.filter(p => p.category === cat);
    return data;
  }, [tab, cat]);

  const counts = {
    true:     PREDICTIONS.filter(p => !p.debunked && p.outcome === "true").length,
    pending:  PREDICTIONS.filter(p => !p.debunked && p.outcome === "pending").length,
    false:    PREDICTIONS.filter(p => !p.debunked && p.outcome === "false").length,
    debunked: PREDICTIONS.filter(p => p.debunked).length,
  };

  const S = { fontFamily:"Georgia,serif" };
  const GOLD = "#B8903B";

  return (
    <div style={{ ...S, background:"#f9f7f2", color:"#111", minHeight:"100vh" }}>

      {/* HERO */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"3px solid #111" }}>
        <SpringfieldSkyline />
        <div style={{ position:"relative", zIndex:2, padding:"28px 36px 20px" }}>
          <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#aaa", marginBottom:10, ...S }}>
            Springfield, USA &nbsp;·&nbsp; <span style={{ color:GOLD, fontWeight:700 }}>Est. 1989</span> &nbsp;·&nbsp; Sunday, March 22 2026
          </div>
          <div style={{ display:"flex", alignItems:"baseline", borderTop:"2px solid #111", borderBottom:"1px solid #ccc", padding:"8px 0", marginBottom:10, gap:14 }}>
            <div style={{ fontSize:48, fontWeight:900, letterSpacing:-2, lineHeight:1, flex:1, ...S }}>
              The Simpsons <span style={{ color:GOLD }}>Index</span>
            </div>
            <div style={{ fontSize:9, letterSpacing:2.5, textTransform:"uppercase", color:"#aaa", borderLeft:"1px solid #ccc", paddingLeft:12, lineHeight:1.9, alignSelf:"flex-end", paddingBottom:3 }}>
              Prediction<br/>Intelligence<br/>Database
            </div>
          </div>
          <div style={{ fontSize:12, color:"#777", fontStyle:"italic", ...S }}>
            790 episodes tracked for predictive accuracy &nbsp;·&nbsp; Every claim scored, sourced and verified against real-world outcomes
          </div>
        </div>
      </div>

      {/* STAT BAR */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderTop:"2px solid #111", borderBottom:"2px solid #111" }}>
        {[
          { num: counts.true,     lbl:"Confirmed true", col:"#2d5a2d" },
          { num: counts.pending,  lbl:"Pending",         col:GOLD },
          { num: counts.false,    lbl:"Wrong",           col:"#7a2a2a" },
          { num: counts.debunked, lbl:"Fake / debunked", col:"#bbb" },
        ].map((s,i) => (
          <div key={i} style={{ padding:"14px 20px", borderRight: i < 3 ? "1px solid #ddd" : "none" }}
            onMouseEnter={e => e.currentTarget.style.background="#f0ece4"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <div style={{ fontSize:30, fontWeight:900, lineHeight:1, marginBottom:3, color:s.col, ...S }}>{s.num}</div>
            <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa" }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* NAV */}
      <div style={{ display:"flex", padding:"0 36px", borderBottom:"1px solid #ddd", background:"#f9f7f2" }}>
        {[["scoreboard","Scoreboard"],["pending","Pending signals"],["browse","All predictions"]].map(([id,lbl]) => (
          <div key={id} onClick={() => setTab(id)} style={{
            padding:"11px 0", marginRight:22, fontSize:10, letterSpacing:2,
            textTransform:"uppercase", cursor:"pointer",
            color: tab === id ? "#111" : "#bbb",
            borderBottom: tab === id ? `2px solid ${GOLD}` : "2px solid transparent",
            marginBottom:-1, transition:"color .12s, border-color .12s",
          }}>{lbl}</div>
        ))}
      </div>

      {/* FILTERS */}
      <div style={{ display:"flex", gap:5, padding:"11px 36px", borderBottom:"1px solid #e5e1d8", background:"#f0ece4", flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:9, letterSpacing:2, color:"#bbb", textTransform:"uppercase", marginRight:4 }}>Filter</span>
        {CATS.map(c => (
          <span key={c} onClick={() => setCat(c)} style={{
            padding:"3px 10px", border:`1px solid ${cat === c ? "#111" : "#ccc"}`,
            fontSize:9, letterSpacing:1.5, textTransform:"uppercase",
            color: cat === c ? "#111" : "#999", cursor:"pointer",
            background: cat === c ? "#fff" : "#f9f7f2",
            transition:"all .12s", ...S,
          }}>{c}</span>
        ))}
      </div>

      {/* CARDS GRID */}
      {tab === "scoreboard" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:1, background:"#d8d4cc" }}>
          {filtered.slice(0,1).map(p => <Card key={p.id} p={p} onClick={setSelected} lead />)}
          {filtered.slice(1).map(p => <Card key={p.id} p={p} onClick={setSelected} />)}
        </div>
      )}

      {tab !== "scoreboard" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:1, background:"#d8d4cc" }}>
          {filtered.map(p => <Card key={p.id} p={p} onClick={setSelected} />)}
          {filtered.length === 0 && (
            <div style={{ gridColumn:"span 3", padding:60, textAlign:"center", color:"#aaa", fontStyle:"italic", ...S }}>
              No predictions match this filter.
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div style={{ padding:"16px 36px", borderTop:"3px solid #111", display:"flex", justifyContent:"space-between", background:"#f9f7f2" }}>
        <span style={{ fontSize:9, letterSpacing:1.5, textTransform:"uppercase", color:"#bbb" }}>
          The Simpsons Index · v2.0 · {PREDICTIONS.length} predictions · 6 sources
        </span>
        <span style={{ fontSize:10, color:"#ccc", fontStyle:"italic", ...S }}>Not financial advice. D'oh.</span>
      </div>

      <Modal p={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
