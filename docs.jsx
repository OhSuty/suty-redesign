// ─── Docs page ─────────────────────────────────────────────────────────

const DOCS_TREE = [
  {
    id: "queue",
    title: "Queue System",
    pages: [
      { id: "queue/intro", title: "Introduction" },
      { id: "queue/install", title: "Installation" },
      { id: "queue/config", title: "Configuration" },
      { id: "queue/priority", title: "Discord priority" },
      { id: "queue/api", title: "Server API" }
    ]
  },
  {
    id: "drug",
    title: "Drug Sell System",
    pages: [
      { id: "drug/intro", title: "Introduction" },
      { id: "drug/install", title: "Installation" },
      { id: "drug/zones", title: "Defining zones" },
      { id: "drug/heat", title: "Heat decay" }
    ]
  },
  {
    id: "safe",
    title: "Safe Zone Creator",
    pages: [
      { id: "safe/intro", title: "Introduction" },
      { id: "safe/painter", title: "In-game painter" },
      { id: "safe/persist", title: "Persistence" }
    ]
  },
  {
    id: "tappay",
    title: "Tap Pay",
    pages: [
      { id: "tappay/intro", title: "Introduction" },
      { id: "tappay/lbphone", title: "lb-phone integration" }
    ]
  }
];

function DocsSidebar({ active, onSelect }) {
  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] py-8 pr-6 hidden md:block">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-dim)] mb-4 px-2">Documentation</div>
      <div className="relative mb-5 px-2">
        <Icon name="search" size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
        <input
          placeholder="Search docs…"
          className="w-full h-9 pl-9 pr-3 rounded-md bg-[var(--surface)] border border-[var(--border-2)] text-[13px] placeholder:text-[var(--fg-dim)] focus:outline-none focus:border-[#3a3a3a]"
        />
      </div>
      <nav className="space-y-1">
        {DOCS_TREE.map((folder) => (
          <details key={folder.id} open className="group">
            <summary className="flex items-center gap-2 px-2 h-8 rounded-md hover:bg-white/[0.03] cursor-pointer">
              <Icon name="chevron-right" size={12} className="caret text-[var(--fg-muted)]" />
              <Icon name="folder" size={13} className="text-[var(--fg-muted)]" />
              <span className="text-[13px] font-medium text-white/90">{folder.title}</span>
            </summary>
            <ul className="ml-6 mt-0.5 border-l border-[var(--border)] pl-2 space-y-0.5">
              {folder.pages.map((p) => {
                const isActive = active === p.id;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => onSelect(p.id)}
                      className={"w-full text-left px-2 h-7 rounded-md text-[12.5px] flex items-center gap-1.5 transition " +
                        (isActive ? "bg-[rgba(153,27,27,0.12)] text-white border border-[rgba(153,27,27,0.35)]" : "text-[var(--fg-muted)] hover:text-white hover:bg-white/[0.03] border border-transparent")
                      }
                    >
                      <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
                      {p.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </nav>
    </aside>
  );
}

function CodeBlock({ code, lang = "lua" }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  // tiny tokenizer just for visuals
  const html = code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(--[^\n]*)/g, '<span class="tok-c">$1</span>')
    .replace(/('[^']*'|"[^"]*")/g, '<span class="tok-s">$1</span>')
    .replace(/\b(local|function|return|end|if|then|else|for|do|in|nil|true|false|elseif)\b/g, '<span class="tok-k">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-n">$1</span>')
    .replace(/\b([a-zA-Z_]\w*)\s*(\()/g, '<span class="tok-f">$1</span>$2');
  return (
    <div className="relative my-5">
      <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-dim)]">{lang}</span>
        <button onClick={onCopy} className="h-7 px-2 rounded-md border border-[var(--border-2)] hover:border-[#3a3a3a] hover:bg-white/[0.03] text-[var(--fg-muted)] hover:text-white text-[11px] inline-flex items-center gap-1.5 transition">
          <Icon name={copied ? "check" : "copy"} size={11} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="code p-4 pt-10" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function Tabs({ tabs }) {
  const [i, setI] = useState(0);
  return (
    <div className="my-5">
      <div className="flex items-center gap-5 border-b border-[var(--border)]">
        {tabs.map((t, idx) => (
          <button key={t.label} onClick={() => setI(idx)} className={"tab-btn text-[13px] font-medium pb-2.5 border-b-2 -mb-px " + (i === idx ? "active" : "border-transparent text-[var(--fg-muted)]")}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{tabs[i].content}</div>
    </div>
  );
}

function HintInfo({ children }) {
  return (
    <div className="hint-info p-4 my-5 flex gap-3">
      <Icon name="info" size={15} className="text-blue-300 mt-0.5" />
      <div className="text-[13.5px] leading-relaxed text-white/85">{children}</div>
    </div>
  );
}

const DOC_CONTENT = {
  "queue/intro": {
    crumb: ["Queue System", "Introduction"],
    title: "Queue System",
    eyebrow: "Systems · v3.14.2",
    body: (
      <React.Fragment>
        <p>The Queue System replaces the default FiveM connection queue with a priority-aware queue that shows live position, computes an ETA from the last N joins, and respects Discord-role boosts. It’s designed to be a drop-in: no SQL, no dependencies, no monkey-patching txAdmin.</p>
        <h2>What you get</h2>
        <ul>
          <li>Priority tiers from Discord roles (refreshed every 5 min)</li>
          <li>Per-tier reserved slots, with overflow falling back to the next tier</li>
          <li>Live position screen with rotating community quotes</li>
          <li>AFK kick after a configurable threshold</li>
          <li>Webhook for joined / skipped / queued events</li>
        </ul>

        <HintInfo>
          The queue runs server-side; no client-side ConVars need touching. You can hot-reload the resource without dropping existing connections.
        </HintInfo>

        <h2>Quick install</h2>
        <Tabs tabs={[
          { label: "QBX",    content: <CodeBlock code={`-- server.cfg\nensure suty_queue\n\n-- config.lua\nConfig.Framework = 'qbx'\nConfig.Slots = 64\nConfig.Reserved = { vip = 4, mod = 2 }`} /> },
          { label: "QBCore", content: <CodeBlock code={`-- server.cfg\nensure suty_queue\n\n-- config.lua\nConfig.Framework = 'qb-core'\nConfig.Slots = 64\nConfig.Reserved = { vip = 4, mod = 2 }`} /> },
          { label: "ESX",    content: <CodeBlock code={`-- server.cfg\nensure suty_queue\n\n-- config.lua\nConfig.Framework = 'es_extended'\nConfig.Slots = 64\nConfig.Reserved = { vip = 4, mod = 2 }`} /> }
        ]} />

        <h2>Server API</h2>
        <p>The queue exposes a small server-side API for admin tools and webhooks.</p>
        <CodeBlock code={`local Queue = exports['suty_queue']\n\n-- Bump a specific player up the queue\nQueue:bump(source, 5)\n\n-- Subscribe to queue events\nQueue:on('joined', function(data)\n  print(('%s joined after %ss in queue'):format(data.name, data.waited))\nend)`} />

        <HintInfo>
          The <code className="font-mono text-[12px] bg-black/40 px-1.5 py-0.5 rounded">bump</code> export is rate-limited per admin to prevent abuse. Bumps above 25 require a second confirmation from a higher tier.
        </HintInfo>
      </React.Fragment>
    )
  },
  "queue/install": {
    crumb: ["Queue System", "Installation"],
    title: "Installation",
    eyebrow: "Systems · v3.14.2",
    body: (
      <React.Fragment>
        <p>Drop the resource into your <code className="font-mono text-[12px] bg-black/40 px-1.5 py-0.5 rounded">resources/[suty]</code> directory and ensure it before your framework. The queue is intentionally lightweight — under 250 lines of Lua on the server — so there’s nothing exotic to configure.</p>
        <CodeBlock code={`-- 1. Place the folder\nresources/[suty]/suty_queue\n\n-- 2. Ensure it BEFORE qbx_core / es_extended\nensure suty_queue\nensure qbx_core`} />
        <h2>Verifying</h2>
        <p>Connect to the server — you should see the Suty queue screen instead of the default progress bar. Use <code className="font-mono text-[12px] bg-black/40 px-1.5 py-0.5 rounded">suty:queue:status</code> in the live console to print a snapshot of the queue.</p>
        <HintInfo>If you don’t see the queue screen, you’ve probably ensured the resource <em>after</em> your framework. Move the line up.</HintInfo>
      </React.Fragment>
    )
  }
};

function DocsContent({ pageId }) {
  const fallback = DOC_CONTENT["queue/intro"];
  const doc = DOC_CONTENT[pageId] || fallback;
  return (
    <div className="flex-1 min-w-0 py-10 md:py-14 px-2 md:px-12">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-[12px] text-[var(--fg-dim)] mb-6">
          {doc.crumb.map((c, i) => (
            <React.Fragment key={i}>
              <span className={i === doc.crumb.length - 1 ? "text-white/80" : ""}>{c}</span>
              {i < doc.crumb.length - 1 && <Icon name="chevron-right" size={11} />}
            </React.Fragment>
          ))}
        </div>

        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">{doc.eyebrow}</div>
        <h1 className="mt-3 font-black tracking-tighter leading-[0.95] text-4xl md:text-5xl">{doc.title}</h1>

        <div className="mt-8 prose-suty">
          {doc.body}
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--border)] flex items-center justify-between gap-4">
          <a href="#" className="card card-lift flex-1 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-dim)]">Previous</div>
            <div className="text-sm font-semibold mt-1">Overview</div>
          </a>
          <a href="#" className="card card-lift flex-1 rounded-lg p-4 text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-dim)]">Next</div>
            <div className="text-sm font-semibold mt-1">Installation →</div>
          </a>
        </div>
      </div>
    </div>
  );
}

function DocsPage() {
  const [active, setActive] = useState("queue/intro");
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex">
        <DocsSidebar active={active} onSelect={setActive} />
        <DocsContent pageId={active} />
      </div>
    </div>
  );
}

// Tiny prose styles applied via parent class
const proseStyle = document.createElement("style");
proseStyle.textContent = `
  .prose-suty p { color: #c8c8c8; font-size: 14.5px; line-height: 1.75; margin-top: 0.9em; }
  .prose-suty h2 { font-weight: 700; letter-spacing: -0.02em; font-size: 18px; margin-top: 2.2em; margin-bottom: 0.5em; color: #fff; }
  .prose-suty ul { margin-top: 0.6em; padding-left: 1.1em; }
  .prose-suty li { color: #c8c8c8; font-size: 14px; line-height: 1.8; list-style: disc; padding-left: 0.25em; }
  .prose-suty li::marker { color: #5a5a5a; }
  .prose-suty code { color: #fca5a5; }
`;
document.head.appendChild(proseStyle);

Object.assign(window, { DocsPage });
