// ─── App entry ─────────────────────────────────────────────────────────

function App() {
  const [page, setPage] = useState("home");
  const [viewedProduct, setViewedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

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
