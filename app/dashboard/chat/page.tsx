"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Loader2,
  LogIn,
  ShieldAlert,
} from "lucide-react";

export default function ChatPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Strict Mode fix: cegah inisialisasi duplikat
    if (initializedRef.current) return;
    initializedRef.current = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const rid = await initChat(session.user);
        if (rid) {
          setupRealtime(rid);
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  function setupRealtime(rid: string) {
    // Kalau sudah ada channel, hapus dulu
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`room-${rid}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${rid}`,
        },
        (payload: any) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
  }

  // Prefill dari halaman riwayat (tombol Laporkan Kendala)
  useEffect(() => {
    if (roomId) {
      const prefill = localStorage.getItem("chat_prefill");
      if (prefill) {
        setInputMessage(prefill);
        localStorage.removeItem("chat_prefill");
      }
    }
  }, [roomId]);

  // Scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function initChat(user: any): Promise<string | null> {
    setLoading(true);

    const { data: existingRoom } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("buyer_id", user.id)
      .maybeSingle();

    let currentRoomId = existingRoom?.id;

    if (!currentRoomId) {
      const { data: newRoom, error } = await supabase
        .from("chat_rooms")
        .insert({ buyer_id: user.id })
        .select("id")
        .single();

      if (error || !newRoom) {
        console.error("Gagal membuat chat room:", error?.message);
        setLoading(false);
        return null;
      }
      currentRoomId = newRoom.id;
    }

    setRoomId(currentRoomId);
    await fetchMessages(currentRoomId);
    setLoading(false);

    return currentRoomId;
  }

  async function fetchMessages(rid: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", rid)
      .order("created_at", { ascending: true });

    if (!error && data) setMessages(data);
  }

  async function handleSend() {
    if (!inputMessage.trim() || !session || !roomId) return;

    setSending(true);
    const msgText = inputMessage.trim();
    setInputMessage("");

    const { error } = await supabase.from("messages").insert({
      room_id: roomId,
      sender_id: session.user.id,
      message: msgText,
      product_id: null,
    });

    if (error) {
      console.error("Gagal kirim pesan:", error.message);
      setInputMessage(msgText);
    }

    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function groupMessagesByDate(msgs: any[]) {
    const groups: { date: string; messages: any[] }[] = [];
    msgs.forEach((msg) => {
      const date = formatDate(msg.created_at);
      const last = groups[groups.length - 1];
      if (last && last.date === date) {
        last.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard/chat" },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs gap-2">
        <Loader2 className="animate-spin text-[#D4AF37]" size={16} />
        Menghubungkan ke ruang chat...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
          <LogIn className="text-[#D4AF37]" size={22} />
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-black text-white uppercase tracking-tight">Login Dulu Ya!</h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Kamu harus login dengan Google untuk bisa chat dengan admin Tixa.
          </p>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="bg-zinc-100 text-zinc-950 font-bold text-xs py-3 px-6 rounded-xl hover:bg-[#D4AF37] transition-all uppercase tracking-wider flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Masuk via Google
        </button>
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Kembali ke Toko
        </Link>
      </div>
    );
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-900 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
                <MessageSquare size={14} className="text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs font-black text-white tracking-tight">Admin Tixa</p>
                <p className="text-[10px] text-emerald-400 font-mono">Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <ShieldAlert size={11} className="text-[#D4AF37]" />
            <span className="text-[10px] text-zinc-400 font-mono">Secure Chat</span>
          </div>
        </div>
      </header>

      {/* AREA PESAN */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {messages.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare size={20} className="text-[#D4AF37]" />
              </div>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Halo! Silakan kirim pesanmu. Admin Tixa akan segera membalas.
                Gunakan tombol <span className="text-zinc-300 font-semibold">"Laporkan Kendala"</span> di halaman riwayat untuk langsung kirim detail pesanan bermasalah.
              </p>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-900" />
                <span className="text-[10px] text-zinc-600 font-mono px-2">{group.date}</span>
                <div className="flex-1 h-px bg-zinc-900" />
              </div>

              {group.messages.map((msg) => {
                const isMe = msg.sender_id === session.user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 space-y-1 ${
                        isMe
                          ? "bg-[#D4AF37] text-zinc-950 rounded-br-sm"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-sm"
                      }`}
                    >
                      {!isMe && (
                        <p className="text-[9px] font-black uppercase tracking-wider text-[#D4AF37]">
                          Admin Tixa
                        </p>
                      )}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      <p className={`text-[9px] font-mono ${isMe ? "text-zinc-700 text-right" : "text-zinc-500"}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* INPUT PESAN */}
      <div className="sticky bottom-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan... (Enter untuk kirim, Shift+Enter baris baru)"
            rows={1}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-all resize-none leading-relaxed"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || sending}
            className="w-11 h-11 bg-[#D4AF37] hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-md active:scale-95"
          >
            {sending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
        <p className="text-center text-[9px] text-zinc-700 font-mono mt-2">
          Pesan terenkripsi & hanya terlihat oleh kamu dan admin Tixa
        </p>
      </div>

    </div>
  );
}
