"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Wallet,
  Box,
  ShieldCheck,
  Zap,
  Award,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [stockCount, setStockCount] = useState<number>(0);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    fetchProduct();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!product) return;

    fetchStock();

    // Realtime stok
    const channel = supabase
      .channel(`detail-stock-${product.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "account_stocks",
          filter: `product_id=eq.${product.id}`,
        },
        () => fetchStock()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product]);

  async function fetchProduct() {
    setLoadingProduct(true);
    const { data } = await supabase
      .from("product")
      .select("*")
      .eq("id", resolvedParams.id)
      .single();

    if (data) setProduct(data);
    setLoadingProduct(false);
  }

  async function fetchStock() {
    setLoadingStock(true);
    const { count, error } = await supabase
      .from("account_stocks")
      .select("*", { count: "exact", head: true })
      .eq("product_id", resolvedParams.id)
      .eq("is_sold", false);

    if (!error && count !== null) setStockCount(count);
    setLoadingStock(false);
  }

  async function handleAddToCart() {
    if (!session) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    if (stockCount === 0) {
      alert("Stok habis!");
      return;
    }

    setAddingToCart(true);

    // Cek apakah sudah ada di keranjang
    const { data: existing } = await supabase
      .from("cart")
      .select("id")
      .eq("user_email", session.user.email)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      alert("Produk ini sudah ada di keranjangmu!");
      setAddingToCart(false);
      return;
    }

    const { error } = await supabase.from("cart").insert({
      user_email: session.user.email,
      product_id: product.id,
    });

    if (!error) {
      alert("✅ Produk berhasil ditambahkan ke keranjang!");
    } else {
      alert("Gagal menambahkan ke keranjang. Silakan coba lagi.");
    }

    setAddingToCart(false);
  }

  function handleBuyNow() {
    if (!session) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    if (stockCount === 0) {
      alert("Stok habis!");
      return;
    }
    // Arahkan ke halaman checkout/pembayaran
    router.push(`/checkout/${product.id}`);
  }

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs gap-2">
        <Loader2 className="animate-spin text-[#D4AF37]" size={16} />
        Memuat detail produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <p className="text-xs font-mono">Produk tidak ditemukan.</p>
        <Link href="/" className="text-xs text-[#D4AF37] hover:underline">
          Kembali ke Toko
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Navigasi Atas */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#D4AF37] transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Kembali ke Katalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* GAMBAR PRODUK */}
          <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <img
              src={product.image || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600"}
              alt={product.title}
              className="w-full aspect-video object-cover"
            />
          </div>

          {/* INFO PRODUK */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Kategori & Stok */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded text-[9px] font-bold uppercase tracking-tight">
                  {product.category}
                </span>

                {loadingStock ? (
                  <span className="text-[10px] text-zinc-600 font-mono animate-pulse">Memuat stok...</span>
                ) : (
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    stockCount > 0
                      ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/40"
                      : "bg-red-950/30 text-red-400 border-red-900/40"
                  }`}>
                    <Box size={10} />
                    {stockCount > 0 ? `Stok tersedia: ${stockCount}` : "Stok Habis"}
                  </span>
                )}
              </div>

              {/* Judul */}
              <h1 className="text-xl font-black text-white leading-snug tracking-tight">
                {product.title}
              </h1>

              {/* Harga */}
              <p className="text-3xl font-black text-white font-mono">
                Rp {Number(product.price || 0).toLocaleString("id-ID")}
              </p>

              {/* Deskripsi */}
              {product.description && (
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
                  <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Keunggulan */}
            <div className="grid grid-cols-3 gap-2 border border-zinc-800 rounded-xl p-3">
              <div className="text-center space-y-1">
                <Zap size={14} className="text-[#D4AF37] mx-auto" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Instan</p>
              </div>
              <div className="text-center space-y-1">
                <ShieldCheck size={14} className="text-emerald-400 mx-auto" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Data Polos</p>
              </div>
              <div className="text-center space-y-1">
                <Award size={14} className="text-blue-400 mx-auto" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Garansi</p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={stockCount === 0 || addingToCart}
                className={`flex items-center justify-center gap-2 border rounded-xl py-3 text-xs font-bold transition-all ${
                  stockCount > 0
                    ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700 cursor-pointer"
                    : "bg-zinc-900/40 text-zinc-600 border-zinc-900 cursor-not-allowed"
                }`}
              >
                {addingToCart ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ShoppingCart size={13} />
                )}
                Keranjang
              </button>

              <button
                onClick={handleBuyNow}
                disabled={stockCount === 0}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] ${
                  stockCount > 0
                    ? "bg-zinc-100 text-zinc-950 hover:bg-[#D4AF37] cursor-pointer"
                    : "bg-zinc-900/20 text-zinc-600 cursor-not-allowed border border-zinc-900"
                }`}
              >
                <Wallet size={13} />
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
