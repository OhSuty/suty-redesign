// ─── Bradley AI chat — floating launcher + portal-rendered panel ───────
//
// Talks to https://suty.dev/api/bradley-simple (non-streaming JSON
// wrapper around the main site's Bradley setup — same prompt, tools,
// rate limit, CORS-allowlisted for these preview origins).
//
// State persists in localStorage so the conversation survives reloads.

const BRADLEY_URL  = "https://suty.dev/api/bradley-simple";
const BRADLEY_KEY  = "suty.bradley.messages";
const BRADLEY_SEEN = "suty.bradley.seen";

function loadStoredMessages(){
  try {
    const raw = localStorage.getItem(BRADLEY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function uid(){ return Math.random().toString(36).slice(2, 10); }

// Tiny markdown renderer — links + bold + line breaks, nothing else
function BradleyMarkdown({ text }) {
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const parts = [];
  let last = 0, key = 0, m;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) parts.push(applyBold(text.slice(last, m.index), key++));
    parts.push(
      <a key={`a-${key++}`} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-[#fecaca]">
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(applyBold(text.slice(last), key++));
  return <React.Fragment>{parts}</React.Fragment>;
}
function applyBold(text, baseKey){
  const boldRe = /\*\*([^*]+)\*\*/g;
  const out = []; let last = 0, key = 0, m;
  while ((m = boldRe.exec(text)) !== null) {
    if (m.index > last) out.push(splitLines(text.slice(last, m.index), `${baseKey}-t-${key++}`));
    out.push(<strong key={`${baseKey}-b-${key++}`} className="font-bold">{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(splitLines(text.slice(last), `${baseKey}-t-${key++}`));
  return <span key={`${baseKey}-w`}>{out}</span>;
}
function splitLines(text, key){
  const lines = String(text).split(/\n/);
  return (
    <span key={key}>
      {lines.map((line, i) => (
        <span key={`${key}-${i}`}>{line}{i < lines.length - 1 && <br />}</span>
      ))}
    </span>
  );
}

function BradleyBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <li className={"flex " + (isUser ? "justify-end" : "justify-start")}>
      <div className={
        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
        (isUser ? "bg-[var(--accent)] text-white"
                : "border border-[var(--border)] bg-black text-white")
      }>
        <BradleyMarkdown text={text} />
      </div>
    </li>
  );
}

function BradleyTyping(){
  return (
    <li className="flex justify-start">
      <div className="rounded-2xl border border-[var(--border)] bg-black px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent-hover)] [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent-hover)] [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent-hover)]" />
        </div>
      </div>
    </li>
  );
}

function BradleyWelcome({ onPick }) {
  const suggestions = [
    "What scripts do you have?",
    "Do they support QBCore?",
    "How do I install a script?",
    "I bought one but can't find the download"
  ];
  return (
    <div>
      <div className="mb-2 text-base font-semibold text-white sm:text-sm">Hey, I'm Bradley 👋</div>
      <p className="mb-5 text-sm text-[var(--fg-muted)]">
        Ask me anything about Suty's FiveM scripts — compatibility, install, finding the right resource, you name it.
      </p>
      <div className="grid gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-lg border border-[var(--border)] bg-black/40 px-4 py-3 text-left text-sm text-white transition-colors active:border-[var(--accent)] active:text-[var(--accent-hover)] sm:px-3 sm:py-2 sm:text-xs sm:hover:border-[var(--accent)] sm:hover:text-[var(--accent-hover)]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function BradleyChat() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const stored = loadStoredMessages();
    if (stored.length > 0) setMessages(stored);
    const seen = localStorage.getItem(BRADLEY_SEEN);
    if (!seen) {
      const t = setTimeout(() => setPulsing(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      if (messages.length === 0) localStorage.removeItem(BRADLEY_KEY);
      else localStorage.setItem(BRADLEY_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages, mounted]);

  useEffect(() => {
    if (open && endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Lock body scroll when chat is open on mobile
  useEffect(() => {
    if (!open) return;
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function toggle() {
    setOpen((v) => !v);
    if (pulsing) {
      setPulsing(false);
      try { localStorage.setItem(BRADLEY_SEEN, "1"); } catch {}
    }
  }

  async function send(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed || busy) return;
    setError(null);
    const userMsg = {
      id: uid(),
      role: "user",
      // AI-SDK-compatible UIMessage shape — the wrapper endpoint passes
      // these straight into convertToModelMessages.
      parts: [{ type: "text", text: trimmed }]
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(BRADLEY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Something went wrong. Try again or hop on Discord.");
        setBusy(false);
        return;
      }
      const reply = String(data.text || "").trim();
      if (!reply) {
        setError("Empty reply — give it another try.");
        setBusy(false);
        return;
      }
      setMessages((prev) => [...prev, {
        id: uid(),
        role: "assistant",
        parts: [{ type: "text", text: reply }]
      }]);
    } catch (err) {
      setError((err && err.message) || String(err));
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    send(input);
  }

  function clearChat() {
    setMessages([]);
    setError(null);
    try { localStorage.removeItem(BRADLEY_KEY); } catch {}
  }

  if (!mounted) return null;

  // Helper to flatten UIMessage parts → display text
  const partsText = (m) =>
    (m.parts || []).filter((p) => p && p.type === "text" && typeof p.text === "string")
                   .map((p) => p.text).join("");

  return ReactDOM.createPortal(
    <React.Fragment>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Close Bradley chat" : "Chat with Bradley"}
        aria-expanded={open}
        style={{
          bottom: "max(1rem, env(safe-area-inset-bottom))",
          right:  "max(1rem, env(safe-area-inset-right))"
        }}
        className={
          "fixed z-[60] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_10px_30px_rgba(0,0,0,0.45),0_0_24px_rgba(153,27,27,0.5)] transition-transform active:scale-95 sm:h-16 sm:w-16 sm:hover:scale-105 " +
          (pulsing ? "bradley-pulse " : "") +
          (open ? "sm:flex hidden" : "")
        }
      >
        {open ? <BradleyCloseIcon /> : <BradleyChatIcon />}
        {!open && messages.length === 0 && pulsing && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-white" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed inset-0 z-[59] flex h-[100dvh] flex-col bg-black sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[600px] sm:max-h-[80vh] sm:w-[380px] sm:rounded-2xl sm:border sm:border-[var(--border)] sm:bg-[var(--surface)] sm:shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
          role="dialog"
          aria-label="Bradley chat"
        >
          <header
            className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-5 sm:py-4"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] font-black text-white shadow-[0_0_14px_rgba(153,27,27,0.45)] sm:h-9 sm:w-9">B</div>
              <div>
                <div className="text-base font-bold text-white sm:text-sm">Bradley</div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--fg-muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  Suty assistant
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="rounded-md px-3 py-2 text-xs text-[var(--fg-muted)] transition-colors active:text-white sm:px-2 sm:py-1 sm:text-[11px] sm:hover:text-white"
                  title="Clear conversation"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={toggle}
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--fg-muted)] transition-colors active:bg-black active:text-white sm:h-8 sm:w-8 sm:hover:bg-black sm:hover:text-white"
              >
                <BradleyCloseIcon />
              </button>
            </div>
          </header>

          <div
            className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {messages.length === 0 ? (
              <BradleyWelcome onPick={send} />
            ) : (
              <ul className="space-y-3">
                {messages.map((m) => (
                  <BradleyBubble key={m.id} role={m.role} text={partsText(m)} />
                ))}
                {busy && <BradleyTyping />}
                <div ref={endRef} />
              </ul>
            )}

            {error && (
              <div className="mt-3 rounded-md border border-[var(--accent)] bg-[rgba(153,27,27,0.1)] p-3 text-xs text-[var(--accent-hover)]">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-[var(--border)] p-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-black px-3 py-2 focus-within:border-[var(--accent)]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about Suty…"
                disabled={busy}
                maxLength={500}
                autoComplete="off"
                autoCorrect="on"
                spellCheck
                enterKeyHint="send"
                inputMode="text"
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[var(--fg-muted)] disabled:opacity-60 sm:text-sm"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
              >
                <BradleySendIcon />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[var(--fg-muted)]">
              Bradley is AI-assisted. For anything urgent, jump in{" "}
              <a href={Tebex.DISCORD_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-hover)] hover:underline">Discord</a>.
            </p>
          </form>
        </div>
      )}
    </React.Fragment>,
    document.body
  );
}

function BradleyChatIcon(){
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function BradleyCloseIcon(){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function BradleySendIcon(){
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

window.BradleyChat = BradleyChat;
