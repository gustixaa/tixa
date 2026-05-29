"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { Key, Copy, CheckCircle2, ArrowLeft, ShoppingBag, User, LogIn, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndFetchHistory() {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      setUserSession(session);

      if (session?.user?.email) {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            order_id,
            status,
            created_at,
            customer_email,
            account_data,
            product (
              title,
              price,
              category
            )
          `)
          .eq("customer_email", session.user.email)
          // Hanya tampilkan order yang sudah lunas — pending tidak ditampilkan
          .in("status", ["settlement", "success"])
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data);
        } else if (error) {
          console.error("Gagal memuat riwayat:", error.message);
        }
      }
      setLoading(false);
    }

    checkAuthAndFetchHistory();
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/history",
      },
    });
  };

  const handleLogout = async () => {
    if (confirm("Apakah Anda ingin keluar dari akun Tixa?")) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLaporKendala = (order: any) => {
    const pesanAwal = `Halo admin, saya ingin melaporkan kendala pada pesanan saya.\n\nOrder ID: ${order.order_id}\nProduk: ${order.product?.title || "Unknown"}\n\nKendala saya: `;
    localStorage.setItem("chat_prefill", pesanAwal);
    router.push("/dashboard/chat");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-[#D4AF37] selection:text-zinc-950">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/70 border-b border-zinc-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <Link href="/">
              <span className="text-xl font-black tracking-tighter text-white">
                T<span className="text-[#D4AF37]">i</span>xa
              </span>
            </Link>
          </div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Secure History Portal</span>
        </div>
      </header>

      {/* AREA UTAMA */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16 space-y-8">

        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-zinc-500 font-mono text-xs gap-2">
            <Loader2 className="animate-spin text-[#D4AF37]" size={18} />
            Mengotentikasi kredensial keamanan akun...
          </div>
        ) : !userSession ? (

          /* TAMPILAN GUEST */
          <div className="max-w-md mx-auto text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <LogIn className="text-[#D4AF37]" size={24} />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-white tracking-tight uppercase">Akses Riwayat Terkunci</h1>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Untuk melihat daftar akun game yang pernah Anda beli, silakan masuk menggunakan akun Google Anda terlebih dahulu.
              </p>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-zinc-100 text-zinc-950 font-bold text-xs py-3.5 rounded-xl hover:bg-[#D4AF37] transition-all duration-300 shadow-md flex items-center justify-center gap-2.5 uppercase tracking-wider"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Masuk Dengan Google
            </button>
          </div>

        ) : (

          /* TAMPILAN SUDAH LOGIN */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
              <div>
                <h1 className="text-xl font-black text-white tracking-tight uppercase">Daftar Pembelian Anda</h1>
                <p className="text-xs text-zinc-500 mt-1">Menampilkan seluruh transaksi game yang terikat resmi pada akun Anda.</p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-850 px-3 py-2 rounded-xl text-xs font-mono text-zinc-400">
                  <User size={13} className="text-[#D4AF37]" />
                  {userSession.user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-zinc-900 hover:bg-rose-950/20 text-zinc-500 hover:text-rose-400 border border-zinc-850 rounded-xl transition-all"
                  title="Keluar Akun"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {orders.length === 0 ? (
                <div className="bg-zinc-900/10 border border-dashed border-zinc-900 rounded-2xl p-14 text-center max-w-xl mx-auto space-y-4">
                  <ShoppingBag className="mx-auto text-zinc-700" size={32} />
                  <p className="text-xs text-zinc-500 font-medium">Akun Anda terhubung, namun belum ada transaksi pembelian terdaftar.</p>
                  <Link href="/" className="inline-block bg-zinc-100 text-zinc-950 font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#D4AF37] transition-all uppercase tracking-wider">
                    Mulai Belanja Akun
                  </Link>
                </div>
              ) : (
                orders.map((ord) => {
                  const isPaid = ord.status?.toLowerCase() === "settlement" || ord.status?.toLowerCase() === "success";

                  return (
                    <div key={ord.id} className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 md:p-6 space-y-4 backdrop-blur-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900/60 pb-4">
                        <div>
                          <span className="text-[10px] text-zinc-500 block font-mono">ORDER ID</span>
                          <span className="text-xs font-bold text-zinc-300 font-mono tracking-tight">{ord.order_id || `ID-${ord.id.substring(0, 8)}`}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-center">
                          Lunas
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold mb-0.5">Produk Terbeli</span>
                          <h3 className="font-bold text-white text-[13px] tracking-tight">{ord.product?.title || "Item Premium"}</h3>
                        </div>
                        <p className="font-black text-white font-mono text-[13px]">
                          Rp {ord.product?.price ? Number(ord.product.price).toLocaleString("id-ID") : Number(ord.total_price || 0).toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div className="pt-1 space-y-3">
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                            <Key size={12} /> Kredensial Data Akun Game
                          </div>
                          <pre className="text-xs font-mono bg-zinc-900/40 p-3 rounded-lg border border-zinc-850 text-zinc-200 overflow-x-auto whitespace-pre-wrap font-sans">
                            {ord.account_data || "Data akun sedang disiapkan oleh admin, silakan refresh berkala atau hubungi bantuan chat."}
                          </pre>
                          {ord.account_data && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(ord.account_data, ord.id)}
                              className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-850 rounded-lg text-xs font-semibold transition-all duration-200"
                            >
                              {copiedId === ord.id ? (
                                <><CheckCircle2 size={13} className="text-emerald-400" /> Berhasil Disalin!</>
                              ) : (
                                <><Copy size={13} /> Salin Data Akun</>
                              )}
                            </button>
                          )}

                          {/* TOMBOL LAPORKAN KENDALA */}
                          <button
                            type="button"
                            onClick={() => handleLaporKendala(ord)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold transition-all duration-200"
                          >
                            <AlertTriangle size={13} />
                            Laporkan Kendala
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
