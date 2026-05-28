// ─── App entry ─────────────────────────────────────────────────────────

function App() {
  const [page, setPage] = useState("home");
  const [viewedProduct, setViewedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null); // { tone, title, body } | null
  const cart = useCart();

  // ── Post-redirect handlers — runs once on first render ──
  // Tebex / FiveM bounces the user back with a query param. We act on it,
  // strip the param so a reload doesn't repeat the action, and show feedback.
  const handledReturnRef = useRef(false);
  useEffect(() => {
    if (handledReturnRef.current) return;
    handledReturnRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const fivem    = params.get("fivem");
    if (!checkout && !fivem) return;

    // Wipe the query so a refresh doesn't re-fire any of this
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, "", cleanUrl);

    if (checkout === "success") {
      cart.clearLocal();
      setToast({
        tone: "success",
        title: "Thank you for your purchase!",
        body: "Your scripts have been delivered via Tebex. Grant your CFX assets at portal.cfx.re or hop in the Discord for setup help.",
      });
      return;
    }
    if (checkout === "cancelled") {
      setToast({
        tone: "cancel",
        title: "Checkout cancelled",
        body: "Your cart is still here whenever you're ready. No charge was made.",
      });
      setCartOpen(true);
      return;
    }
    if (fivem === "return") {
      // FiveM auth complete — rebuild the Tebex basket from the pending
      // item list we stashed before redirecting, then forward straight to
      // Tebex's hosted checkout. This matches the 'click Checkout once,
      // not Checkout-twice-with-an-auth-detour' UX.
      (async () => {
        const pendingRaw = localStorage.getItem(Tebex.PENDING_KEY);
        localStorage.removeItem(Tebex.PENDING_KEY);
        let pendingIds = [];
        try {
          const parsed = JSON.parse(pendingRaw);
          pendingIds = Array.isArray(parsed) ? parsed : (Number.isFinite(Number(parsed)) ? [Number(parsed)] : []);
        } catch {
          const single = Number(pendingRaw);
          if (Number.isFinite(single)) pendingIds = [single];
        }

        let basket = await cart.refreshBasket();
        if (!basket) {
          // Lost the basket on the way back — start a fresh one
          try {
            basket = await Tebex.createBasket();
            localStorage.setItem(Tebex.STORAGE_KEY, basket.ident);
          } catch (err) {
            console.warn("[fivem-return] couldn't recreate basket", err);
          }
        }

        if (basket && pendingIds.length > 0) {
          for (const id of pendingIds) {
            try {
              basket = await Tebex.addPackageToBasket(basket.ident, Number(id), 1);
            } catch (err) {
              console.warn(`[fivem-return] failed to re-add package ${id}`, err);
            }
          }
        }

        if (basket && basket.links && basket.links.checkout && pendingIds.length > 0) {
          // Forward directly to Tebex hosted checkout
          window.location.href = basket.links.checkout;
          return;
        }

        // No pending items (user just connected, not mid-purchase) → toast + cart drawer
        setCartOpen(true);
        setToast({
          tone: "success",
          title: basket && basket.username ? `Linked as ${basket.username}` : "FiveM linked",
          body: "Your account is connected. Add scripts to your cart and check out any time.",
        });
      })();
    }
  }, [cart]);

  const onAdd = useCallback((script) => {
    cart.add(script);
    // briefly open the cart? — no, just bump the badge; keeps the flow smooth.
  }, [cart]);

  const onOpen = useCallback((script) => {
    setViewedProduct(script);
  }, []);

  const onCloseProduct = useCallback(() => {
    setViewedProduct(null);
  }, []);

  // Switching nav tabs also clears any open product
  const goToPage = useCallback((p) => {
    setViewedProduct(null);
    setPage(p);
  }, []);

  // Reset scroll on page or product switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [page, viewedProduct && viewedProduct.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header page={page} setPage={goToPage} onOpenCart={() => setCartOpen(true)} />

      {viewedProduct ? (
        <main key={`product-${viewedProduct.id}`} className="flex-1 page-transition">
          <ProductDetailPage script={viewedProduct} onBack={onCloseProduct} onAdd={onAdd} />
        </main>
      ) : (
        <main key={page} className="flex-1 page-transition">
          {page === "home"           && <LandingPage onAdd={onAdd} onOpen={onOpen} setPage={goToPage} />}
          {page === "scripts"        && <ScriptsPage onAdd={onAdd} onOpen={onOpen} />}
          {page === "subscriptions"  && <SubscriptionsPage onAdd={onAdd} onOpen={onOpen} />}
          {page === "docs"           && <DocsPage />}
          {page === "about"          && <AboutPage />}
        </main>
      )}

      <Footer setPage={goToPage} />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <Toast
        open={!!toast}
        onClose={() => setToast(null)}
        tone={toast && toast.tone}
        title={toast && toast.title}
      >
        {toast && toast.body}
      </Toast>
    </div>
  );
}

function Root() {
  return (
    <ScriptsProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ScriptsProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
