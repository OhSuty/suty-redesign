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
        // Pending format evolved: legacy = id (number), middle = [id, id, ...],
        // current = [{ id, quantity }, ...]. Handle all three.
        let pending = [];
        try {
          const parsed = JSON.parse(pendingRaw);
          if (Array.isArray(parsed)) {
            pending = parsed.map((p) =>
              typeof p === "object" && p !== null
                ? { id: Number(p.id), quantity: Number(p.quantity) || 1 }
                : { id: Number(p), quantity: 1 }
            ).filter((p) => Number.isFinite(p.id));
          } else if (Number.isFinite(Number(parsed))) {
            pending = [{ id: Number(parsed), quantity: 1 }];
          }
        } catch {
          const single = Number(pendingRaw);
          if (Number.isFinite(single)) pending = [{ id: single, quantity: 1 }];
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

        if (basket && pending.length > 0) {
          for (const it of pending) {
            try {
              basket = await Tebex.addPackageToBasket(basket.ident, it.id, it.quantity);
            } catch (err) {
              console.warn(`[fivem-return] failed to re-add package ${it.id} (qty ${it.quantity})`, err);
            }
          }
        }

        if (basket && basket.links && basket.links.checkout && pending.length > 0) {
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

  // ── Add-to-cart with duplicate confirm ──
  // If the user clicks Add on a script that's already in their cart,
  // pause to confirm — and if they say yes, bump the quantity rather
  // than spawning a second line item.
  const [duplicateScript, setDuplicateScript] = useState(null);
  const onAdd = useCallback((script) => {
    if (cart.hasItem(script.id)) {
      setDuplicateScript(script);
      return;
    }
    cart.add(script);
  }, [cart]);

  const confirmAddDuplicate = useCallback(() => {
    if (duplicateScript) cart.incrementQuantity(duplicateScript.id);
    setDuplicateScript(null);
  }, [cart, duplicateScript]);
  const cancelAddDuplicate = useCallback(() => setDuplicateScript(null), []);

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

      <BradleyChat />

      <Toast
        open={!!toast}
        onClose={() => setToast(null)}
        tone={toast && toast.tone}
        title={toast && toast.title}
      >
        {toast && toast.body}
      </Toast>

      <ConfirmDialog
        open={!!duplicateScript}
        title="Already in your cart"
        message={
          duplicateScript
            ? `"${duplicateScript.displayName || duplicateScript.name}" is already in your basket. Add another copy and increase the quantity?`
            : ""
        }
        confirmLabel="Add another"
        cancelLabel="Keep current"
        onConfirm={confirmAddDuplicate}
        onCancel={cancelAddDuplicate}
      />
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
