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
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-orange-500">
            Tixa Store
          </h1>

          <div className="flex items-center gap-4">
            <button className="rounded-lg bg-zinc-800 p-2 hover:bg-zinc-700">
              <Search size={20} />
            </button>

            <button className="rounded-lg bg-orange-500 p-2 hover:bg-orange-600">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-10">
          <h2 className="text-5xl font-bold leading-tight">
            Marketplace Akun
            <br />
            Volleyball Legends
          </h2>

          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Jual beli akun Volleyball Legends aman, cepat, dan otomatis.
          </p>

          <button className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200">
            Belanja Sekarang
          </button>
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-3xl font-bold">Produk Terbaru</h3>

          <button className="rounded-xl bg-zinc-800 px-4 py-2 hover:bg-zinc-700">
            Lihat Semua
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
            >
              <img
                src={product.image}
                alt={product.title}
                className="h-56 w-full object-cover"
              />

              <div className="p-5">
                <h4 className="text-xl font-semibold">
                  {product.title}
                </h4>

                <p className="mt-2 text-orange-400">
                  {product.price}
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  Stock: {product.stock}
                </p>

                <button className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-semibold hover:bg-orange-600">
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