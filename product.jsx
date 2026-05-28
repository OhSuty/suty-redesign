// ─── Product card + grid ───────────────────────────────────────────────

function ProductImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <div className="absolute inset-0 overflow-hidden img-fallback">
      {!loaded && !err && (
        <div className="absolute inset-0 skeleton" />
      )}
      {!err && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
          className={"img-zoom absolute inset-0 w-full h-full object-cover transition-opacity duration-500 " + (loaded ? "opacity-90" : "opacity-0")}
        />
      )}
      {/* gradient overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.65) 95%)" }} />
      {/* subtle vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
    </div>
  );
}

function ProductCard({ script, onAdd, onOpen, compact = false }) {
  const isSub = script.type === "subscription";
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef(null);
  const imageRef = useRef(null);
  useEffect(() => () => clearTimeout(addedTimerRef.current), []);

  const onAddClick = (e) => {
    e.stopPropagation();
    if (!onAdd) return;
    // Fly the card's image to the cart icon for the "Added" delight
    if (imageRef.current && script.image) {
      flyImageToCart(imageRef.current, script.image);
    }
    onAdd(script);
    setAdded(true);
    clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 1500);
  };

  const open = (e) => {
    // Don't fire if click came from the Add button (it stops propagation, but belt + suspenders)
    if (e && e.target && e.target.closest && e.target.closest("[data-stop-card-click]")) return;
    if (onOpen) onOpen(script);
  };
  return (
    <article
      className="card card-lift group rounded-xl overflow-hidden flex flex-col cursor-pointer"
      onClick={open}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); } }}
      role="button"
      tabIndex={0}
      aria-label={`View ${script.displayName}`}
    >
      {/* Media */}
      <div ref={imageRef} className="relative aspect-[16/10] overflow-hidden">
        <ProductImage src={script.image} alt={script.displayName || script.name} />

        {/* Top-left subscription pill */}
        {isSub && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur border border-[var(--border-2)] text-[10px] uppercase tracking-[0.18em] text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-hover)]"></span>
            Subscription
          </div>
        )}
        {/* Top-right NEW pill */}
        {script.isNew && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-[0.18em]" style={{ boxShadow: "0 0 18px rgba(153,27,27,0.55), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            New
          </div>
        )}
      </div>

      {/* Body — compact on phone (2-col grid), full on sm+ */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col">
        {/* Name only — description lives on the detail page */}
        <h3 className="font-bold tracking-tight text-[13px] sm:text-[15px] leading-snug line-clamp-2 min-h-[2.2rem] sm:min-h-[2.6rem]">
          {script.displayName || script.name}
        </h3>

        {/* Framework badges — keep small on phone */}
        <div className="mt-3 sm:mt-4 flex items-center gap-1 sm:gap-1.5 flex-wrap min-h-[22px] sm:min-h-[26px]">
          {script.frameworks.map((f) => <FrameworkBadge key={f} kind={f} />)}
        </div>

        <div className="mt-3 sm:mt-5 pt-3 sm:pt-5 border-t border-[var(--border)] flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-bold tracking-tight tabular-nums">
              {Tebex.formatPrice(script.price, script.currency)}
              {isSub && <span className="text-[var(--fg-muted)] text-[10px] sm:text-xs font-normal ml-0.5 sm:ml-1">/ mo</span>}
            </div>
            <div className="hidden sm:block text-[11px] text-[var(--fg-dim)] mt-0.5">
              {isSub ? "Cancel anytime" : "Lifetime updates · escrow"}
            </div>
          </div>
          <button
            data-stop-card-click
            onClick={onAddClick}
            disabled={added}
            aria-label={added ? "Added" : `Add ${script.displayName} to cart`}
            className={"inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 h-8 sm:h-10 rounded-md text-[11px] sm:text-[13px] font-semibold transition-all shrink-0 " + (
              added
                ? "bg-[rgba(74,222,128,0.18)] text-[#86efac] border border-[rgba(74,222,128,0.45)]"
                : "btn-primary"
            )}
          >
            <Icon name={added ? "check" : "plus"} size={12} />
            <span>{added ? "Added" : "Add"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// Reusable "Add to cart" / "Subscribe" CTA with the same Added feedback.
// Pass `flyFromRef` to also fire the fly-to-cart image animation when
// clicked — e.g. the product detail page hands in its hero image ref.
function AddCTA({ script, onAdd, label = "Add to cart", labelAdded = "Added", icon = "arrow-right", className = "", flyFromRef = null }) {
  const [added, setAdded] = useState(false);
  const tRef = useRef(null);
  useEffect(() => () => clearTimeout(tRef.current), []);
  return (
    <button
      onClick={() => {
        if (!onAdd) return;
        if (flyFromRef && flyFromRef.current && script && script.image) {
          flyImageToCart(flyFromRef.current, script.image);
        }
        onAdd(script);
        setAdded(true);
        clearTimeout(tRef.current);
        tRef.current = setTimeout(() => setAdded(false), 1500);
      }}
      disabled={added}
      className={"inline-flex items-center justify-center gap-2 px-5 h-11 rounded-md text-sm font-semibold transition-all " + (
        added
          ? "bg-[rgba(74,222,128,0.18)] text-[#86efac] border border-[rgba(74,222,128,0.45)]"
          : "btn-primary"
      ) + " " + className}
    >
      <Icon name={added ? "check" : icon} size={14} />
      {added ? labelAdded : label}
    </button>
  );
}

// Featured product card (taller, used in subscriptions hero)
function FeaturedSubscriptionCard({ sub, allScripts, onAdd }) {
  if (!sub) return null;
  const list = allScripts || [];
  return (
    <article className="card card-lift relative rounded-2xl overflow-hidden">
      {/* Decorative spotlight */}
      <div className="absolute inset-0 pointer-events-none spotlight-soft" />
      <div className="absolute inset-0 pointer-events-none dot-bg opacity-40" />

      <div className="relative grid md:grid-cols-[1.05fr_1fr] gap-10 p-10 md:p-14">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border-2)] text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
            <span className="relative w-1.5 h-1.5 rounded-full">
              <span className="block w-1.5 h-1.5 rounded-full bg-[var(--accent-hover)] pulse-dot"></span>
            </span>
            Subscription · most popular
          </div>

          <h3 className="mt-6 font-black tracking-tighter leading-[0.95] text-5xl md:text-6xl">
            <span className="italic-accent shine">{sub.displayName || sub.name}</span>
          </h3>
          <p className="mt-5 text-[15px] text-[var(--fg-muted)] max-w-md leading-relaxed">
            {sub.description || "Every Suty script ever shipped — plus everything we drop next. One subscription, no per-script math."}
          </p>

          <div className="mt-8 flex items-end gap-2">
            <div className="text-5xl font-black tracking-tighter tabular-nums">{Tebex.formatPrice(sub.price, sub.currency)}</div>
            <div className="pb-2 text-sm text-[var(--fg-muted)]">/ month</div>
          </div>
          <div className="text-xs text-[var(--fg-dim)] mt-1">{list.length > 0 ? `Includes ${list.length} scripts · ` : ""}cancel anytime</div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <AddCTA script={sub} onAdd={onAdd} label="Subscribe" labelAdded="Added" />
            <ButtonGhost>See what’s included</ButtonGhost>
          </div>
        </div>

        {list.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 self-center">
            {list.slice(0, 8).map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-black/40 border border-[var(--border)]">
                <Icon name="check" size={12} className="text-[var(--accent-hover)]" />
                <span className="text-[13px] truncate">{s.displayName}</span>
              </li>
            ))}
            {list.length > 8 && (
              <li className="col-span-2 flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-black/40 border border-[var(--border)]">
                <Icon name="sparkles" size={12} className="text-[var(--accent-hover)]" />
                <span className="text-[13px] text-[var(--fg-muted)]">+ {list.length - 8} more, plus every future drop</span>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}

function SubscriptionCard({ sub, onAdd }) {
  return (
    <article className="card card-lift rounded-xl p-7 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">Bundle</div>
      </div>
      <h4 className="mt-5 text-2xl font-bold tracking-tight">{sub.displayName || sub.name}</h4>
      <p className="mt-2 text-[13px] text-[var(--fg-muted)] leading-relaxed line-clamp-3">{sub.description}</p>
      <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold tracking-tighter tabular-nums">{Tebex.formatPrice(sub.price, sub.currency)}</div>
          <div className="text-[11px] text-[var(--fg-dim)] mt-0.5">/ month</div>
        </div>
        <AddCTA script={sub} onAdd={onAdd} label="Subscribe" labelAdded="Added" />
      </div>
    </article>
  );
}

function ProductGrid({ scripts, onAdd, onOpen, columns = 3 }) {
  // Re-observe when the visible scripts change (e.g. category filter swap)
  // so the new .reveal wrappers actually fire their IO and become visible.
  const ref = useReveal({ stagger: 70, deps: [scripts] });
  const cls = columns === 3 ? "md:grid-cols-3" : columns === 2 ? "md:grid-cols-2" : "md:grid-cols-4";
  return (
    <div ref={ref} className={`grid grid-cols-2 ${cls} gap-3 sm:gap-5`}>
      {scripts.map((s) => (
        <div key={s.id} className="reveal">
          <ProductCard script={s} onAdd={onAdd} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { ProductCard, ProductGrid, FeaturedSubscriptionCard, SubscriptionCard, ProductImage, AddCTA });
