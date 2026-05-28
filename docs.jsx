// ─── Docs page (real content synced from OhSuty/suty-docs) ─────────────
//
// Folder structure + page HTML are embedded in docs-content.jsx (auto-
// generated). This file just renders them inside the redesign's sidebar
// + reading-pane shell.

function DocsSidebar({ active, onSelect, query, setQuery }) {
  // Filter pages by query (case-insensitive substring on page or folder title)
  const q = (query || "").trim().toLowerCase();
  const tree = !q
    ? DOCS_TREE
    : DOCS_TREE
        .map((folder) => {
          const matchFolder = folder.title.toLowerCase().includes(q);
          const matchedPages = folder.pages.filter((p) =>
            p.title.toLowerCase().includes(q) || matchFolder
          );
          return matchedPages.length ? { ...folder, pages: matchedPages } : null;
        })
        .filter(Boolean);

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] py-8 pr-6 hidden md:block">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-dim)] mb-4 px-2">Documentation</div>
      <div className="relative mb-5 px-2">
        <Icon name="search" size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs…"
          className="w-full h-9 pl-9 pr-3 rounded-md bg-[var(--surface)] border border-[var(--border-2)] text-[13px] placeholder:text-[var(--fg-dim)] focus:outline-none focus:border-[#3a3a3a]"
        />
      </div>
      <nav className="space-y-1">
        {tree.length === 0 && (
          <div className="px-2 text-[12px] text-[var(--fg-dim)]">No matches.</div>
        )}
        {tree.map((folder) => {
          const containsActive = folder.pages.some((p) => p.id === active);
          return (
            <details key={folder.id} open={containsActive || !!q} className="group">
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
                          (isActive
                            ? "bg-[rgba(153,27,27,0.12)] text-white border border-[rgba(153,27,27,0.35)]"
                            : "text-[var(--fg-muted)] hover:text-white hover:bg-white/[0.03] border border-transparent")
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
          );
        })}
      </nav>
    </aside>
  );
}

// Build a flat ordered list of page ids for prev/next
function flatPageList() {
  const list = [];
  for (const folder of DOCS_TREE) {
    for (const p of folder.pages) list.push({ id: p.id, title: p.title, folderTitle: folder.title });
  }
  return list;
}

function DocsContent({ pageId, onSelect }) {
  const doc = DOCS_CONTENT[pageId] || DOCS_CONTENT[DOCS_DEFAULT_ID];
  const proseRef = useRef(null);

  // Enhance the rendered HTML once it lands in the DOM:
  //   - Add a copy button to every <pre><code> block
  //   - Open external links in new tabs
  useEffect(() => {
    const el = proseRef.current;
    if (!el) return;

    // Copy buttons on code blocks
    el.querySelectorAll("pre > code").forEach((codeEl) => {
      const pre = codeEl.parentElement;
      if (!pre || pre.dataset.suty === "1") return;
      pre.dataset.suty = "1";
      pre.classList.add("docs-pre");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "docs-copy";
      btn.textContent = "Copy";
      btn.addEventListener("click", () => {
        const text = codeEl.textContent || "";
        if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = "Copy"; }, 1400);
      });
      pre.appendChild(btn);
    });

    // External link targeting
    el.querySelectorAll("a[href^='http']").forEach((a) => {
      if (!a.hasAttribute("target")) a.setAttribute("target", "_blank");
      if (!a.hasAttribute("rel")) a.setAttribute("rel", "noopener noreferrer");
    });
  }, [pageId]);

  // Compute prev/next from the flat list
  const flat = useMemo(flatPageList, []);
  const idx = flat.findIndex((p) => p.id === pageId);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  if (!doc) {
    return (
      <div className="flex-1 min-w-0 py-10 md:py-14 px-2 md:px-12">
        <div className="card rounded-2xl p-12 text-center text-[var(--fg-muted)]">No documentation found.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 py-10 md:py-14 px-2 md:px-12">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-[12px] text-[var(--fg-dim)] mb-6 flex-wrap">
          {doc.crumb.map((c, i) => (
            <React.Fragment key={i}>
              <span className={i === doc.crumb.length - 1 ? "text-white/80" : ""}>{c}</span>
              {i < doc.crumb.length - 1 && <Icon name="chevron-right" size={11} />}
            </React.Fragment>
          ))}
        </div>

        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
          Documentation · {doc.folderTitle}
        </div>
        <h1 className="mt-3 font-black tracking-tighter leading-[1.05] text-4xl md:text-5xl">
          {doc.pageTitle}
        </h1>

        <div
          ref={proseRef}
          className="mt-8 prose-suty"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />

        <div className="mt-16 pt-8 border-t border-[var(--border)] grid grid-cols-2 gap-3">
          {prev ? (
            <button onClick={() => onSelect(prev.id)} className="card card-lift rounded-lg p-4 text-left">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-dim)]">Previous</div>
              <div className="text-sm font-semibold mt-1 truncate">← {prev.title}</div>
              <div className="text-[11px] text-[var(--fg-dim)] mt-0.5 truncate">{prev.folderTitle}</div>
            </button>
          ) : <div />}
          {next ? (
            <button onClick={() => onSelect(next.id)} className="card card-lift rounded-lg p-4 text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-dim)]">Next</div>
              <div className="text-sm font-semibold mt-1 truncate">{next.title} →</div>
              <div className="text-[11px] text-[var(--fg-dim)] mt-0.5 truncate">{next.folderTitle}</div>
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}

function DocsPage() {
  const [active, setActive] = useState(DOCS_DEFAULT_ID);
  const [query, setQuery] = useState("");
  // Reset scroll on doc change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" }); }, [active]);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex">
        <DocsSidebar active={active} onSelect={setActive} query={query} setQuery={setQuery} />
        <DocsContent pageId={active} onSelect={setActive} />
      </div>
    </div>
  );
}

