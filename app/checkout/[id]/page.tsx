"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    snap: any;
  }
}

export default function Checkout({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetchProduct();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [resolvedParams.id]);

  async function fetchProduct() {
    const { data } = await supabase
      .from("product")
      .select("*")
      .eq("id", resolvedParams.id)
      .single();
    if (data) setProduct(data);
  }

  async function handleCheckout() {
    if (!session) {
      alert("Silakan login menggunakan Google terlebih dahulu!");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Minta token dari backend
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        alert(`Gagal menghubungi server: ${data.detail || data.error}`);
        setLoading(false);
        return;
      }

      // STEP 2: Simpan order dengan status "pending" SEBELUM snap.pay()
      const { error: insertError } = await supabase.from("orders").insert({
        product_id: resolvedParams.id,
        total_price: product.price,
        status: "pending",
        customer_email: session.user.email,
        order_id: data.orderId,
        account_data: null,
        delivered_email: null,
        delivered_password: null,
      });

      if (insertError) {
        console.error("Gagal simpan order:", insertError.message);
        alert("Terjadi kesalahan saat menyimpan order. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      // STEP 3: Tampilkan popup Midtrans
      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(data.token, {
          onSuccess: function () {
            setSuccess(true);
            setLoading(false);
          },
          onPending: function () {
            // Hapus order pending — jangan tampil di riwayat
            supabase.from("orders").delete().eq("order_id", data.orderId);
            setLoading(false);
            router.push("/");
          },
          onError: function () {
            // Hapus order pending kalau gagal
            supabase.from("orders").delete().eq("order_id", data.orderId);
            alert("Pembayaran gagal. Silakan coba lagi.");
            setLoading(false);
          },
          onClose: function () {
            // Hapus order pending kalau popup ditutup/dibatalkan
            supabase.from("orders").delete().eq("order_id", data.orderId);
            setLoading(false);
            router.push("/");
          },
        });
      } else {
        alert("Sistem pembayaran belum termuat. Coba refresh halaman (F5) lalu bayar lagi.");
        setLoading(false);
      }

    } catch (error: any) {
      console.error(error);
      alert(`Terjadi kesalahan: ${error.message}`);
      setLoading(false);
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs gap-2">
        <Loader2 className="animate-spin text-[#D4AF37]" size={16} />
        Memuat data transaksi...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#D4AF37] mb-8 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Kembali ke Katalog
        </Link>

        {success ? (
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 text-center shadow-xl space-y-4">
            <CheckCircle size={56} className="mx-auto text-[#D4AF37]" />
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Pembayaran Diterima!
              </h2>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">
                Sistem kami sedang memproses dan mengalokasikan akun game kamu secara otomatis.
                Silakan cek halaman riwayat dalam beberapa detik.
              </p>
            </div>
            <Link
              href="/history"
              className="block w-full bg-[#D4AF37] py-3.5 rounded-xl font-black text-zinc-950 hover:bg-amber-400 transition-all text-center text-xs uppercase tracking-widest shadow-md"
            >
              Lihat Riwayat Pembelian
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 shadow-xl">
            <h2 className="text-sm font-black text-white border-b border-zinc-800 pb-4 mb-6 uppercase tracking-wider">
              Informasi Pembayaran
            </h2>

            <div className="mb-6 space-y-1 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                Produk yang dibeli:
              </span>
              <p className="font-bold text-sm text-[#D4AF37] line-clamp-1">{product.title}</p>
              <p className="text-2xl font-black text-white font-mono pt-1">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 mb-8 flex items-start gap-3">
              <CreditCard className="text-[#D4AF37] shrink-0 mt-0.5" size={16} />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-tight">
                  Sistem Pembayaran Otomatis
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Bayar via{" "}
                  <span className="text-zinc-200 font-semibold">QRIS, GoPay, atau Bank Transfer</span>.
                  Akun game otomatis terkirim ke halaman riwayat setelah pembayaran terverifikasi.
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-zinc-100 py-4 rounded-xl font-black text-zinc-950 hover:bg-[#D4AF37] transition-all disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Memproses...
                </>
              ) : (
                "BAYAR SEKARANG"
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
