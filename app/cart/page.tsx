"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { ArrowLeft, ShoppingBag, Trash2, CheckCircle2, Loader2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    snap: any;
  }
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  // Menyimpan stok realtime per product_id
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        fetchCart(session.user.email);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function fetchCart(email: string) {
    try {
      const { data, error } = await supabase
        .from("cart")
        .select(`
          id,
          product_id,
          quantity,
          product (
            id,
            title,
            price,
            image,
            category
          )
        `)
        .eq("user_email", email);

      if (data) {
        setCartItems(data);
        const allIds = data.map((item: any) => item.id);
        setCheckedIds(allIds);

        // Ambil stok realtime untuk semua produk di keranjang
        const productIds = data.map((item: any) => item.product_id);
        await fetchStocks(productIds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStocks(productIds: string[]) {
    if (productIds.length === 0) return;

    const newStockMap: Record<string, number> = {};
    await Promise.all(
      productIds.map(async (pid) => {
        const { count } = await supabase
          .from("account_stocks")
          .select("*", { count: "exact", head: true })
          .eq("product_id", pid)
          .eq("is_sold", false);
        newStockMap[pid] = count ?? 0;
      })
    );
    setStockMap(newStockMap);
  }

  function toggleCheck(id: string) {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  }

  function handleSelectAll() {
    if (checkedIds.length === cartItems.length) {
      setCheckedIds([]);
    } else {
      const allIds = cartItems.map((item: any) => item.id);
      setCheckedIds(allIds);
    }
  }

  async function removeItem(id: string) {
    const { error } = await supabase.from("cart").delete().eq("id", id);
    if (!error) {
      setCartItems(cartItems.filter((item) => item.id !== id));
      setCheckedIds(checkedIds.filter((item) => item !== id));
    }
  }

  // Tambah quantity — dibatasi oleh stok yang tersedia
  async function increaseQty(item: any) {
    const stok = stockMap[item.product_id] ?? 0;
    const currentQty = item.quantity ?? 1;

    if (currentQty >= stok) {
      alert(`Stok hanya tersisa ${stok} untuk produk ini!`);
      return;
    }

    const newQty = currentQty + 1;
    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQty })
      .eq("id", item.id);

    if (!error) {
      setCartItems(cartItems.map((i) =>
        i.id === item.id ? { ...i, quantity: newQty } : i
      ));
    }
  }

  // Kurangi quantity — kalau sudah 1 dan dikurangi, hapus dari keranjang
  async function decreaseQty(item: any) {
    const currentQty = item.quantity ?? 1;

    if (currentQty <= 1) {
      if (confirm("Hapus produk ini dari keranjang?")) {
        await removeItem(item.id);
      }
      return;
    }

    const newQty = currentQty - 1;
    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQty })
      .eq("id", item.id);

    if (!error) {
      setCartItems(cartItems.map((i) =>
        i.id === item.id ? { ...i, quantity: newQty } : i
      ));
    }
  }

  const selectedItems = cartItems.filter((item) => checkedIds.includes(item.id));
  const totalPrice = selectedItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * (item.quantity ?? 1),
    0
  );

  async function handleCheckoutSelected() {
    if (!session) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Silakan ceklis minimal satu produk yang ingin dibayar!");
      return;
    }

    // Validasi stok sebelum checkout
    for (const item of selectedItems) {
      const stok = stockMap[item.product_id] ?? 0;
      if ((item.quantity ?? 1) > stok) {
        alert(`Stok "${item.product?.title}" tidak mencukupi! Tersisa ${stok}, kamu minta ${item.quantity}.`);
        return;
      }
    }

    if (selectedItems.length === 1 && (selectedItems[0].quantity ?? 1) === 1) {
      router.push(`/checkout/${selectedItems[0].product_id}`);
      return;
    }

    setCheckoutLoading(true);

    try {
      const firstItem = selectedItems[0];
      const qty = firstItem.quantity ?? 1;

      // Proses checkout per unit quantity — ambil token untuk 1 unit dulu
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: firstItem.product_id,
          quantity: qty,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        alert(`Gagal menghubungi server: ${data.detail || data.error}`);
        setCheckoutLoading(false);
        return;
      }

      // Simpan order dengan status pending SEBELUM snap.pay()
      const { error: insertError } = await supabase.from("orders").insert({
        product_id: firstItem.product_id,
        total_price: (firstItem.product?.price ?? 0) * qty,
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
        setCheckoutLoading(false);
        return;
      }

      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(data.token, {
          onSuccess: async function () {
            // Kurangi quantity atau hapus item dari keranjang
            if (qty <= 1) {
              await supabase.from("cart").delete().eq("id", firstItem.id);
              setCartItems((prev) => prev.filter((i) => i.id !== firstItem.id));
              setCheckedIds((prev) => prev.filter((i) => i !== firstItem.id));
            } else {
              const newQty = qty - 1;
              await supabase.from("cart").update({ quantity: newQty }).eq("id", firstItem.id);
              setCartItems((prev) =>
                prev.map((i) => i.id === firstItem.id ? { ...i, quantity: newQty } : i)
              );
            }

            setCheckoutLoading(false);
            const sisaItem = selectedItems.length - 1;
            if (sisaItem > 0) {
              alert(`✅ Pembayaran berhasil! Masih ada ${sisaItem} produk lain. Lanjutkan checkout untuk produk berikutnya.`);
            } else {
              alert("✅ Pembayaran berhasil! Cek halaman riwayat untuk melihat akun game kamu.");
              router.push("/history");
            }
          },
          onPending: function () {
            alert("Pembayaran sedang diproses. Cek halaman riwayat secara berkala ya!");
            setCheckoutLoading(false);
            router.push("/history");
          },
          onError: function () {
            alert("Pembayaran gagal. Silakan coba lagi.");
            setCheckoutLoading(false);
          },
          onClose: function () {
            alert("Kamu menutup halaman pembayaran. Order tersimpan sebagai pending di riwayat.");
            setCheckoutLoading(false);
          },
        });
      } else {
        alert("Sistem pembayaran belum termuat. Coba refresh halaman (F5) lalu bayar lagi.");
        setCheckoutLoading(false);
      }

    } catch (error: any) {
      console.error(error);
      alert(`Terjadi kesalahan: ${error.message}`);
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs gap-2">
        <Loader2 className="animate-spin text-[#D4AF37]" size={16} />
        Memuat Keranjang Belanja...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-400 flex flex-col items-center justify-center gap-4 p-6">
        <ShoppingBag size={48} className="text-zinc-700" />
        <p className="text-xs font-mono">Silakan login terlebih dahulu untuk melihat keranjang.</p>
        <Link href="/" className="bg-zinc-100 text-zinc-950 text-xs px-4 py-2 rounded-xl font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-all">
          Kembali Ke Toko
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">

        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#D4AF37] transition-colors text-xs font-bold uppercase tracking-wider">
          <ArrowLeft size={16} /> Kembali Belanja
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Keranjang Belanja</h1>
            <p className="text-xs text-zinc-500">Kelola item produk digital incaranmu sebelum checkout.</p>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-[#D4AF37] hover:underline bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800"
            >
              {checkedIds.length === cartItems.length ? "Hilangkan Semua Ceklis" : "Ceklis Semua Produk"}
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-900 rounded-3xl space-y-3">
            <ShoppingBag className="mx-auto text-zinc-800" size={40} />
            <p className="text-xs text-zinc-500 font-mono">Keranjang belanjamu masih kosong.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* DAFTAR ITEM */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const isChecked = checkedIds.includes(item.id);
                const stok = stockMap[item.product_id] ?? 0;
                const qty = item.quantity ?? 1;
                const stokKurang = qty > stok;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 bg-zinc-900 p-4 rounded-2xl border transition-all ${
                      isChecked ? "border-amber-500/30" : "border-zinc-800 opacity-60"
                    }`}
                  >
                    {/* CHECKBOX */}
                    <button
                      onClick={() => toggleCheck(item.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        isChecked ? "bg-[#D4AF37] border-[#D4AF37] text-zinc-950" : "border-zinc-700 hover:border-zinc-500"
                      }`}
                    >
                      {isChecked && <CheckCircle2 size={14} strokeWidth={3} />}
                    </button>

                    {/* INFO PRODUK */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] bg-zinc-950 text-zinc-400 font-bold px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-widest">
                        {item.product?.category}
                      </span>
                      <h3 className="font-bold text-sm text-white truncate pt-1">{item.product?.title}</h3>
                      <p className="font-mono text-xs text-[#D4AF37] font-semibold">
                        Rp {((item.product?.price ?? 0) * qty).toLocaleString("id-ID")}
                      </p>

                      {/* INFO STOK */}
                      {stokKurang ? (
                        <p className="text-[10px] text-red-400 font-semibold mt-0.5">
                          ⚠️ Stok tersisa {stok}, quantity dikurangi otomatis
                        </p>
                      ) : stok <= 3 && stok > 0 ? (
                        <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                          Tersisa {stok} stok
                        </p>
                      ) : stok === 0 ? (
                        <p className="text-[10px] text-red-400 font-semibold mt-0.5">
                          Stok habis
                        </p>
                      ) : null}
                    </div>

                    {/* KONTROL QUANTITY */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => decreaseQty(item)}
                        className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 flex items-center justify-center transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-black text-white w-5 text-center">{qty}</span>
                      <button
                        onClick={() => increaseQty(item)}
                        disabled={qty >= stok}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                          qty >= stok
                            ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                        }`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* TOMBOL HAPUS */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/20 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* RINGKASAN PEMBAYARAN */}
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 h-fit space-y-6 shadow-xl">
              <h2 className="text-xs font-black text-white uppercase tracking-wider border-b border-zinc-800 pb-3">Ringkasan Pilihan</h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Total Produk Terpilih:</span>
                  <span className="font-mono font-bold text-white">{selectedItems.length} Item</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Total Quantity:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedItems.reduce((acc, i) => acc + (i.quantity ?? 1), 0)}x
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800">
                  <span className="text-zinc-400">Total Harga:</span>
                  <span className="text-xl font-black text-[#D4AF37] font-mono">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {selectedItems.length > 1 && (
                <p className="text-[10px] text-zinc-500 leading-relaxed border border-zinc-800 rounded-xl p-3">
                  💡 Pembayaran diproses <span className="text-zinc-300 font-semibold">satu per satu</span> mulai dari item pertama.
                </p>
              )}

              <button
                onClick={handleCheckoutSelected}
                disabled={selectedItems.length === 0 || checkoutLoading}
                className="w-full bg-zinc-100 text-zinc-950 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#D4AF37] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Membuka Kasir...
                  </>
                ) : (
                  `Checkout Terpilih (${selectedItems.length})`
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
