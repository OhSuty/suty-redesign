// ─── Pages ─────────────────────────────────────────────────────────────

// ── Landing page ──────────────────────────────────────────────────────
function HeroLanding({ onCTA }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t); }, []);
  return (
    <section className={"relative overflow-hidden " + (on ? "hero-on" : "")}>
      <div className="absolute inset-0 dot-bg" aria-hidden="true" />
      <div className="absolute inset-0 spotlight pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-24 md:pb-32 text-center">
        <div className="hero-step-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-2)] text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
          <span className="relative w-1.5 h-1.5 rounded-full">
            <span className="block w-1.5 h-1.5 rounded-full bg-[var(--accent-hover)] pulse-dot"></span>
          </span>
          Premium FiveM Scripts
        </div>

        <h1 className="hero-step-1 mt-7 font-black tracking-tighter leading-[0.95] text-5xl sm:text-6xl md:text-7xl max-w-4xl mx-auto" style={{ textWrap: "balance" }}>
          Scripts that <span className="italic-accent shine">feel</span> different.
        </h1>

        <p className="hero-step-2 mt-7 text-[15px] md:text-[17px] text-[var(--fg-muted)] max-w-xl mx-auto leading-relaxed">
          Hand-built Lua for QBX, QBCore, and ESX — measured in feel, not feature counts. Used by a few of the larger communities you’ve been on.
        </p>

        <div className="hero-step-3 mt-9 flex flex-wrap items-center justify-center gap-3">
          <ButtonPrimary onClick={onCTA} icon={<Icon name="arrow-right" size={14} />}>Browse scripts</ButtonPrimary>
          <ButtonGhost icon={<Icon name="play" size={13} />}>Watch the demo</ButtonGhost>
        </div>

        <div className="hero-step-4 mt-14 flex items-center justify-center gap-7 text-[12px] text-[var(--fg-dim)]">
          <div className="flex items-center gap-2"><Icon name="shield-check" size={12} /> Tebex escrow</div>
          <div className="w-px h-3 bg-[var(--border-2)]" />
          <div className="flex items-center gap-2"><Icon name="infinity" size={12} /> Lifetime updates</div>
          <div className="w-px h-3 bg-[var(--border-2)]" />
          <div className="flex items-center gap-2"><Icon name="message-circle" size={12} /> Discord support</div>
        </div>
      </div>
    </section>
  );
}

// ── ShowcaseDeck — rotating 3-card carousel (mirrors suty.dev) ─────────
const SHOWCASE_ROTATE_MS = 5500;

