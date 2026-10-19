import { useState } from "react";
import { Activity, ArrowUpRight, Boxes, ChartNoAxesCombined, Cpu, Gamepad2, Gem, Layers3, Menu, Plus, Search, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type Category = "Alle" | "Trading Cards" | "Gaming" | "Elektronik";
const categories: { label: Exclude<Category, "Alle">; description: string; icon: typeof Boxes }[] = [
  { label: "Trading Cards", description: "Pokémon, Yu-Gi-Oh!, Magic & mehr", icon: Layers3 },
  { label: "Gaming", description: "Konsolen, Spiele & Zubehör", icon: Gamepad2 },
  { label: "Elektronik", description: "Hardware, Smartphones & Geräte", icon: Cpu }
];
const history = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun"].map(month => ({ month, value: 0 }));
export default function App() {
  const [category, setCategory] = useState<Category>("Alle");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(false);
  const visible = categories.filter(item => (category === "Alle" || item.label === category) && item.label.toLowerCase().includes(search.toLowerCase()));
  const navigate = (next: Category) => { setCategory(next); setMenuOpen(false); };
  return <div className="shell">
    <aside className={`sidebar ${menuOpen ? "opened" : ""}`}>
      <div className="brand"><span className="brand-icon"><Gem size={23}/></span><span>COLLECTIBLES <b>HUB</b></span><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Menü schließen"><X size={18}/></button></div>
      <div className="sidebar-label">WORKSPACE</div>
      <nav aria-label="Hauptnavigation">
        <button className={category === "Alle" ? "nav active" : "nav"} onClick={() => navigate("Alle")}><ChartNoAxesCombined size={19}/> Dashboard</button>
        {categories.map(({ label, icon: Icon }) => <button key={label} className={category === label ? "nav active" : "nav"} onClick={() => navigate(label)}><Icon size={19}/> {label}</button>)}
      </nav>
      <div className="sidebar-bottom"><ShieldCheck size={19}/> Zwei private Portfolios <small>Login und Datenbank werden im nächsten Schritt aktiviert.</small></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Menü öffnen"><Menu/></button><div>Workspace <span className="slash">/</span> <strong>{category === "Alle" ? "Dashboard" : category}</strong></div><span className="demo-pill">● Designvorschau</span></header>
      <div className="content">
        <div className="heading"><div><div className="eyebrow"><Sparkles size={15}/> DEIN SAMMLER-COCKPIT</div><h1>{category === "Alle" ? "Deine Sammlung. Dein Überblick." : category}</h1><p>Trading Cards, Games und Elektronik in einem einzigen Hub.</p></div><button className="primary" onClick={() => setNotice(true)}><Plus size={18}/> Objekt hinzufügen</button></div>
        {notice && <div className="notice" role="status"><span>Die Objektverwaltung folgt mit Supabase. Diese Version ist eine reine Designvorschau, ohne Datenspeicherung.</span><button onClick={() => setNotice(false)} aria-label="Hinweis schließen"><X size={18}/></button></div>}
        <div className="metrics">
          <div className="metric"><div className="metric-top"><span>Gesamtwert</span><Wallet size={19}/></div><strong>0,00 €</strong><small>Noch keine Objekte erfasst</small></div>
          <div className="metric"><div className="metric-top"><span>Sammlerstücke</span><Boxes size={19}/></div><strong>0</strong><small>Über alle Kategorien</small></div>
          <div className="metric"><div className="metric-top"><span>Wertentwicklung</span><Activity size={19}/></div><strong>—</strong><small>Nach erster Bewertung verfügbar</small></div>
        </div>
        <section className="panel chart-panel"><div className="section-header"><div><h2>Portfolio-Entwicklung</h2><p>Deine Marktwerte im Zeitverlauf</p></div><span className="chip">6 Monate</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history} margin={{top:10,right:10,left:-30,bottom:0}}><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a77aff" stopOpacity={0.27}/><stop offset="95%" stopColor="#a77aff" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#2c3040" strokeDasharray="3 5"/><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill:"#8d93ab",fontSize:12}}/><Tooltip contentStyle={{background:"#1b1d2a",border:"1px solid #343749",borderRadius:12}}/><Area type="monotone" dataKey="value" stroke="#a77aff" fill="url(#area)" strokeWidth={3}/></AreaChart></ResponsiveContainer><div className="chart-empty">Nach deinen ersten Bewertungen erscheint hier die Wertentwicklung.</div></div></section>
        <div className="section-header collections-title"><div><h2>Deine Kategorien</h2><p>Wähle einen Bereich für deine Sammlung</p></div><label className="search"><Search size={17}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Kategorie suchen" aria-label="Kategorie suchen"/></label></div>
        <div className="category-grid">{visible.map(({label,description,icon:Icon}) => <button className="category-card" key={label} onClick={() => navigate(label)}><span className="category-icon"><Icon size={27}/></span><span className="category-name">{label}</span><span className="category-description">{description}</span><span className="category-footer">0 Objekte <ArrowUpRight size={19}/></span></button>)}{visible.length === 0 && <p>Keine passende Kategorie gefunden.</p>}</div>
        <footer>Collectibles Hub · UI-Prototyp v0.1 · Keine echten Sammlungsdaten</footer>
      </div>
    </main>
  </div>;
}