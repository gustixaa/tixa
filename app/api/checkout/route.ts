import { NextResponse } from "next/server";
// @ts-ignore
import midtransClient from "midtrans-client";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request: Request) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "productId wajib diisi" }, { status: 400 });
    }

    // Ambil harga & judul langsung dari database, bukan dari client
    // Ini mencegah user memanipulasi harga dari browser
    const { data: product, error: productError } = await supabaseAdmin
      .from("product")
      .select("id, title, price")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const cleanPrice = Math.round(Number(product.price));
    const orderId = `TIXA-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: cleanPrice,
      },
      item_details: [
        {
          id: product.id,
          price: cleanPrice,
          quantity: 1,
          name: product.title.substring(0, 50),
        },
      ],
      enabled_payments: ["bca_va", "bni_va", "bri_va", "mandiri_bill", "gopay", "qris"],
      callbacks: {
        notification: `${process.env.NEXT_PUBLIC_APP_URL}/api/midtrans-webhook`,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    console.log("✅ Token Midtrans didapat:", transaction.token);

    return NextResponse.json({ token: transaction.token, orderId: orderId });

  } catch (error: any) {
    console.error("❌ Error checkout:", error.message || error);
    return NextResponse.json(
      { error: "Gagal membuat token transaksi", detail: error.message },
      { status: 500 }
    );
  }
}