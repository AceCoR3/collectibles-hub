import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { Activity, Boxes, Cpu, Gamepad2, Gem, Layers3, LogOut, Plus, Trash2, Wallet } from "lucide-react";
import { supabase } from "./lib/supabase";

type Category = "trading_cards" | "gaming" | "electronics";
type Item = { id: string; owner_id: string; title: string; category: Category; brand: string | null; quantity: number; purchase_price: number | null; estimated_unit_value: number | null; created_at: string };
const categories = [
  { id: "trading_cards" as Category, label: "Trading Cards", icon: Layers3 },
  { id: "gaming" as Category, label: "Gaming", icon: Gamepad2 },
  { id: "electronics" as Category, label: "Elektronik", icon: Cpu }
];
const euro = (amount: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
const messageOf = (error: unknown) => error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten.";

function Auth({ onReady }: { onReady: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    try {
      const result = register ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (register && !result.data.session) setMessage("Registrierung eingegangen. Bitte bestätige deine E-Mail, falls Supabase eine Bestätigung verlangt.");
      else onReady();
    } catch (error) { setMessage(messageOf(error)); }
    finally { setBusy(false); }
  }
  return <div className="auth-wrap"><div className="auth-card">
    <div className="brand auth-brand"><span className="brand-icon"><Gem size={24}/></span> COLLECTIBLES <b>HUB</b></div>
    <h1>{register ? "Account erstellen" : "Willkommen zurück"}</h1>
    <p>Dein privates Portfolio für Karten, Gaming und Elektronik.</p>
    <form onSubmit={submit} className="stacked-form">
      <label>E-Mail<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}/></label>
      <label>Passwort<input type="password" minLength={6} autoComplete={register ? "new-password" : "current-password"} required value={password} onChange={e => setPassword(e.target.value)}/></label>
      <button className="primary" disabled={busy}>{busy ? "Bitte warten …" : register ? "Registrieren" : "Anmelden"}</button>
    </form>
    {message && <p role="status" className="form-message">{message}</p>}
    <button className="text-button" onClick={() => {setRegister(!register);setMessage("");}}>{register ? "Bereits registriert? Anmelden" : "Noch kein Konto? Registrieren"}</button>
  </div></div>;
}
function Dashboard({ session }: { session: Session }) {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<Category>("trading_cards");
  const [quantity, setQuantity] = useState("1");
  const [purchase, setPurchase] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) return;
      const { data, error } = await supabase.from("items").select("id,owner_id,title,category,brand,quantity,purchase_price,estimated_unit_value,created_at").order("created_at", {ascending:false});
      if (active) { if (error) setError(error.message); else setItems((data ?? []) as Item[]); }
    }
    void load();
    return () => { active = false; };
  }, [session.user.id]);
  const shown = items.filter(item => filter === "all" || item.category === filter);
  const totals = useMemo(() => items.reduce((acc,item) => ({
    count: acc.count + item.quantity,
    value: acc.value + (item.estimated_unit_value ?? 0) * item.quantity,
    cost: acc.cost + (item.purchase_price ?? 0) * item.quantity
  }), {count:0,value:0,cost:0}), [items]);
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase) return;
    const count = Number(quantity);
    if (!Number.isInteger(count) || count < 1 || (purchase !== "" && (!Number.isFinite(Number(purchase)) || Number(purchase) < 0)) || (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0))) { setError("Bitte gültige Mengen und nichtnegative Preise eingeben."); return; }
    setBusy(true);setError("");
    const {data,error} = await supabase.from("items").insert({owner_id:session.user.id,title:title.trim(),brand:brand.trim() || null,category,quantity:count,purchase_price:purchase === "" ? null : Number(purchase),estimated_unit_value:value === "" ? null : Number(value)}).select("id,owner_id,title,category,brand,quantity,purchase_price,estimated_unit_value,created_at").single();
    if (error) setError(error.message);
    else { setItems(previous => [data as Item,...previous]);setAdding(false);setTitle("");setBrand("");setQuantity("1");setPurchase("");setValue(""); }
    setBusy(false);
  }
  async function remove(item: Item) {
    if (!supabase || !window.confirm(`"${item.title}" wirklich löschen?`)) return;
    const {error} = await supabase.from("items").delete().eq("id",item.id).eq("owner_id",session.user.id);
    if (error) setError(error.message); else setItems(previous => previous.filter(x => x.id !== item.id));
  }
  return <div className="app-container">
    <header className="app-header"><div className="brand"><span className="brand-icon"><Gem size={22}/></span> COLLECTIBLES <b>HUB</b></div><div className="account"><span>{session.user.email}</span><button className="icon-button" title="Abmelden" aria-label="Abmelden" onClick={() => void supabase?.auth.signOut()}><LogOut size={19}/></button></div></header>
    <main className="app-content"><div className="heading"><div><div className="eyebrow">DEIN SAMMLER-COCKPIT</div><h1>Deine Sammlung. Dein Überblick.</h1><p>Dein privates Portfolio – sicher in Supabase gespeichert.</p></div><button className="primary" onClick={() => setAdding(!adding)}><Plus size={18}/> Objekt hinzufügen</button></div>
      {error && <div role="alert" className="notice">{error}<button onClick={() => setError("")}>Schließen</button></div>}
      <div className="metrics">
        <div className="metric"><div className="metric-top">Gesamtwert <Wallet size={19}/></div><strong>{euro(totals.value)}</strong><small>Manuell geschätzter Wert</small></div>
        <div className="metric"><div className="metric-top">Sammlerstücke <Boxes size={19}/></div><strong>{totals.count}</strong><small>Inklusive Stückzahlen</small></div>
        <div className="metric"><div className="metric-top">Wert minus Kaufpreis <Activity size={19}/></div><strong>{euro(totals.value-totals.cost)}</strong><small>Nur aus eingetragenen Werten berechnet</small></div>
      </div>
      {adding && <section className="panel form-panel"><h2>Neues Sammlerstück</h2><form className="item-form" onSubmit={add}>
        <label>Bezeichnung<input required maxLength={250} value={title} onChange={e => setTitle(e.target.value)} placeholder="z. B. Pokémon Glurak"/></label>
        <label>Kategorie<select value={category} onChange={e => setCategory(e.target.value as Category)}>{categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        <label>Marke (optional)<input value={brand} onChange={e => setBrand(e.target.value)} placeholder="z. B. Nintendo"/></label>
        <label>Stückzahl<input type="number" min="1" step="1" required value={quantity} onChange={e => setQuantity(e.target.value)}/></label>
        <label>Kaufpreis pro Stück (€)<input type="number" min="0" step="0.01" value={purchase} onChange={e => setPurchase(e.target.value)}/></label>
        <label>Geschätzter Wert pro Stück (€)<input type="number" min="0" step="0.01" value={value} onChange={e => setValue(e.target.value)}/></label>
        <button className="primary" disabled={busy}>{busy ? "Speichere …" : "In Sammlung speichern"}</button>
      </form></section>}
      <section className="panel inventory-panel"><div className="section-header"><div><h2>Deine Objekte</h2><p>{shown.length} Einträge</p></div></div>
        <div className="filter-row"><button className={filter==="all"?"filter active":"filter"} onClick={() => setFilter("all")}>Alle</button>{categories.map(({id,label,icon:Icon}) => <button key={id} className={filter===id?"filter active":"filter"} onClick={() => setFilter(id)}><Icon size={15}/>{label}</button>)}</div>
        {shown.length === 0 ? <p className="empty-state">Hier ist noch nichts gespeichert. Füge dein erstes Sammlerstück hinzu!</p> :
          <div className="item-list">{shown.map(item => <div className="item-row" key={item.id}><div><strong>{item.title}</strong><p>{categories.find(c => c.id===item.category)?.label} · {item.brand || "Ohne Marke"} · {item.quantity}×</p></div><div className="item-value"><strong>{item.estimated_unit_value === null ? "Nicht bewertet" : euro(item.estimated_unit_value*item.quantity)}</strong><small>Kaufpreis: {item.purchase_price === null ? "–" : euro(item.purchase_price*item.quantity)}</small></div><button className="icon-button" title="Löschen" aria-label={item.title+" löschen"} onClick={() => void remove(item)}><Trash2 size={17}/></button></div>)}</div>}
      </section><footer>Collectibles Hub · Persönliches Portfolio · Keine automatische Preisermittlung in dieser Version</footer>
    </main>
  </div>;
}
export default function App() {
  const [session,setSession] = useState<Session | null>(null);
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    if (!supabase) {setLoading(false);return;}
    const client = supabase;
    void client.auth.getSession().then(({data}) => {setSession(data.session);setLoading(false);}).catch(() => setLoading(false));
    const {data:{subscription}} = client.auth.onAuthStateChange((_event,current) => {setSession(current);setLoading(false);});
    return () => subscription.unsubscribe();
  },[]);
  if (!supabase) return <div className="auth-wrap"><div className="auth-card"><h1>Supabase noch nicht verbunden</h1><p>Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in Cloudflare Pages als Umgebungsvariablen hinterlegen und neu deployen.</p></div></div>;
  if (loading) return <div className="auth-wrap">Lade Collectibles Hub …</div>;
  return session ? <Dashboard key={session.user.id} session={session}/> : <Auth onReady={() => undefined}/>;
}
