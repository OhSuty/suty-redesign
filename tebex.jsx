// ─── Tebex live data layer ─────────────────────────────────────────────
//
// Public Tebex Headless token — safe to embed client-side. Same one
// suty.dev uses for browser-side basket calls.
const TEBEX_TOKEN  = "ozf2-6e478a04ed7106b15e7339397e5f3a406f8dde3b";
const TEBEX_API    = "https://headless.tebex.io/api";
const DISCORD_URL  = "https://discord.gg/suty";
const STORAGE_KEY  = "suty.basketIdent";

// ── Utilities ────────────────────────────────────────────────────────
// Use DOMParser (not innerHTML) — parses HTML inertly without executing
// scripts or inline event handlers, even from admin-authored content.
function stripHtml(html){
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  } catch {
    return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
}

// "Queue System (QBX/QBCore/ESX)" → "Queue System"
function cleanProductName(name){
  if (!name) return "";
  return name.replace(
    /\s*\(\s*[^)]*(?:ESX|QBCore|QBOX|QBox|QBX|Standalone)[^)]*\)\s*$/i,
    ""
  ).trim();
}

function detectFrameworks(text){
  const t = (text || "").toLowerCase();
  const out = [];
  if (/qbx|qbox/.test(t)) out.push("qbx");
  if (/qbcore/.test(t))   out.push("qbcore");
  if (/esx/.test(t))      out.push("esx");
  return out.length ? out : ["qbx", "qbcore", "esx"];
}

function mapCategory(cat){
  if (!cat) return "Systems";
  const n = String(cat).toLowerCase();
  if (n.includes("ui") || n.includes("hud") || n.includes("menu")) return "UI";
  if (n.includes("roleplay") || n.includes("rp") || n.includes("animation")) return "Roleplay";
  if (n.includes("utility") || n.includes("admin")) return "Utility";
  return "Systems";
}

function isRecentlyCreated(iso, days = 30){
  if (!iso) return false;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return false;
  return (Date.now() - then) / (1000 * 60 * 60 * 24) < days;
}

function formatPrice(amount, currency){
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD"
    }).format(Number(amount) || 0);
  } catch {
    return "$" + (Number(amount) || 0).toFixed(2);
  }
}

// Map a Tebex package → the script shape the redesign's UI expects
function adaptPackage(pkg){
  const displayName = cleanProductName(pkg.name);
  return {
    id: pkg.id, // numeric Tebex package id
    name: pkg.name,
    displayName,
    category: mapCategory(pkg.category && pkg.category.name),
    price: pkg.total_price,
    currency: pkg.currency,
    image: pkg.image,
    frameworks: detectFrameworks(pkg.name + " " + (pkg.description || "")),
    description: stripHtml(pkg.description),
    isNew: isRecentlyCreated(pkg.created_at),
    type: pkg.type === "subscription" ? "subscription" : "single",
    createdAt: pkg.created_at,
    order: typeof pkg.order === "number" ? pkg.order : Number.MAX_SAFE_INTEGER,
    raw: pkg
  };
}

// ── REST calls ───────────────────────────────────────────────────────
async function fetchPackages(){
  const res = await fetch(`${TEBEX_API}/accounts/${TEBEX_TOKEN}/packages`, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) throw new Error(`Tebex packages ${res.status}`);
  const json = await res.json();
  const list = (json.data || []).map(adaptPackage);
  list.sort((a, b) => a.order - b.order);
  return list;
}

async function createBasket(){
  const origin = window.location.origin;
  const res = await fetch(`${TEBEX_API}/accounts/${TEBEX_TOKEN}/baskets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      complete_url: `${origin}/?checkout=success`,
      cancel_url:   `${origin}/?checkout=cancelled`,
      complete_auto_redirect: true
    })
  });
  if (!res.ok) throw new Error(`Tebex createBasket ${res.status}`);
  return (await res.json()).data;
}

async function getBasket(ident){
  const res = await fetch(`${TEBEX_API}/accounts/${TEBEX_TOKEN}/baskets/${ident}`, {
    headers: { Accept: "application/json" }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Tebex getBasket ${res.status}`);
  return (await res.json()).data;
}

class BasketAuthRequiredError extends Error {
  constructor(){ super("Basket requires authentication"); this.requiresAuth = true; }
}

async function addPackageToBasket(ident, packageId, quantity = 1){
  const res = await fetch(`${TEBEX_API}/baskets/${ident}/packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ package_id: packageId, quantity })
  });
  if (res.status === 422) {
    const body = await res.text().catch(() => "");
    if (/login/i.test(body)) throw new BasketAuthRequiredError();
    throw new Error(`Tebex addPackage 422: ${body.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`Tebex addPackage ${res.status}`);
  return (await res.json()).data;
}

async function removePackageFromBasket(ident, packageId){
  const res = await fetch(`${TEBEX_API}/baskets/${ident}/packages/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ package_id: packageId })
  });
  if (!res.ok) throw new Error(`Tebex removePackage ${res.status}`);
  return (await res.json()).data;
}

async function getBasketAuthUrls(ident, returnUrl){
  const params = new URLSearchParams({ returnUrl });
  const res = await fetch(
    `${TEBEX_API}/accounts/${TEBEX_TOKEN}/baskets/${ident}/auth?${params.toString()}`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`Tebex authUrls ${res.status}`);
  return await res.json();
}

// ── Live scripts context ─────────────────────────────────────────────
const ScriptsContext = React.createContext({ packages: [], loading: true, error: null });

function ScriptsProvider({ children }){
  const [state, setState] = React.useState({ packages: [], loading: true, error: null });

  React.useEffect(() => {
    let cancelled = false;
    fetchPackages()
      .then((packages) => {
        if (cancelled) return;
        setState({ packages, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[tebex] falling back to mock data:", err);
        // Fall back to mock SCRIPTS so the UI still renders
        const fallback = (window.SCRIPTS || []).map((s, i) => ({
          ...s,
          // mock ids might collide with Tebex ids if user mixes — keep them as strings
          id: typeof s.id === "string" ? `mock-${s.id}` : s.id,
          currency: "USD",
          order: i
        }));
        setState({ packages: fallback, loading: false, error: err.message || String(err) });
      });
    return () => { cancelled = true; };
  }, []);

  return <ScriptsContext.Provider value={state}>{children}</ScriptsContext.Provider>;
}

function useScripts(){ return React.useContext(ScriptsContext); }

// ── Expose ───────────────────────────────────────────────────────────
window.Tebex = {
  TOKEN: TEBEX_TOKEN,
  API: TEBEX_API,
  DISCORD_URL,
  STORAGE_KEY,
  fetchPackages,
  createBasket,
  getBasket,
  addPackageToBasket,
  removePackageFromBasket,
  getBasketAuthUrls,
  BasketAuthRequiredError,
  cleanProductName,
  formatPrice
};
Object.assign(window, { ScriptsProvider, useScripts });
