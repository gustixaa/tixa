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
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-rose-500/30 selection:text-rose-600">
      {/* Navbar */}
      <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
            Tixa<span className="text-rose-500">Store</span>
          </h1>
          <div className="flex items-center gap-4">
            <button className="rounded-xl bg-zinc-50 p-2.5 text-zinc-600 hover:bg-zinc-100 transition-colors">
              <Search size={20} />
            </button>
            <button className="rounded-xl bg-rose-500 p-2.5 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl bg-zinc-900 p-10 md:p-14 relative overflow-hidden shadow-xl shadow-zinc-900/10">
          {/* Efek gradasi spidol estetis di background hero */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-600/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tight">
              Marketplace Akun
              <br />
              <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
                Volleyball Legends
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-zinc-400">
              Jual beli akun Volleyball Legends aman, cepat, dan otomatis.
            </p>
            <button className="mt-8 rounded-xl bg-rose-500 px-6 py-3.5 font-bold text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all transform hover:-translate-y-0.5">
              Belanja Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">Produk Terbaru</h3>
          <button className="rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">
            Lihat Semua
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h4 className="text-lg font-bold text-zinc-900 line-clamp-1 group-hover:text-rose-500 transition-colors">
                  {product.title}
                </h4>
                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-xl font-black text-rose-500">
                    {product.price}
                  </p>
                  <p className="text-xs font-medium text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-100">
                    Stok: {product.stock}
                  </p>
                </div>
                <button className="mt-6 w-full rounded-xl bg-zinc-900 py-3.5 font-bold text-white hover:bg-rose-500 transition-all shadow-md shadow-zinc-900/5 hover:shadow-rose-500/20">
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