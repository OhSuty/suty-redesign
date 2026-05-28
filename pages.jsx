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

function CatalogPreview({ scripts, onAdd, onMore }) {
  const ref = useReveal({ stagger: 70 });
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between gap-6 pb-8">
          <div>
            <SectionEyebrow>Catalogue</SectionEyebrow>
            <h2 className="mt-4 font-black tracking-tighter leading-[1] text-4xl md:text-5xl">
              The <span className="italic-accent shine">good</span> stuff.
            </h2>
          </div>
          <button onClick={onMore} className="hidden md:inline-flex items-center gap-2 text-sm text-white/80 hover:text-white hover-underline">
            View all {SCRIPTS.length} <Icon name="arrow-right" size={13} />
          </button>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {scripts.slice(0, 6).map((s) => (
            <div key={s.id} className="reveal"><ProductCard script={s} onAdd={onAdd} /></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FrameworkSection({ active, setActive }) {
  return (
    <section className="relative py-28">
      <div className="absolute inset-0 spotlight-soft pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <SectionEyebrow>Compatibility</SectionEyebrow>
        <h2 className="mt-5 font-black tracking-tighter leading-[1] text-4xl md:text-5xl">
          Works with <span className="italic-accent shine">every</span> framework.
        </h2>
        <p className="mt-5 text-[15px] text-[var(--fg-muted)] max-w-md mx-auto">
          Tap a framework to filter the catalogue — every script supports at least two of the big three.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["qbx", "qbcore", "esx"].map((f) => (
            <button
              key={f}
              onClick={() => setActive(active === f ? null : f)}
              className={"framework-pill h-28 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center justify-center text-white/80 " + (active === f ? "active" : "")}
            >
              <div className="font-black text-3xl tracking-tighter">{FRAMEWORK_LABEL[f]}</div>
              <div className="mt-1.5 text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
                {SCRIPTS.filter(s => s.frameworks.includes(f)).length} scripts
              </div>
            </button>
          ))}
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
        <div className="text-center mb-10">
          <SectionEyebrow>Live · last 7 days</SectionEyebrow>
          <h2 className="mt-4 font-black tracking-tighter leading-[1] text-4xl md:text-5xl">
            Recent <span className="italic-accent shine">purchases</span>.
          </h2>
        </div>

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
        <div className="text-center mb-12">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className="mt-4 font-black tracking-tighter leading-[1] text-4xl md:text-5xl">
            Asked <span className="italic-accent shine">often</span>.
          </h2>
        </div>
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
      </div>
    </section>
  );
}

function LandingPage({ onAdd, setPage }) {
  const [frameworkFilter, setFrameworkFilter] = useState(null);
  const filtered = useMemo(() => (
    frameworkFilter ? SCRIPTS.filter(s => s.frameworks.includes(frameworkFilter)) : SCRIPTS
  ), [frameworkFilter]);
  return (
    <React.Fragment>
      <HeroLanding onCTA={() => setPage("scripts")} />
      <CatalogPreview scripts={filtered} onAdd={onAdd} onMore={() => setPage("scripts")} />
      <FrameworkSection active={frameworkFilter} setActive={setFrameworkFilter} />
      <RecentPurchases />
      <FAQSection />
    </React.Fragment>
  );
}

// ── Scripts page ──────────────────────────────────────────────────────
function ScriptsPage({ onAdd }) {
  const [cat, setCat] = useState("All");
  const [framework, setFramework] = useState(null);

  const list = useMemo(() => {
    let arr = SCRIPTS;
    if (cat !== "All") arr = arr.filter(s => s.category === cat);
    if (framework) arr = arr.filter(s => s.frameworks.includes(framework));
    return arr;
  }, [cat, framework]);

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
            {SCRIPTS.length} scripts · still growing
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
            {["qbx", "qbcore", "esx"].map((f) => (
              <button
                key={f}
                onClick={() => setFramework(framework === f ? null : f)}
                className={"h-8 px-3 rounded-full text-[12px] font-mono uppercase tracking-[0.18em] border transition " +
                  (framework === f
                    ? "border-[rgba(153,27,27,0.55)] bg-[rgba(153,27,27,0.12)] text-white"
                    : "border-[var(--border-2)] text-[var(--fg-muted)] hover:text-white hover:border-[#3a3a3a]")
                }
              >
                {FRAMEWORK_LABEL[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {list.length === 0 ? (
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
          <ProductGrid scripts={list} onAdd={onAdd} columns={3} />
        )}
      </section>
    </React.Fragment>
  );
}

// ── Subscriptions page ────────────────────────────────────────────────
function SubscriptionsPage({ onAdd }) {
  const featured = SUBSCRIPTIONS.find(s => s.featured);
  const others = SUBSCRIPTIONS.filter(s => !s.featured);
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
        <FeaturedSubscriptionCard sub={featured} onAdd={onAdd} />
        <div className="mt-8 grid md:grid-cols-2 gap-5">
          {others.map((s) => <SubscriptionCard key={s.id} sub={s} onAdd={onAdd} />)}
        </div>

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

Object.assign(window, { LandingPage, ScriptsPage, SubscriptionsPage, AboutPage });
