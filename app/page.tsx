"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import {
  ShoppingCart,
  Wallet,
  LogIn,
  X,
  User,
  History,
  Search,
  ShieldCheck,
  Zap,
  Award,
  Trash2,
  MessageSquare,
  Box,
} from "lucide-react";

// ==========================================
// SUB-KOMPONEN: PRODUCT CARD DENGAN BADGE STOK
// ==========================================
function ProductCard({ product, session, addToCart, handleInstantBuy }: { 
  product: any; 
  session: any; 
  addToCart: (p: any, stock: number) => void; 
  handleInstantBuy: (id: string, stock: number) => void; 
}) {
  const [stockCount, setStockCount] = useState<number>(0);
  const [loadingStock, setLoadingStock] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStock() {
      setLoadingStock(true);
      const { count, error } = await supabase
        .from("account_stocks")
        .select("*", { count: "exact", head: true })
        .eq("product_id", product.id)
        .eq("is_sold", false);

      if (!error && count !== null) {
        setStockCount(count);
      }
      setLoadingStock(false);
    }

    fetchStock();

    // Listener Real-time biar stok di beranda update otomatis kalau laku terjual
    const channel = supabase
      .channel(`home-stock-${product.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "account_stocks", filter: `product_id=eq.${product.id}` },
        () => {
          fetchStock();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product.id]);

  return (
    <div className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-zinc-850 transition-all group">
      
      {/* LINK KE DETAIL PRODUK */}
      <Link href={`/product/${product.id}`} className="block space-y-4 cursor-pointer group/link">
        <div className="overflow-hidden rounded-xl bg-zinc-900 relative">
          <img
            src={product.image || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600"}
            alt={product.title}
            className="w-full aspect-video object-cover group-hover/link:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover/link:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-zinc-950/80 border border-zinc-800 px-4 py-2 rounded-xl backdrop-blur-sm shadow-xl">
              Lihat Detail
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-850 rounded text-[9px] font-bold uppercase tracking-tight">
              {product.category}
            </span>

            {/* BADGE STOK DINAMIS DI HALAMAN UTAMA */}
            {loadingStock ? (
              <span className="text-[10px] text-zinc-600 font-mono animate-pulse">Memuat stok...</span>
            ) : (
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                stockCount > 0 
                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/40" 
                  : "bg-red-950/30 text-red-400 border-red-900/40"
              }`}>
                <Box size={10} />
                {stockCount > 0 ? `Stok: ${stockCount}` : "Habis"}
              </span>
            )}
          </div>
          
          <h3 className="text-[13px] font-bold text-zinc-200 group-hover/link:text-[#D4AF37] transition-colors line-clamp-2 pt-1 leading-snug">
            {product.title}
          </h3>
        </div>
      </Link>

      {/* HARGA & PANEL TOMBOL */}
      <div className="space-y-3 pt-2">
        <p className="text-lg font-black text-white font-mono tracking-tight">
          Rp {Number(product.price || 0).toLocaleString("id-ID")}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {/* Tombol Keranjang */}
          <button
            onClick={() => addToCart(product, stockCount)}
            disabled={stockCount === 0}
            className={`flex items-center justify-center gap-2 border rounded-xl py-2.5 text-xs font-bold transition-all ${
              stockCount > 0 
                ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800 cursor-pointer" 
                : "bg-zinc-900/40 text-zinc-600 border-zinc-900 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={13} /> Keranjang
          </button>

          {/* Tombol Beli */}
          <button
            onClick={() => handleInstantBuy(product.id, stockCount)}
            disabled={stockCount === 0}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] ${
              stockCount > 0 
                ? "bg-zinc-100 text-zinc-950 hover:bg-[#D4AF37] cursor-pointer" 
                : "bg-zinc-900/20 text-zinc-600 cursor-not-allowed border border-zinc-900"
            }`}
          >
            <Wallet size={13} /> Beli
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// HALAMAN UTAMA (HOMEPAGE)
// ==========================================
export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch jumlah item keranjang dari Supabase
  async function fetchCartCount(userEmail: string) {
    const { data, error } = await supabase
      .from("cart")
      .select("id, product_id, product:product_id(id, title, price, image, category)")
      .eq("user_email", userEmail);

    if (!error && data) {
      // Simpan data produk ke state cart supaya badge & modal tetap akurat
      setCart(data.map((item: any) => item.product).filter(Boolean));
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        fetchCartCount(session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        fetchCartCount(session.user.email);
      } else {
        setCart([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchRealProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const validProducts = data.filter(
          (p: any) => p.category === "Albion Online" || p.category === "Volleyball Legends"
        );
        setProducts(validProducts);
      }
      setLoading(false);
    }

    fetchRealProducts();
  }, []);

  // Fungsi Tambah ke Keranjang — simpan ke Supabase
  const addToCart = async (product: any, currentStock: number) => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if (currentStock === 0) {
      alert("Maaf, stok produk ini sudah habis!");
      return;
    }

    // Cek apakah sudah ada di keranjang
    const { data: existing } = await supabase
      .from("cart")
      .select("id")
      .eq("user_email", session.user.email)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      alert("Produk ini sudah ada di keranjangmu!");
      return;
    }

    const { error } = await supabase.from("cart").insert({
      user_email: session.user.email,
      product_id: product.id,
      quantity: 1,
    });

    if (!error) {
      await fetchCartCount(session.user.email);
      alert(`✅ "${product.title}" berhasil ditambahkan ke keranjang!`);
    } else {
      alert("Gagal menambahkan ke keranjang. Silakan coba lagi.");
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Fungsi Beli Instan
  const handleInstantBuy = (productId: string, currentStock: number) => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if (currentStock === 0) {
      alert("Maaf, stok produk ini sudah habis!");
      return;
    }

    window.location.href = `/checkout/${productId}`;
  };

  const handleHistoryClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  const handleChatAdminClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda ingin log out?");
    if (!confirmLogout) return;
    
    await supabase.auth.signOut();
    setSession(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCartPrice = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-[#D4AF37] selection:text-zinc-950 relative">
      
      {/* NAVBAR GLOBAL */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/70 border-b border-zinc-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tighter text-white">
            T<span className="text-[#D4AF37]">i</span>xa Store
          </Link>

          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                if (!session) setShowLoginModal(true);
                else window.location.href = "/cart";
              }}
              className="text-zinc-400 hover:text-[#D4AF37] relative transition-colors pt-1"
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-zinc-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>

            <Link
              href="/history"
              onClick={handleHistoryClick}
              className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              <History size={14} /> Riwayat
            </Link>

            {session ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-400">
                  <User size={12} className="text-[#D4AF37]" />
                  <div className="flex flex-col">
                    <span>{session.user.email?.split("@")[0]}</span>
                    <span className="text-[9px] text-zinc-600">{session.user.email}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-zinc-900 border border-zinc-800 hover:border-red-500 text-zinc-300 px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-zinc-100 hover:bg-[#D4AF37] text-zinc-950 text-xs font-black px-4 py-2 rounded-xl transition-all uppercase tracking-wider shadow-md"
              >
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-12 space-y-6">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
          AMANKAN AKUN IMPIANMU <br />
          SECARA <span className="text-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-amber-200 bg-clip-text text-transparent">OTOMATIS & INSTAN</span>
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Platform distribusi akun game polos, bergaransi, dan tervalidasi ketat. Bayar via QRIS otomatis, kredensial akun langsung dikirim detik itu juga.
        </p>

        <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto pt-4 text-center border-t border-zinc-900/60">
          <div className="space-y-1">
            <Zap size={16} className="text-[#D4AF37] mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Pengiriman Instan</p>
          </div>
          <div className="space-y-1">
            <ShieldCheck size={16} className="text-emerald-400 mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">100% Data Polos</p>
          </div>
          <div className="space-y-1">
            <Award size={16} className="text-blue-400 mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Garansi Penuh</p>
          </div>
        </div>
      </section>

      {/* BAR PENCARIAN & KATEGORI */}
      <section className="max-w-6xl mx-auto px-6 py-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="flex flex-wrap gap-1.5 order-2 md:order-1">
            {["Semua", "Albion Online", "Volleyball Legends"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                  selectedCategory === cat
                    ? "bg-zinc-900 text-[#D4AF37] border border-zinc-800"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 order-1 md:order-2">
            <Search className="absolute left-3 top-2.5 text-zinc-600" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari spesifikasi akun..."
              className="w-full bg-zinc-900/30 border border-zinc-900 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>
        </div>
      </section>

      {/* RENDER KATALOG UTAMA MENGGUNAKAN SUB-KOMPONEN BARU */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center py-16 text-zinc-600 text-xs font-medium animate-pulse font-mono tracking-wide">
            Sinkronisasi katalog produk dengan database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-2xl">
            <p className="text-xs text-zinc-500 font-medium">Belum ada item dagangan yang aktif di kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                session={session}
                addToCart={addToCart}
                handleInstantBuy={handleInstantBuy}
              />
            ))}
          </div>
        )}
      </main>

      {/* FLOATING BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/dashboard/chat"
          onClick={handleChatAdminClick}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-100 border border-zinc-800 font-bold text-xs px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 uppercase tracking-wider group"
        >
          <MessageSquare size={16} className="text-[#D4AF37] animate-pulse" />
          <span>Chat Admin</span>
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-6 text-center text-[10px] text-zinc-600 font-mono tracking-wider">
        © 2026 TIXA STORE SYSTEM ID. ALL RIGHTS RESERVED.
      </footer>

      {/* MODAL: POP-UP AUTH GOOGLE */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-850 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl text-center space-y-5">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X size={16} />
            </button>

            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center mx-auto">
              <LogIn className="text-[#D4AF37]" size={20} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Satu Langkah Lagi</h3>
              <p className="text-[11px] text-zinc-500 max-w-[240px] mx-auto leading-relaxed">
                Silakan masuk dengan Google terlebih dahulu agar seluruh riwayat belanja dan keranjang Anda terikat aman secara otomatis.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-zinc-100 text-zinc-950 font-bold text-xs py-3 rounded-xl hover:bg-[#D4AF37] transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Masuk via Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}