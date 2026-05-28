// ─── App entry ─────────────────────────────────────────────────────────

function App() {
  const [page, setPage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  const onAdd = useCallback((script) => {
    cart.add(script);
    // briefly open the cart? — no, just bump the badge; keeps the flow smooth.
  }, [cart]);

  // Reset scroll on page switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [page]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header page={page} setPage={setPage} onOpenCart={() => setCartOpen(true)} />

      <main key={page} className="flex-1 page-transition">
        {page === "home"           && <LandingPage onAdd={onAdd} setPage={setPage} />}
        {page === "scripts"        && <ScriptsPage onAdd={onAdd} />}
        {page === "subscriptions"  && <SubscriptionsPage onAdd={onAdd} />}
        {page === "docs"           && <DocsPage />}
        {page === "about"          && <AboutPage />}
      </main>

      <Footer setPage={setPage} />

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