function ShowcaseMini({ script, position, onClick }) {
  const widthClass =
    position === "center"
      ? "w-[88vw] max-w-[280px] sm:w-80 sm:max-w-none"
      : "w-[78vw] max-w-[260px] sm:w-64 sm:max-w-none";
  const transformClass =
    position === "center"
      ? "sm:-translate-y-8 z-10 border-[var(--accent)]"
      : position === "left"
        ? "rotate-y-15 sm:rotate-y-15"
        : "-rotate-y-15 sm:-rotate-y-15";
  const extraShadow =
    position === "center"
      ? { boxShadow: "0 30px 80px rgba(153,27,27,0.45)" }
      : undefined;

  return (
    <div className="deck-card">
      <button
        onClick={onClick}
        className={
          "stage-card group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-1 text-left " +
          widthClass + " " + transformClass
        }
        style={extraShadow}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          {script.image ? (
            <img src={script.image} alt={script.displayName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="img-fallback w-full h-full grid place-items-center text-xs text-[var(--accent-hover)]">{script.displayName}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        <div className="px-4 py-3">
          <div className="line-clamp-1 text-sm font-bold text-white">{script.displayName}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-base font-bold text-[var(--accent-hover)]">
              {Tebex.formatPrice(script.price, script.currency)}
              {script.type === "subscription" && <span className="text-[10px] text-[var(--fg-muted)] font-normal ml-1">/ mo</span>}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--fg-muted)] group-hover:text-[var(--accent-hover)] transition-colors">
              View →
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}

function ShowcaseDeck({ scripts, onAdd, onOpen, onMore }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Sort newest first to mirror suty.dev's showcase ordering
  const ordered = useMemo(() => {
    return [...scripts].sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }, [scripts]);

  useEffect(() => {
    if (paused || ordered.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ordered.length);
    }, SHOWCASE_ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, ordered.length]);

  useEffect(() => {
    const onVis = () => setPaused(document.visibilityState !== "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (ordered.length === 0) return null;
  const len    = ordered.length;
  const center = ordered[index];
  const left   = ordered[(index - 1 + len) % len];
  const right  = ordered[(index + 1) % len];

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-20 h-[400px] blur-2xl" style={{ background: "radial-gradient(ellipse at center, rgba(153,27,27,0.35), transparent 60%)" }} />

      <div className="relative max-w-6xl mx-auto px-6 pb-20 pt-12 sm:pb-28 sm:pt-20">
        <Reveal>
          <div className="text-center mb-10">
            <SectionEyebrow>Newest drops</SectionEyebrow>
            <h2 className="mt-4 font-black tracking-tighter leading-[1] text-4xl md:text-5xl">
              The <span className="italic-accent shine">good</span> stuff.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="stage-deck flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-end sm:gap-4" style={{ perspective: "1400px" }}>
            <ShowcaseMini key={`L-${left.id}`}   script={left}   position="left"   onClick={() => onOpen && onOpen(left)} />
            <ShowcaseMini key={`C-${center.id}`} script={center} position="center" onClick={() => onOpen && onOpen(center)} />
            <ShowcaseMini key={`R-${right.id}`}  script={right}  position="right"  onClick={() => onOpen && onOpen(right)} />
          </div>
        </Reveal>

        {ordered.length > 1 && (
          <Reveal delay={120}>
            <div className="mt-10 flex justify-center gap-1.5">
              {ordered.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${p.displayName}`}
                  className={"h-1.5 rounded-full transition-all " + (
                    i === index
                      ? "w-8 bg-[var(--accent)]"
                      : "w-1.5 bg-[var(--border-2)] hover:bg-[var(--fg-muted)]"
                  )}
                  style={i === index ? { boxShadow: "0 0 10px rgba(153,27,27,0.6)" } : undefined}
                />
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={150}>
          <div className="mt-10 text-center">
            <button onClick={onMore} className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--fg-muted)] hover:text-[var(--accent-hover)] transition-colors">
              Browse the full catalog →
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FrameworkSection({ scripts }) {
  const list = scripts || [];
  // Order matches suty.dev exactly: ESX → QBCore → QBX
  const order = ["esx", "qbcore", "qbx"];
  return (
    <section className="relative py-28 border-y border-[var(--border)] bg-[var(--surface)]">
      <div className="absolute inset-0 spotlight-soft pointer-events-none" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <Reveal>
          <SectionEyebrow>Compatibility</SectionEyebrow>
          <h2 className="mt-5 font-black tracking-tighter leading-[1] text-4xl md:text-5xl">
            Built for every <span className="italic-accent shine">framework</span>.
          </h2>
          <p className="mt-5 text-[15px] text-[var(--fg-muted)] max-w-md mx-auto">
            Most Suty scripts ship with native support for all three of the major FiveM frameworks — drop them in and they just work.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-3 items-start gap-4 sm:gap-10 md:gap-16">
          {order.map((f, i) => {
            const meta = FRAMEWORK_META[f];
            if (!meta) return null;
            const count = list.filter(s => s.frameworks.includes(f)).length;
            return (
              <Reveal key={f} delay={i * 140}>
                <a
                  href={meta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${meta.label} — open framework site in new tab`}
                  title={`${meta.label} → ${meta.href.replace(/^https?:\/\//, "")}`}
                  className="group flex flex-col items-center gap-3 outline-none w-full"
                >
                  <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-[var(--border)] bg-black p-3 sm:p-4 transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--accent)]">
                    <img
                      src={meta.image}
                      alt={meta.label}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white transition-colors group-hover:text-[var(--accent-hover)]">
                    {meta.label}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
                    {count} {count === 1 ? "script" : "scripts"}
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RecentPurchases() {
  const ref = useReveal({ stagger: 40 });
  return (
    <section className="relative py-20">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-10">
            <SectionEyebrow>Live · last 7 days</SectionEyebrow>
            <h2 className="mt-4 font-black tracking-tighter leading-[1] text-4xl md:text-5xl">
              Recent <span className="italic-accent shine">purchases</span>.
            </h2>
          </div>
        </Reveal>

        <ul ref={ref} className="card rounded-xl divide-y divide-[var(--border)] overflow-hidden">
          {BUYERS.map((b, i) => (
            <li key={i} className="reveal flex items-center gap-4 px-5 py-4 hover:bg-white/[0.015] transition">
              <Avatar name={b.name} size={36} />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px]">
                  <span className="font-semibold text-white">{b.name}</span>
                  <span className="text-[var(--fg-muted)]"> picked up </span>
                  <span className="font-semibold text-white/90 hover-underline cursor-pointer">{b.script}</span>
                </div>
                <div className="text-[11px] text-[var(--fg-dim)] mt-0.5 flex items-center gap-1.5">
                  <Icon name="shopping-bag" size={10} />
                  Tebex purchase · paid in full
                </div>
              </div>
              <div className="text-[11px] text-[var(--fg-dim)] font-mono">{b.time} ago</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="relative py-24">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-12">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2 className="mt-4 font-black tracking-tighter leading-[1] text-4xl md:text-5xl">
              Asked <span className="italic-accent shine">often</span>.
            </h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
        <div className="card rounded-xl divide-y divide-[var(--border)] overflow-hidden">
          {FAQS.map((f, i) => (
            <details key={i} className="faq group">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-white/[0.02] transition">
                <span className="font-semibold text-[14.5px]">{f.q}</span>
                <span className="faq-chev relative w-3 h-3 shrink-0">
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/70"></span>
                  <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/70"></span>
                </span>
              </summary>
              <div className="px-6 pb-5 text-[13.5px] text-[var(--fg-muted)] leading-relaxed max-w-2xl">
                {f.a}
              </div>
            </details>
          ))}
        </div>
        </Reveal>
      </div>
    </section>
  );
}

function LandingPage({ onAdd, onOpen, setPage }) {
  const { packages, loading } = useScripts();
  const onlySingles = useMemo(() => packages.filter(p => p.type !== "subscription"), [packages]);
  return (
    <React.Fragment>
      <HeroLanding onCTA={() => setPage("scripts")} />
      {loading ? (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="card rounded-2xl py-20 text-center">
            <div className="skeleton h-7 w-48 mx-auto rounded mb-3" />
            <div className="skeleton h-4 w-64 mx-auto rounded" />
          </div>
        </section>
      ) : (
        <ShowcaseDeck scripts={onlySingles} onAdd={onAdd} onOpen={onOpen} onMore={() => setPage("scripts")} />
      )}
      <FrameworkSection scripts={onlySingles} />
      <RecentPurchases />
      <FAQSection />
    </React.Fragment>
  );
}

// ── Scripts page ──────────────────────────────────────────────────────
function ScriptsPage({ onAdd, onOpen }) {
  const { packages, loading } = useScripts();
  const [cat, setCat] = useState("All");
  const [framework, setFramework] = useState(null);

  const all = useMemo(() => packages.filter(p => p.type !== "subscription"), [packages]);
  const list = useMemo(() => {
    let arr = all;
    if (cat !== "All") arr = arr.filter(s => s.category === cat);
    if (framework) arr = arr.filter(s => s.frameworks.includes(framework));
    return arr;
  }, [all, cat, framework]);

  return (
    <React.Fragment>
      {/* mini hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-70" />
        <div className="absolute inset-0 spotlight-soft pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-2)] text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
            <span className="relative w-1.5 h-1.5 rounded-full">
              <span className="block w-1.5 h-1.5 rounded-full bg-[var(--accent-hover)] pulse-dot"></span>
            </span>
            {all.length} scripts · still growing
          </div>
          <h1 className="mt-6 font-black tracking-tighter leading-[0.95] text-5xl md:text-6xl">
            All <span className="italic-accent shine">scripts</span>.
          </h1>
          <p className="mt-5 text-[15px] text-[var(--fg-muted)] max-w-lg mx-auto">
            Filter by category or framework. Everything ships with lifetime updates, source-visible server logic, and Discord support.
          </p>
        </div>
      </section>

      {/* toolbar */}
      <div className="sticky top-16 z-30 bg-black/80 backdrop-blur-md border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={"h-8 px-3.5 rounded-full text-[12.5px] font-medium border transition whitespace-nowrap " +
                  (cat === c
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                    : "border-[var(--border-2)] text-[var(--fg-muted)] hover:text-white hover:border-[#3a3a3a]")
                }
                style={cat === c ? { boxShadow: "0 0 14px rgba(153,27,27,0.45), inset 0 1px 0 rgba(255,255,255,0.15)" } : undefined}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--fg-dim)] mr-1 hidden sm:inline">Framework</span>
            {["esx", "qbcore", "qbx"].map((f) => {
              const meta = FRAMEWORK_META[f];
              const isActive = framework === f;
              return (
                <button
                  key={f}
                  onClick={() => setFramework(isActive ? null : f)}
                  className={"h-8 pl-1.5 pr-3 rounded-full text-[12px] font-semibold border inline-flex items-center gap-1.5 transition " +
                    (isActive
                      ? "border-[rgba(153,27,27,0.55)] bg-[rgba(153,27,27,0.12)] text-white"
                      : "border-[var(--border-2)] text-[var(--fg-muted)] hover:text-white hover:border-[#3a3a3a]")
                  }
                >
                  {meta && (
                    <span className="grid place-items-center h-5 w-5 rounded-full bg-black border border-white/10">
                      <img src={meta.image} alt="" className="h-3 w-3 object-contain" aria-hidden />
                    </span>
                  )}
                  {meta ? meta.label : FRAMEWORK_LABEL[f]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card rounded-xl overflow-hidden">
                <div className="aspect-[16/10] skeleton" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="card rounded-2xl py-20 text-center">
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-full border border-[var(--border-2)] mb-5 text-white/60">
              <Icon name="search-x" size={20} />
            </div>
            <div className="font-semibold text-lg">No matches for that combo</div>
            <p className="mt-2 text-sm text-[var(--fg-muted)] max-w-sm mx-auto">Try clearing the framework filter, or switch to <em>All</em> categories.</p>
            <div className="mt-6 inline-flex">
              <ButtonGhost onClick={() => { setCat("All"); setFramework(null); }}>Clear filters</ButtonGhost>
            </div>
          </div>
        ) : (
          <ProductGrid scripts={list} onAdd={onAdd} onOpen={onOpen} columns={3} />
        )}
      </section>
    </React.Fragment>
  );
}

// ── Subscriptions page ────────────────────────────────────────────────
function SubscriptionsPage({ onAdd }) {
  const { packages, loading } = useScripts();
  const subs = useMemo(() => packages.filter(p => p.type === "subscription"), [packages]);
  // First sub becomes featured if none flagged
  const featured = subs[0];
  const others = subs.slice(1);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="card rounded-2xl py-20 text-center">
          <div className="skeleton h-6 w-48 mx-auto rounded" />
        </div>
      </section>
    );
  }

  if (subs.length === 0) {
    return (
      <React.Fragment>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 dot-bg opacity-70" />
          <div className="absolute inset-0 spotlight pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
            <Chip>Recurring</Chip>
            <h1 className="mt-6 font-black tracking-tighter leading-[0.95] text-5xl md:text-6xl">
              <span className="italic-accent shine">Subscriptions</span>.
            </h1>
            <p className="mt-5 text-[15px] text-[var(--fg-muted)] max-w-lg mx-auto">
              Pay monthly while you use it. Cancel from your Tebex account any time.
            </p>
          </div>
        </section>
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <div className="card rounded-2xl py-16 text-center">
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-full border border-[var(--border-2)] mb-5 text-[var(--accent-hover)]">
              <Icon name="refresh-ccw" size={20} />
            </div>
            <div className="font-semibold text-lg">No subscriptions available yet</div>
            <p className="mt-3 text-sm text-[var(--fg-muted)] max-w-md mx-auto">Subscription-based scripts will appear here. Browse the full catalogue for one-time purchases in the meantime.</p>
          </div>
        </section>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-70" />
        <div className="absolute inset-0 spotlight pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-2)] text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
            <span className="relative w-1.5 h-1.5 rounded-full">
              <span className="block w-1.5 h-1.5 rounded-full bg-[var(--accent-hover)] pulse-dot"></span>
            </span>
            Recurring
          </div>
          <h1 className="mt-6 font-black tracking-tighter leading-[0.95] text-5xl md:text-6xl">
            <span className="italic-accent shine">Subscriptions</span>.
          </h1>
          <p className="mt-5 text-[15px] text-[var(--fg-muted)] max-w-lg mx-auto">
            One subscription, the entire catalogue. Or pick a focused bundle if you’re only here for the roleplay tier.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <FeaturedSubscriptionCard sub={featured} allScripts={packages.filter(p => p.type !== "subscription")} onAdd={onAdd} />
        {others.length > 0 && (
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            {others.map((s) => <SubscriptionCard key={s.id} sub={s} onAdd={onAdd} />)}
          </div>
        )}

        <div className="mt-16 card rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">Not sure yet?</div>
            <div className="mt-2 text-2xl font-bold tracking-tight">Subscribe for a month, cancel any time.</div>
            <p className="mt-1.5 text-sm text-[var(--fg-muted)] max-w-md">All subscriptions are month-to-month. No annual lock-in, no pro-rated weirdness.</p>
          </div>
          <div className="flex gap-3">
            <ButtonGhost>Compare plans</ButtonGhost>
            <ButtonPrimary icon={<Icon name="arrow-right" size={14} />}>Start with All Access</ButtonPrimary>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

// ── About page ────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-70" />
      <div className="absolute inset-0 spotlight pointer-events-none" />
      <div className="relative max-w-2xl mx-auto px-6 pt-24 pb-32 text-center">
        <SectionEyebrow>About</SectionEyebrow>
        <h1 className="mt-6 font-black tracking-tighter leading-[0.95] text-5xl md:text-6xl">
          One <span className="italic-accent shine">person</span>, mostly.
        </h1>
        <p className="mt-8 text-[15px] md:text-[16px] text-[var(--fg-muted)] leading-[1.85] text-left">
          Suty started as a couple of scripts I wrote for a server I played on in 2022 — a queue that didn’t feel broken, a drug-sell loop that wasn’t just clicking <span className="text-white">E</span>. Other communities asked for them, a Tebex storefront went up, and four years later it’s still mostly me, with a little help from two contributors for testing and Discord support.
        </p>
        <p className="mt-6 text-[15px] md:text-[16px] text-[var(--fg-muted)] leading-[1.85] text-left">
          The bar I hold every script to is the same one I held those first two: does it <em className="text-white not-italic font-semibold italic">feel</em> right when you’re actually playing? If a script makes the loop worse — even by a frame — it doesn’t ship. That’s the whole pitch.
        </p>
        <div className="mt-12 flex items-center justify-center gap-3">
          <ButtonPrimary icon={<Icon name="arrow-right" size={14} />}>Join the Discord</ButtonPrimary>
          <ButtonGhost>Read the changelog</ButtonGhost>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-6 text-left">
          {[
            { k: "4 yrs", v: "Shipping" },
            { k: "12", v: "Scripts" },
            { k: "9.4k", v: "Discord members" }
          ].map((s) => (
            <div key={s.v} className="card rounded-xl p-5">
              <div className="text-3xl font-black tracking-tighter">{s.k}</div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)] mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Product detail page ──────────────────────────────────────────────
function ProductDetailPage({ script, onBack, onAdd }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [script && script.id]);

  if (!script) return null;
  const isSub = script.type === "subscription";

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-50" aria-hidden />
      <div className="absolute inset-0 spotlight-soft pointer-events-none" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-24">
        {/* Back link */}
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--fg-muted)] hover:text-white transition group"
        >
          <Icon name="arrow-left" size={14} className="transition-transform group-hover:-translate-x-0.5" />
          Back to scripts
        </button>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-start">
          {/* Image */}
          <Reveal>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--border)] bg-black">
              {script.image ? (
                <img src={script.image} alt={script.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="img-fallback h-full w-full grid place-items-center text-[var(--accent-hover)] font-bold uppercase tracking-wider">
                  {script.displayName}
                </div>
              )}
              {/* Subtle bottom shadow inside the image */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              {/* Pills */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {isSub && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur border border-[var(--border-2)] text-[10px] uppercase tracking-[0.18em] text-white/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-hover)]"></span>
                    Subscription
                  </div>
                )}
                {script.isNew && (
                  <div className="px-2 py-1 rounded-md bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-[0.18em]" style={{ boxShadow: "0 0 18px rgba(153,27,27,0.55), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
                    New
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {/* Info */}
          <Reveal delay={120}>
            <div className="flex flex-col">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">{script.category}</div>
              <h1 className="mt-3 font-black tracking-tighter leading-[1.02] text-4xl md:text-5xl text-white">
                {script.displayName}
              </h1>

              <div className="mt-6 flex items-center gap-2 flex-wrap">
                {(script.frameworks || []).map((f) => (
                  <FrameworkBadge key={f} kind={f} size="lg" />
                ))}
              </div>

              <div className="mt-8 flex items-end gap-2">
                <div className="text-5xl font-black tracking-tighter tabular-nums">
                  {Tebex.formatPrice(script.price, script.currency)}
                </div>
                {isSub && <div className="pb-2 text-sm text-[var(--fg-muted)]">/ month</div>}
              </div>
              <div className="text-xs text-[var(--fg-dim)] mt-1">
                {isSub ? "Cancel anytime · billed automatically" : "Lifetime updates · Tebex escrow protected"}
              </div>

              <div className="mt-8 flex items-center gap-3">
                <ButtonPrimary
                  onClick={() => onAdd && onAdd(script)}
                  icon={<Icon name="arrow-right" size={14} />}
                  className="flex-1 md:flex-none"
                >
                  {isSub ? "Subscribe" : "Add to cart"}
                </ButtonPrimary>
                <a
                  href={Tebex.DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost inline-flex items-center justify-center gap-2 px-4 h-11 rounded-md text-sm font-semibold"
                >
                  <Icon name="message-circle" size={14} />
                  Support
                </a>
              </div>

              {/* Meta strip */}
              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { icon: "shield-check", k: "Escrow",    v: "Tebex" },
                  { icon: "infinity",     k: "Updates",   v: "Lifetime" },
                  { icon: "code-2",       k: "Server",    v: "Open" }
                ].map((m) => (
                  <div key={m.k} className="card rounded-lg p-3 flex flex-col items-start gap-1">
                    <Icon name={m.icon} size={14} className="text-[var(--accent-hover)]" />
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)] mt-1">{m.k}</div>
                    <div className="text-xs font-semibold text-white">{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Description */}
        {script.description && (
          <Reveal delay={200}>
            <div className="mt-20 max-w-3xl">
              <SectionEyebrow>About this script</SectionEyebrow>
              <div className="mt-6 text-[15px] text-white/90 leading-[1.85] whitespace-pre-line">
                {script.description}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { LandingPage, ScriptsPage, SubscriptionsPage, AboutPage, ProductDetailPage });
