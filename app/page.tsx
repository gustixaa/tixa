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
    title: "Starter Volleyball Legends",
    price: "Rp 80.000",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    stock: 10,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffafd] text-gray-900">
      {/* Background Blur */}
      <div className="fixed left-0 top-0 -z-10 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl"></div>
      <div className="fixed bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-rose-100 blur-3xl"></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-pink-100/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-3xl font-black tracking-tight text-pink-500">
            Tixa
          </h1>

          <div className="flex items-center gap-3">
            <button className="rounded-2xl border border-pink-100 bg-white p-3 shadow-sm transition hover:scale-105">
              <Search size={20} />
            </button>

            <button className="rounded-2xl bg-pink-500 p-3 text-white shadow-lg shadow-pink-200 transition hover:scale-105 hover:bg-pink-600">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-[40px] border border-white/40 bg-white/60 p-10 shadow-[0_20px_80px_rgba(255,192,203,0.25)] backdrop-blur-2xl md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl"></div>

          <div className="relative z-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-pink-400">
              Premium Marketplace
            </p>

            <h2 className="text-5xl font-black leading-tight text-gray-900 md:text-7xl">
              Volleyball
              <br />
              Legends Store
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Marketplace akun Volleyball Legends dengan desain premium,
              transaksi aman, dan pengiriman akun otomatis.
            </p>

            <div className="mt-10 flex gap-4">
              <button className="rounded-2xl bg-pink-500 px-8 py-4 font-semibold text-white shadow-xl shadow-pink-200 transition hover:scale-105 hover:bg-pink-600">
                Belanja Sekarang
              </button>

              <button className="rounded-2xl border border-pink-100 bg-white px-8 py-4 font-semibold text-gray-700 transition hover:bg-pink-50">
                Explore
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h3 className="text-4xl font-black text-gray-900">
              Featured Accounts
            </h3>

            <p className="mt-3 text-gray-500">
              Akun pilihan dengan kualitas premium.
            </p>
          </div>

          <button className="rounded-2xl border border-pink-100 bg-white px-5 py-3 font-medium text-pink-500 shadow-sm transition hover:bg-pink-50">
            Lihat Semua
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-[32px] border border-white/50 bg-white/70 shadow-xl shadow-pink-100/40 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-6">
                <h4 className="text-2xl font-bold text-gray-900">
                  {product.title}
                </h4>

                <p className="mt-3 text-3xl font-black text-pink-500">
                  {product.price}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Stock tersedia: {product.stock}
                </p>

                <button className="mt-6 w-full rounded-2xl bg-pink-500 py-4 font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-600">
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