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
    <main className="min-h-screen bg-[#fff7fb] text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-pink-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-3xl font-bold text-pink-500">
            Tixa
          </h1>

          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-pink-100 bg-white p-3 shadow-sm transition hover:bg-pink-50">
              <Search size={20} />
            </button>

            <button className="rounded-xl bg-pink-500 p-3 text-white shadow-lg transition hover:bg-pink-600">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-pink-400 via-pink-300 to-rose-200 p-10 shadow-2xl">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-white/20 blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-5xl font-extrabold leading-tight text-white md:text-6xl">
              Marketplace
              <br />
              Volleyball Legends
            </h2>

            <p className="mt-6 max-w-2xl text-lg text-white/90">
              Jual beli akun Volleyball Legends dengan tampilan modern,
              transaksi aman, dan pengiriman akun otomatis.
            </p>

            <button className="mt-8 rounded-2xl bg-white px-7 py-4 font-semibold text-pink-500 shadow-lg transition hover:scale-105">
              Belanja Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h3 className="text-4xl font-bold text-gray-900">
              Produk Terbaru
            </h3>

            <p className="mt-2 text-gray-500">
              Pilih akun terbaik untuk pengalaman bermain maksimal.
            </p>
          </div>

          <button className="rounded-2xl border border-pink-200 bg-white px-5 py-3 font-medium text-pink-500 shadow-sm transition hover:bg-pink-50">
            Lihat Semua
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-64 w-full object-cover transition duration-300 group-hover:scale-110"
                />
              </div>

              <div className="p-6">
                <h4 className="text-2xl font-bold text-gray-900">
                  {product.title}
                </h4>

                <p className="mt-3 text-2xl font-semibold text-pink-500">
                  {product.price}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Stock tersedia: {product.stock}
                </p>

                <button className="mt-6 w-full rounded-2xl bg-pink-500 py-4 font-semibold text-white transition hover:bg-pink-600">
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