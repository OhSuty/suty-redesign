// ─── Shared UI primitives ──────────────────────────────────────────────

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// ── Icons (lucide), thin wrapper so JSX stays clean ─────────────────────
const _iconCache = {};
function pascalize(name) {
  if (_iconCache[name]) return _iconCache[name];
  const p = name.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  _iconCache[name] = p;
  return p;
}
// kebab → camel for SVG attrs (React)
function reactizeAttrs(attrs) {
  const out = {};
  for (const k in attrs) {
    if (k.indexOf("-") === -1) { out[k] = attrs[k]; continue; }
    out[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = attrs[k];
  }
  return out;
}
function Icon({ name, size = 16, className = "", strokeWidth = 1.75, ...rest }) {
  const data = window.lucide && window.lucide.icons && window.lucide.icons[pascalize(name)];
  if (!data) {
    return <span className={"inline-block " + className} style={{ width: size, height: size }} />;
  }
  const [, , children] = data;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"inline-block " + className}
      style={{ flexShrink: 0 }}
      {...rest}
    >
      {children.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...reactizeAttrs(attrs) }))}
    </svg>
  );
}

// ── Section title (centered, with mini eyebrow) ─────────────────────────
function SectionEyebrow({ children }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
      <span className="w-6 h-px bg-[var(--border-2)]"></span>
      {children}
      <span className="w-6 h-px bg-[var(--border-2)]"></span>
    </div>
  );
}

// ── Pulsing chip / badge ───────────────────────────────────────────────
function Chip({ children, dot = true }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-2)] text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
      {dot && (
        <span className="relative w-1.5 h-1.5 rounded-full">
          <span className="block w-1.5 h-1.5 rounded-full bg-[var(--accent-hover)] pulse-dot"></span>
        </span>
      )}
      {children}
    </div>
  );
}

// ── Buttons ────────────────────────────────────────────────────────────
function ButtonPrimary({ children, className = "", icon, ...rest }) {
  return (
    <button {...rest} className={"btn-primary inline-flex items-center justify-center gap-2 px-5 h-11 rounded-md text-sm font-semibold " + className}>
      {children}
      {icon}
    </button>
  );
}
function ButtonGhost({ children, className = "", icon, ...rest }) {
  return (
    <button {...rest} className={"btn-ghost inline-flex items-center justify-center gap-2 px-5 h-11 rounded-md text-sm font-semibold " + className}>
      {children}
      {icon}
    </button>
  );
}

// ── Reveal wrapper: single-element scroll-triggered pop-in ─────────────
// Use this for headings, hero blocks, individual cards.
// For grids/lists where you want index-based stagger, use the
// `useReveal` hook below + put `className="reveal"` on each child.
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return <div ref={ref} className={"reveal " + className} style={style}>{children}</div>;
}

// ── Reveal hook (for grids — staggers `.reveal` children by index) ────
function useReveal({ stagger = 60 } = {}) {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const i = Number(e.target.dataset.idx || 0);
          e.target.style.transitionDelay = `${i * stagger}ms`;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach((el, i) => { el.dataset.idx = i; io.observe(el); });
    return () => io.disconnect();
  }, []);
  return rootRef;
}

