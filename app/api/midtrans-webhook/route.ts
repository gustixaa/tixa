import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // STEP 1: Verifikasi tanda tangan Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error("❌ Signature tidak valid!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    console.log(`✅ Webhook masuk: order=${order_id}, status=${transaction_status}`);

    const isSuccess =
      (transaction_status === "settlement" || transaction_status === "capture") &&
      fraud_status !== "deny";
    const isFailed = ["cancel", "deny", "expire"].includes(transaction_status);

    // STEP 2: Cari order di database
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, product_id, customer_email, status")
      .eq("order_id", order_id)
      .single();

    if (orderError || !order) {
      console.warn("⚠️ Order tidak ditemukan:", order_id);
      return NextResponse.json({ message: "Order not found, skipped" }, { status: 200 });
    }

    // Jika sudah pernah diproses, skip
    if (order.status === "settlement") {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // STEP 3: Proses sesuai status
    if (isSuccess) {
      // Ambil stok yang belum terjual
      const { data: stockItem, error: stockError } = await supabaseAdmin
        .from("account_stocks")
        .select("id, game_email, game_password")
        .eq("product_id", order.product_id)
        .eq("is_sold", false)
        .limit(1)
        .single();

      // Stok habis
      if (stockError || !stockItem) {
        console.warn(`⚠️ STOK HABIS untuk product_id: ${order.product_id}`);

        await supabaseAdmin
          .from("orders")
          .update({
            status: "settlement",
            account_data: "STOK_HABIS - Hubungi admin via chat untuk mendapatkan akun kamu.",
            delivered_email: null,
            delivered_password: null,
          })
          .eq("id", order.id);

        await supabaseAdmin.from("admin_notifications").insert({
          type: "out_of_stock",
          message: `Stok habis! Order ${order_id} sudah lunas tapi tidak ada stok untuk product_id: ${order.product_id}. Email pembeli: ${order.customer_email}`,
          is_read: false,
        }).then(({ error }) => {
          if (error) console.warn("ℹ️ Tabel admin_notifications belum ada:", error.message);
        });

        return NextResponse.json({ message: "Webhook processed - out of stock" }, { status: 200 });
      }

      // Stok ada — alokasikan ke pembeli
      const accountData = `Email: ${stockItem.game_email}\nPassword: ${stockItem.game_password}`;

      await supabaseAdmin
        .from("account_stocks")
        .update({ is_sold: true })
        .eq("id", stockItem.id);

      await supabaseAdmin
        .from("orders")
        .update({
          status: "settlement",
          account_data: accountData,
          delivered_email: stockItem.game_email,
          delivered_password: stockItem.game_password,
        })
        .eq("id", order.id);

      console.log(`🎉 Order ${order_id} selesai! Akun dialokasikan.`);

    } else if (isFailed) {
      // Kalau gagal/expired/dibatalkan — HAPUS order dari database
      // Sehingga tidak muncul di riwayat pembeli
      await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", order.id);

      console.log(`🗑️ Order ${order_id} dibatalkan/gagal — dihapus dari database.`);
    }

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });

  } catch (error: any) {
    console.error("💥 Error webhook:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}