// ─── Tebex live data layer ─────────────────────────────────────────────
//
// Public Tebex Headless token — safe to embed client-side. Same one
// suty.dev uses for browser-side basket calls.
const TEBEX_TOKEN  = "ozf2-6e478a04ed7106b15e7339397e5f3a406f8dde3b";
const TEBEX_API    = "https://headless.tebex.io/api";
const DISCORD_URL  = "https://discord.gg/suty";
const STORAGE_KEY  = "suty.basketIdent";
const PENDING_KEY  = "suty.pendingPackage";

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

// ── Inline media — bare image / video URLs become real <img>/<video> ──
const IMG_EXT_RE   = /\.(gif|png|jpe?g|webp|avif)(?:\?[^\s"'<>]*)?$/i;
const VID_EXT_RE   = /\.(mp4|webm|mov)(?:\?[^\s"'<>]*)?$/i;
const BARE_URL_RE  = /(https?:\/\/[^\s"'<>)\]]+)/g;

function isImageUrl(u){ const q = u.split("?")[0]; return IMG_EXT_RE.test(q) || IMG_EXT_RE.test(u); }
function isVideoUrl(u){ const q = u.split("?")[0]; return VID_EXT_RE.test(q) || VID_EXT_RE.test(u); }

function mediaTagFor(url){
  if (isVideoUrl(url)) {
    return `<video src="${url}" controls playsinline preload="metadata" class="inline-media inline-media-video"></video>`;
  }
  return `<img src="${url}" alt="" loading="lazy" class="inline-media inline-media-image" />`;
}

// Walks an HTML string and replaces bare image/video URLs with the actual
// media element, both inside <a> tags (where the visible text == the href)
// and in raw text nodes. Tebex descriptions often paste a r2.fivemanage.com
// URL hoping it'll render — this makes it render.
function inlineMediaInHtml(html){
  if (!html) return html;
  let out = String(html);

  // <a href="X.gif">X.gif</a>  →  <img src="X.gif">  (only when anchor text matches the URL)
  out = out.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (match, href, innerHtml) => {
      const url = href.trim();
      if (!isImageUrl(url) && !isVideoUrl(url)) return match;
      const innerText = innerHtml.replace(/<[^>]+>/g, "").trim();
      if (innerText && innerText !== url) {
        try { if (innerText === encodeURI(url)) return mediaTagFor(url); } catch {}
        return match; // custom anchor text — leave as link
      }
      return mediaTagFor(url);
    }
  );

  // Bare URLs in text nodes (between tags, not inside attributes)
  out = out.replace(/>([^<]+)</g, (_m, text) => {
    const replaced = text.replace(BARE_URL_RE, (url) =>
      (isImageUrl(url) || isVideoUrl(url)) ? mediaTagFor(url) : url
    );
    return `>${replaced}<`;
  });

  return out;
}

// ── Video extraction (for product detail hero) ───────────────────────
function extractFirstVideoUrl(text){
  if (!text) return null;
  const patterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?[^\s"'<>&]*v=[A-Za-z0-9_-]{11}[^\s"'<>]*/i,
    /https?:\/\/(?:www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]{11}[^\s"'<>]*/i,
    /https?:\/\/(?:www\.)?youtube\.com\/shorts\/[A-Za-z0-9_-]{11}[^\s"'<>]*/i,
    /https?:\/\/youtu\.be\/[A-Za-z0-9_-]{11}[^\s"'<>]*/i,
    /https?:\/\/(?:www\.)?vimeo\.com\/\d+[^\s"'<>]*/i
  ];
  for (const re of patterns) {
    const m = String(text).match(re);
    if (m) return m[0].split("&amp;")[0].replace(/[")\.,;]+$/, "");
  }
  return null;
}

function toEmbedUrl(url){
  if (!url) return url;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch { return url; }
}

// Defense-in-depth XSS scrub for admin-authored Tebex HTML. Same posture
// as the docs build script — strip <script>, on* event attrs, javascript:.
function scrubHtml(html){
  return String(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*"\s*(?:javascript|data):[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'\s*(?:javascript|data):[^']*'/gi, "$1='#'");
}

// Map a Tebex package → the script shape the redesign's UI expects
function adaptPackage(pkg){
  const displayName  = cleanProductName(pkg.name);
  const rawDesc      = pkg.description || "";
  const videoUrl     = extractFirstVideoUrl(rawDesc);
  // Description that drives the rich detail-page rendering: scrubbed for XSS,
  // bare image/video URLs inlined as real media tags.
  const descriptionHtml = inlineMediaInHtml(scrubHtml(rawDesc));
  return {
    id: pkg.id, // numeric Tebex package id
    name: pkg.name,
    displayName,
    // Use the real Tebex category name ("Scripts" / "Free") rather than
    // synthesising fake buckets — matches what the panel shows.
    category: (pkg.category && pkg.category.name) || "Scripts",
    categoryId: pkg.category && pkg.category.id,
    price: pkg.total_price,
    currency: pkg.currency,
    image: pkg.image,
    frameworks: detectFrameworks(pkg.name + " " + rawDesc),
    description:     stripHtml(rawDesc),   // plain text fallback
    descriptionHtml,                       // rich HTML for the detail page
    videoUrl,                              // first YouTube/Vimeo URL in desc, or null
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

  // Mark ONLY the single most-recently-created package as new — the
  // adapter marks anything within 30 days, which can produce 3-4 'NEW'
  // badges at once. Restrict to the latest drop so the badge actually
  // means 'this is the freshest one'. Still gated by the 30-day window
  // so an old catalog with no recent releases shows no badge at all.
  let newestIdx = -1;
  let newestTime = -Infinity;
  list.forEach((p, i) => {
    if (!p.createdAt) return;
    const t = new Date(p.createdAt).getTime();
    if (Number.isFinite(t) && t > newestTime) {
      newestTime = t;
      newestIdx = i;
    }
  });
  list.forEach((p) => { p.isNew = false; });
  if (newestIdx !== -1 && isRecentlyCreated(list[newestIdx].createdAt)) {
    list[newestIdx].isNew = true;
  }

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
  PENDING_KEY,
  fetchPackages,
  createBasket,
  getBasket,
  addPackageToBasket,
  removePackageFromBasket,
  getBasketAuthUrls,
  BasketAuthRequiredError,
  cleanProductName,
  formatPrice,
  inlineMediaInHtml,
  extractFirstVideoUrl,
  toEmbedUrl,
  scrubHtml
};
Object.assign(window, { ScriptsProvider, useScripts });