// Prose + docs HTML styles
const proseStyle = document.createElement("style");
proseStyle.textContent = `
  .prose-suty p { color: #c8c8c8; font-size: 14.5px; line-height: 1.75; margin-top: 0.9em; }
  .prose-suty h1 { color: #fff; font-weight: 800; letter-spacing: -0.02em; font-size: 22px; margin-top: 1.6em; margin-bottom: 0.4em; }
  .prose-suty h2 { color: #fff; font-weight: 700; letter-spacing: -0.02em; font-size: 18px; margin-top: 2.2em; margin-bottom: 0.5em; }
  .prose-suty h3 { color: #fff; font-weight: 700; font-size: 15px; margin-top: 1.8em; margin-bottom: 0.4em; }
  .prose-suty h4 { color: #fff; font-weight: 600; font-size: 14px; margin-top: 1.5em; margin-bottom: 0.3em; text-transform: uppercase; letter-spacing: 0.12em; color: #888; }
  .prose-suty ul, .prose-suty ol { margin-top: 0.6em; padding-left: 1.1em; }
  .prose-suty li { color: #c8c8c8; font-size: 14px; line-height: 1.8; padding-left: 0.25em; }
  .prose-suty ul li { list-style: disc; }
  .prose-suty ol li { list-style: decimal; }
  .prose-suty li::marker { color: #5a5a5a; }
  .prose-suty strong { color: #fff; font-weight: 700; }
  .prose-suty em { color: #d8d8d8; font-style: italic; }
  .prose-suty a { color: #fca5a5; text-decoration: underline; text-underline-offset: 3px; transition: color 150ms ease; }
  .prose-suty a:hover { color: #ffb4b4; }
  .prose-suty code { color: #fca5a5; background: rgba(0,0,0,0.4); padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.92em; font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace; }
  .prose-suty hr { border: none; border-top: 1px solid #1a1a1a; margin: 2.5em 0; }
  .prose-suty blockquote { border-left: 3px solid #991b1b; padding-left: 1em; margin: 1em 0; color: #b8b8b8; font-style: italic; }

  /* Tables */
  .prose-suty table { width: 100%; margin: 1.2em 0; border-collapse: collapse; font-size: 13.5px; }
  .prose-suty thead { background: #0c0c0c; }
  .prose-suty th, .prose-suty td { padding: 0.55em 0.8em; border-bottom: 1px solid #1a1a1a; text-align: left; }
  .prose-suty th { color: #fff; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.14em; color: #888; }
  .prose-suty td { color: #c8c8c8; }

  /* Code blocks */
  .prose-suty pre.docs-pre { position: relative; background: #070707; border: 1px solid #1a1a1a; border-radius: 10px; padding: 1em 1em 1em 1em; padding-top: 2.4em; overflow-x: auto; margin: 1em 0; font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.65; }
  .prose-suty pre.docs-pre code { background: transparent; color: #d4d4d4; padding: 0; border-radius: 0; font-size: 13px; }
  .prose-suty .docs-copy { position: absolute; top: 0.55em; right: 0.55em; height: 26px; padding: 0 0.6em; border-radius: 6px; border: 1px solid #222; background: #0a0a0a; color: #888; font-size: 11px; font-weight: 600; cursor: pointer; transition: color 150ms ease, border-color 150ms ease, background 150ms ease; }
  .prose-suty .docs-copy:hover { color: #fff; border-color: #3a3a3a; background: rgba(255,255,255,0.03); }

  /* Hint boxes */
  .prose-suty .docs-hint { padding: 0.9em 1em; border-radius: 10px; margin: 1.1em 0; border: 1px solid; display: flex; gap: 0.7em; align-items: flex-start; }
  .prose-suty .docs-hint::before { content: "i"; flex-shrink: 0; width: 1.4em; height: 1.4em; display: grid; place-items: center; border-radius: 999px; font-weight: 700; font-size: 11px; font-family: ui-monospace, SFMono-Regular, monospace; margin-top: 0.15em; }
  .prose-suty .docs-hint p { margin-top: 0; font-size: 13.5px; line-height: 1.7; }
  .prose-suty .docs-hint p:first-child { margin-top: 0.1em; }
  .prose-suty .docs-hint-info { border-color: rgba(59,130,246,0.28); background: linear-gradient(180deg, rgba(59,130,246,0.07), rgba(59,130,246,0.02)); }
  .prose-suty .docs-hint-info::before { background: rgba(59,130,246,0.2); color: #93c5fd; }
  .prose-suty .docs-hint-tip { border-color: rgba(34,211,238,0.28); background: linear-gradient(180deg, rgba(34,211,238,0.06), rgba(34,211,238,0.02)); }
  .prose-suty .docs-hint-tip::before { background: rgba(34,211,238,0.2); color: #a5f3fc; content: "✓"; }
  .prose-suty .docs-hint-warning { border-color: rgba(251,191,36,0.32); background: linear-gradient(180deg, rgba(251,191,36,0.07), rgba(251,191,36,0.02)); }
  .prose-suty .docs-hint-warning::before { background: rgba(251,191,36,0.2); color: #fde68a; content: "!"; }
  .prose-suty .docs-hint-danger { border-color: rgba(248,113,113,0.34); background: linear-gradient(180deg, rgba(248,113,113,0.08), rgba(248,113,113,0.02)); }
  .prose-suty .docs-hint-danger::before { background: rgba(248,113,113,0.2); color: #fca5a5; content: "!"; }
  .prose-suty .docs-hint-success { border-color: rgba(74,222,128,0.32); background: linear-gradient(180deg, rgba(74,222,128,0.07), rgba(74,222,128,0.02)); }
  .prose-suty .docs-hint-success::before { background: rgba(74,222,128,0.2); color: #86efac; content: "✓"; }

  /* Embed iframes */
  .prose-suty .docs-embed { position: relative; padding-bottom: 56.25%; margin: 1.2em 0; border-radius: 12px; overflow: hidden; border: 1px solid #1a1a1a; background: #000; }
  .prose-suty .docs-embed iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  .prose-suty .docs-embed-link { display: inline-block; padding: 0.5em 0.9em; border-radius: 8px; border: 1px solid #1a1a1a; background: #0a0a0a; color: #fca5a5; font-size: 13px; text-decoration: none; transition: border-color 150ms ease; }
  .prose-suty .docs-embed-link:hover { border-color: #991b1b; }
  .prose-suty .docs-file { display: inline-flex; align-items: center; gap: 0.5em; padding: 0.5em 0.9em; border-radius: 8px; border: 1px solid #1a1a1a; background: #0a0a0a; color: #fff; font-size: 13px; font-weight: 600; text-decoration: none; transition: border-color 150ms ease; }
  .prose-suty .docs-file::before { content: "⬇"; color: #fca5a5; }
  .prose-suty .docs-file:hover { border-color: #991b1b; }

  /* Images */
  .prose-suty img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #1a1a1a; margin: 0.8em 0; }
`;
document.head.appendChild(proseStyle);

Object.assign(window, { DocsPage });
