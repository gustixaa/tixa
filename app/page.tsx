export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">
      <h1 className="text-5xl font-bold">
        Tixa Store
      </h1>

      <p className="mt-3 text-zinc-400">
        Marketplace Akun Volleyball Legends
      </p>

      <div className="grid grid-cols-3 gap-5 mt-10">

        <div className="bg-zinc-900 p-5 rounded-2xl">
          <img
            src="https://placehold.co/600x400/png"
            className="rounded-xl"
          />

          <h2 className="text-2xl font-bold mt-4">
            Volleyball Legends Account
          </h2>

          <p className="text-zinc-400 mt-2">
            Rare Skin • High Rank • Safe
          </p>

          <p className="text-3xl font-bold mt-5">
            Rp 50.000
          </p>

          <button className="bg-blue-600 hover:bg-blue-700 transition px-5 py-3 rounded-xl mt-5 w-full">
            Buy Now
          </button>
        </div>

      </div>
    </main>
  )
}