// ── Framework badge — official logo + accent color (matches suty.dev) ──
function FrameworkBadge({ kind, size = "sm", className = "" }) {
  const meta = FRAMEWORK_META[kind];
  const label = (meta && meta.label) || FRAMEWORK_LABEL[kind] || kind;
  const sizing = size === "lg"
    ? "h-9 px-3 gap-2 text-xs"
    : "h-6 px-2.5 gap-1.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/10 bg-black/40 font-semibold ${sizing} ${className}`}
      style={meta ? { color: meta.color } : undefined}
    >
      {meta && meta.image && (
        <img
          src={meta.image}
          alt=""
          className={size === "lg" ? "h-4 w-4 object-contain" : "h-3.5 w-3.5 object-contain"}
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}

// ── Cart context (real Tebex basket) ───────────────────────────────────
const CartContext = createContext(null);
function CartProvider({ children }) {
  const [basket, setBasket]               = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [optimisticAdds, setOptimisticAdds] = useState(0);
  const [bumpKey, setBumpKey]             = useState(0);

  // Promise-singleton for basket creation: prevents duplicate baskets
  // when the user spam-clicks Add before the first basket finishes.
  const basketCreationRef = useRef(null);
  // Serialise addItem calls so server sees them in order.
  const addQueueRef = useRef(Promise.resolve());

  // Hydrate from localStorage on mount
  useEffect(() => {
    const ident = localStorage.getItem(Tebex.STORAGE_KEY);
    if (!ident) return;
    Tebex.getBasket(ident).then((b) => {
      if (b && !b.complete) setBasket(b);
      else localStorage.removeItem(Tebex.STORAGE_KEY);
    }).catch(() => { /* network blip — leave alone */ });
  }, []);

  // Refresh on tab focus (catches return-from-FiveM-auth)
  useEffect(() => {
    const refresh = () => {
      const ident = localStorage.getItem(Tebex.STORAGE_KEY);
      if (!ident) return;
      Tebex.getBasket(ident).then((b) => {
        if (b && !b.complete) setBasket(b);
        else { localStorage.removeItem(Tebex.STORAGE_KEY); setBasket(null); }
      }).catch(() => {});
    };
    const onVis = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Once real basket catches up to optimistic count, clear it
  useEffect(() => {
    if (optimisticAdds === 0 || !basket) return;
    const real = (basket.packages || []).reduce(
      (s, p) => s + ((p.in_basket && p.in_basket.quantity) || p.quantity || 1), 0
    );
    if (real > 0) setOptimisticAdds(0);
  }, [basket, optimisticAdds]);

  const ensureBasket = useCallback(async () => {
    if (basket) return basket;
    if (basketCreationRef.current) return basketCreationRef.current;
    basketCreationRef.current = (async () => {
      try {
        const b = await Tebex.createBasket();
        localStorage.setItem(Tebex.STORAGE_KEY, b.ident);
        setBasket(b);
        return b;
      } catch (err) {
        basketCreationRef.current = null;
        throw err;
      }
    })();
    return basketCreationRef.current;
  }, [basket]);

  const add = useCallback(async (script) => {
    // Mock-script ids are strings like "mock-queue" — can't be added to Tebex
    if (typeof script.id !== "number") {
      setError("Live catalogue isn't available right now — try again in a sec.");
      return;
    }
    setOptimisticAdds((n) => n + 1);
    setBumpKey((k) => k + 1);

    const work = async () => {
      setLoading(true);
      setError(null);
      try {
        const b = await ensureBasket();
        try {
          const updated = await Tebex.addPackageToBasket(b.ident, script.id, 1);
          setBasket(updated);
        } catch (err) {
          if (err && err.requiresAuth) {
            // FiveM auth required → redirect through Tebex
            const returnUrl = `${window.location.origin}/?fivem=return`;
            const authUrls = await Tebex.getBasketAuthUrls(b.ident, returnUrl);
            const fivem = (authUrls || []).find(
              (u) => u.name && u.name.toLowerCase() === "fivem"
            ) || (authUrls || [])[0];
            if (fivem && fivem.url) { window.location.href = fivem.url; return; }
            throw new Error("No authentication provider available for this basket.");
          }
          throw err;
        }
      } catch (err) {
        setOptimisticAdds((n) => Math.max(0, n - 1));
        setError((err && err.message) || String(err));
      } finally {
        setLoading(false);
      }
    };

    const next = addQueueRef.current.then(() => work(), () => work());
    addQueueRef.current = next.catch(() => undefined);
    return next;
  }, [ensureBasket]);

  const removeById = useCallback(async (packageId) => {
    if (!basket) return;
    setLoading(true);
    try {
      const updated = await Tebex.removePackageFromBasket(basket.ident, packageId);
      setBasket(updated);
    } catch (err) {
      setError((err && err.message) || String(err));
    } finally {
      setLoading(false);
    }
  }, [basket]);

  // Legacy idx-based remove (CartDrawer calls remove(i))
  const remove = useCallback((idx) => {
    if (!basket || !basket.packages[idx]) return;
    return removeById(basket.packages[idx].id);
  }, [basket, removeById]);

  const items = useMemo(() => {
    if (!basket) return [];
    return basket.packages.map((p) => ({
      id: p.id,
      name: Tebex.cleanProductName(p.name),
      price: ((p.in_basket && p.in_basket.price) || 0) *
             ((p.in_basket && p.in_basket.quantity) || p.quantity || 1)
    }));
  }, [basket]);

  const realCount = useMemo(() => {
    if (!basket) return 0;
    return basket.packages.reduce(
      (s, p) => s + ((p.in_basket && p.in_basket.quantity) || p.quantity || 1), 0
    );
  }, [basket]);
  const count = Math.max(realCount, realCount + optimisticAdds);

  const value = useMemo(() => ({
    items, add, remove, removeById,
    bumpKey, count,
    basket, loading, error,
    checkoutUrl: basket && basket.links && basket.links.checkout,
    currency: (basket && basket.currency) || "USD",
    total: (basket && basket.total_price) || 0
  }), [items, add, remove, removeById, bumpKey, count, basket, loading, error]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
function useCart() { return useContext(CartContext); }

// ── Avatar ─────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  const style = { ...avatarStyle(name), width: size, height: size };
  const initials = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase();
  return (
    <div className="avatar rounded-full grid place-items-center text-[10px] font-bold tracking-wider text-white/70" style={style}>
      {initials}
    </div>
  );
}

// ── Logo — official suty.dev wordmark image ────────────────────────────
function Logo({ size = 40 }) {
  return (
    <img
      src="/suty.png"
      alt="Suty"
      style={{ height: size, width: "auto" }}
      className="block select-none"
      draggable={false}
    />
  );
}

// ── Discord button (matches suty.dev's AuthNav signed-out state) ───────
function DiscordLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.893.077.077 0 0 0-.041.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
function DiscordButton() {
  return (
    <a
      href={Tebex.DISCORD_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join our Discord"
      title="Join our Discord"
      className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-hover)]"
    >
      <DiscordLogo />
    </a>
  );
}

// ── FiveM connect button (uses live basket auth — matches suty.dev) ────
function FivemButton() {
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const connected = !!(cart.basket && cart.basket.username);
  const username  = cart.basket && cart.basket.username;

  async function onClick() {
    if (connected || loading) return;
    setLoading(true);
    try {
      let ident = cart.basket && cart.basket.ident;
      if (!ident) {
        const fresh = await Tebex.createBasket();
        localStorage.setItem(Tebex.STORAGE_KEY, fresh.ident);
        ident = fresh.ident;
      }
      const returnUrl = `${window.location.origin}/?fivem=return`;
      const urls  = await Tebex.getBasketAuthUrls(ident, returnUrl);
      const fivem = (urls || []).find((u) => u.name && u.name.toLowerCase() === "fivem")
                  || (urls || [])[0];
      if (fivem && fivem.url) { window.location.href = fivem.url; return; }
    } catch (err) {
      console.error("FiveM connect failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading || connected}
      aria-label={connected ? `FiveM connected as ${username}` : "Connect FiveM account"}
      title={connected ? `FiveM: ${username}` : "Connect FiveM"}
      className={
        "flex h-10 w-10 items-center justify-center rounded-md transition-colors disabled:cursor-default disabled:opacity-70 " +
        (connected
          ? "border border-[var(--accent)] bg-transparent"
          : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] cursor-pointer")
      }
    >
      <img
        src="https://r2.fivemanage.com/CZREz3HGpG2hkho5t3Mth/FiveM-Logo.png"
        alt=""
        className="h-5 w-5 object-contain"
        aria-hidden
      />
    </button>
  );
}

// ── Header / nav ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "scripts",        label: "Scripts" },
  { id: "subscriptions",  label: "Subscriptions" },
  { id: "docs",           label: "Docs" },
  { id: "about",          label: "About" }
];

function Header({ page, setPage, onOpenCart }) {
  const cart = useCart();
  const [bumped, setBumped] = useState(false);
  useEffect(() => {
    if (cart.bumpKey === 0) return;
    setBumped(true);
    const t = setTimeout(() => setBumped(false), 340);
    return () => clearTimeout(t);
  }, [cart.bumpKey]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-black/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => setPage("home")} className="flex items-center group" aria-label="Suty — home">
          <Logo size={40} />
        </button>

        <nav className="hidden md:flex items-center pill-nav rounded-full p-1">
          {NAV_ITEMS.map((it) => {
            const active = page === it.id || (it.id === "scripts" && page === "scripts");
            return (
              <button
                key={it.id}
                onClick={() => setPage(it.id)}
                className={"pill-link px-4 h-8 rounded-full text-[13px] font-medium " + (active ? "active" : "")}
              >
                {it.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <DiscordButton />
          <FivemButton />
          <button onClick={onOpenCart} aria-label="Open cart" className="relative h-10 w-10 grid place-items-center rounded-md border border-[var(--border-2)] hover:border-[#3a3a3a] hover:bg-white/[0.03] transition">
            <Icon name="shopping-bag" size={15} />
            {cart.count > 0 && (
              <span
                key={cart.bumpKey}
                className={"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[var(--accent)] text-white text-[10px] font-bold " + (bumped ? "cart-bump" : "")}
                style={{ boxShadow: "0 0 12px rgba(153,27,27,0.6), inset 0 1px 0 rgba(255,255,255,0.25)" }}
              >
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer className="border-t border-[var(--border)] mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Logo size={56} />
          <p className="mt-4 text-sm text-[var(--fg-muted)] max-w-sm leading-relaxed">
            Premium FiveM scripts built for communities that care about how things <span className="italic text-white/90">feel</span>.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {["github","message-circle","twitter","youtube"].map((n) => (
              <a key={n} href="#" className="h-9 w-9 grid place-items-center rounded-md border border-[var(--border-2)] hover:border-[#3a3a3a] hover:bg-white/[0.03] transition text-white/70 hover:text-white">
                <Icon name={n} size={14} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-dim)] mb-4">Shop</div>
          <ul className="space-y-2.5 text-sm">
            <li><button onClick={() => setPage("scripts")} className="hover-underline text-white/80 hover:text-white">All scripts</button></li>
            <li><button onClick={() => setPage("subscriptions")} className="hover-underline text-white/80 hover:text-white">Subscriptions</button></li>
            <li><a href="#" className="hover-underline text-white/80 hover:text-white">Changelog</a></li>
            <li><a href="#" className="hover-underline text-white/80 hover:text-white">Roadmap</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-dim)] mb-4">Resources</div>
          <ul className="space-y-2.5 text-sm">
            <li><button onClick={() => setPage("docs")} className="hover-underline text-white/80 hover:text-white">Documentation</button></li>
            <li><a href="#" className="hover-underline text-white/80 hover:text-white">License</a></li>
            <li><a href="#" className="hover-underline text-white/80 hover:text-white">Refund policy</a></li>
            <li><button onClick={() => setPage("about")} className="hover-underline text-white/80 hover:text-white">About</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between text-xs text-[var(--fg-dim)]">
          <div>© {new Date().getFullYear()} Suty Studios — Not affiliated with Rockstar Games or Cfx.re.</div>
          <div className="font-mono">v3.14.2 · all systems operational</div>
        </div>
      </div>
    </footer>
  );
}

// ── Cart drawer ───────────────────────────────────────────────────────
function CartDrawer({ open, onClose }) {
  const cart = useCart();
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const total = cart.items.reduce((s, it) => s + it.price, 0);

  return (
    <React.Fragment>
      <div
        onClick={onClose}
        className={"fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 " + (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
      />
      <aside
        className={"fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[var(--surface)] border-l border-[var(--border)] z-[61] flex flex-col transition-transform duration-[400ms]"}
        style={{ transform: open ? "translateX(0)" : "translateX(100%)", transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Icon name="shopping-bag" size={15} />
            <span className="font-semibold tracking-tight">Your cart</span>
            <span className="text-[var(--fg-muted)] text-sm">({cart.count})</span>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/[0.05] text-white/70 hover:text-white transition">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.items.length === 0 ? (
            <div className="card rounded-xl p-8 text-center mt-6">
              <div className="mx-auto h-12 w-12 grid place-items-center rounded-full border border-[var(--border-2)] mb-4 text-white/60">
                <Icon name="shopping-bag" size={18} />
              </div>
              <div className="font-semibold mb-1">Empty for now</div>
              <p className="text-sm text-[var(--fg-muted)] max-w-[260px] mx-auto leading-relaxed">Browse the catalogue and queue up a few scripts — we’ll keep them right here.</p>
              <ButtonPrimary className="mt-5" onClick={onClose}>Keep browsing</ButtonPrimary>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.items.map((it, i) => (
                <li key={i} className="card rounded-lg p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{it.name}</div>
                    <div className="text-[var(--fg-muted)] text-xs">Lifetime · 1 community</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-sm">${it.price.toFixed(2)}</div>
                    <button onClick={() => cart.remove(i)} className="h-7 w-7 grid place-items-center rounded-md text-white/50 hover:text-white hover:bg-white/[0.05] transition">
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-[var(--border)] p-6 space-y-4">
            {cart.error && (
              <div className="rounded-md border border-[rgba(153,27,27,0.4)] bg-[rgba(153,27,27,0.08)] p-3 text-[12px] text-[#fca5a5]">
                {cart.error}
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--fg-muted)]">Subtotal</span>
              <span className="font-mono">{Tebex.formatPrice(cart.total, cart.currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Total</span>
              <span className="text-xl font-bold">
                {Tebex.formatPrice(cart.total, cart.currency)}
                <span className="text-[var(--fg-muted)] text-xs font-normal ml-1">{cart.currency}</span>
              </span>
            </div>
            {cart.checkoutUrl ? (
              <a
                href={cart.checkoutUrl}
                className="btn-primary inline-flex items-center justify-center gap-2 px-5 h-11 rounded-md text-sm font-semibold w-full"
              >
                Checkout <Icon name="arrow-right" size={14} />
              </a>
            ) : (
              <ButtonPrimary className="w-full" disabled icon={<Icon name="loader" size={14} />}>
                Preparing checkout…
              </ButtonPrimary>
            )}
            <div className="text-[11px] text-[var(--fg-dim)] text-center">Secure checkout via Tebex · all major cards</div>
          </div>
        )}
      </aside>
    </React.Fragment>
  );
}

Object.assign(window, {
  Icon, SectionEyebrow, Chip, ButtonPrimary, ButtonGhost,
  Reveal, useReveal, FrameworkBadge, CartProvider, useCart,
  Avatar, Logo, Header, Footer, CartDrawer, NAV_ITEMS,
  DiscordButton, FivemButton, DiscordLogo
});
