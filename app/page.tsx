import { Search, ShoppingCart } from "lucide-react";

const products = [
  {
    id: 1,
    title: "Volleyball Legends Account #1",
    price: "Rp 150.000",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop",
    stock: 5,
  },
  {
    id: 2,
    title: "Volleyball Legends Pro Account",
    price: "Rp 300.000",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop",
    stock: 2,
  },
  {
    id: 3,
    title: "Starter Account Volleyball Legends",
    price: "Rp 80.000",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    stock: 10,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-[#D4AF37]/20 selection:text-[#D4AF37]">
      {/* Navbar */}
      <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo Pink Menyala Estetis */}
          <h1 className="text-2xl font-extrabold tracking-tight text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">
            Tixa Store
          </h1>
          <div className="flex items-center gap-4">
            <button className="rounded-xl bg-zinc-900 p-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-[#D4AF37] transition-colors border border-zinc-800">
              <Search size={20} />
            </button>
            <button className="rounded-xl bg-[#D4AF37] p-2.5 text-zinc-950 hover:bg-[#F3E5AB] shadow-lg shadow-[#D4AF37]/10 hover:shadow-[#D4AF37]/20 transition-all font-bold">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero (Hitam & Pure Gold Premium) */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl bg-zinc-900 p-10 md:p-14 relative overflow-hidden border border-zinc-800 shadow-2xl">
          {/* Kilau Cahaya Gold di Background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tight">
              Marketplace Akun
              <br />
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] bg-clip-text text-transparent">
                Volleyball Legends
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-zinc-400 font-medium">
              Jual beli akun Volleyball Legends aman, cepat, dan otomatis.
            </p>
            <button className="mt-8 rounded-xl bg-[#D4AF37] px-6 py-3.5 font-bold text-zinc-950 hover:bg-[#F3E5AB] shadow-lg shadow-[#D4AF37]/20 transition-all transform hover:-translate-y-0.5">
              Belanja Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">Produk Terbaru</h3>
          <button className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-semibold text-[#D4AF37] hover:bg-zinc-800 transition-colors">
            Lihat Semua
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900 shadow-xl hover:border-[#D4AF37]/40 transition-all duration-300"
            >
              <div className="overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-100"
                />
              </div>
              <div className="p-6">
                <h4 className="text-lg font-bold text-white line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                  {product.title}
                </h4>
                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-xl font-black text-[#D4AF37]">
                    {product.price}
                  </p>
                  <p className="text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#D4AF37]/20">
                    Stok: {product.stock}
                  </p>
                </div>
                {/* Tombol Beli Emas Terbuka, berubah jadi Full Gold saat di-hover */}
                <button className="mt-6 w-full rounded-xl bg-zinc-950 border border-[#D4AF37]/30 py-3.5 font-bold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-zinc-950 hover:border-[#D4AF37] transition-all shadow-sm">
                  Beli Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}