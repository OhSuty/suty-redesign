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
      <div className="relative aspect-[16/10] overflow-hidden">
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

        {/* Bottom-left category */}
        <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.22em] text-white/70">
          {script.category}
        </div>
        {/* Bottom-right price (subtle, large detail on hover) */}
        <div className="absolute bottom-3 right-3 font-mono text-[11px] text-white/60">
          #{String(script.id).toUpperCase()}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold tracking-tight text-[15px] leading-snug">{script.displayName || script.name}</h3>
          <div className="flex items-center gap-1 text-[var(--fg-muted)] text-xs whitespace-nowrap">
            <Icon name="star" size={12} />
            <span className="font-mono">4.9</span>
          </div>
        </div>

        <p className="mt-2 text-[13px] text-[var(--fg-muted)] leading-relaxed line-clamp-2">{script.description}</p>

        <div className="mt-4 flex items-center gap-1.5">
          {script.frameworks.map((f) => <FrameworkBadge key={f} kind={f} />)}
        </div>

        <div className="mt-5 pt-5 border-t border-[var(--border)] flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-bold tracking-tight tabular-nums">
              {Tebex.formatPrice(script.price, script.currency)}
              {isSub && <span className="text-[var(--fg-muted)] text-xs font-normal ml-1">/ month</span>}
            </div>
            <div className="text-[11px] text-[var(--fg-dim)] mt-0.5">{isSub ? "Cancel anytime" : "Lifetime updates · escrow"}</div>
          </div>
          <button
            data-stop-card-click
            onClick={(e) => { e.stopPropagation(); onAdd && onAdd(script); }}
            className="btn-primary inline-flex items-center gap-2 px-4 h-10 rounded-md text-[13px] font-semibold"
          >
            <Icon name="plus" size={14} />
            Add
          </button>
        </div>
      </div>
    </article>
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
            <ButtonPrimary onClick={() => onAdd && onAdd(sub)} icon={<Icon name="arrow-right" size={14} />}>
              Subscribe
            </ButtonPrimary>
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
        <ButtonPrimary onClick={() => onAdd && onAdd(sub)}>Subscribe</ButtonPrimary>
      </div>
    </article>
  );
}

function ProductGrid({ scripts, onAdd, onOpen, columns = 3 }) {
  const ref = useReveal({ stagger: 70 });
  const cls = columns === 3 ? "md:grid-cols-3" : columns === 2 ? "md:grid-cols-2" : "md:grid-cols-4";
  return (
    <div ref={ref} className={`grid grid-cols-1 sm:grid-cols-2 ${cls} gap-5`}>
      {scripts.map((s) => (
        <div key={s.id} className="reveal">
          <ProductCard script={s} onAdd={onAdd} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { ProductCard, ProductGrid, FeaturedSubscriptionCard, SubscriptionCard, ProductImage });
