"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Shield, User, Send, MessageCircle } from "lucide-react";
import { auth, rtdb, db } from "@/src/firebase/firebase";
import {
  ref, push, update, onValue, query,
  orderByChild, orderByKey, limitToLast,
  serverTimestamp, get, set,
} from "firebase/database";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/* Splash */
function FullScreenSplash({ label = "Abrindo chat..." }: { label?: string }) {
  return (
    <div className="min-h-screen grid place-items-center bg-[#EAEAEA]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-white border-t-[#AF1B1B] animate-spin" />
        <div className="text-sm text-[#1A1A1A]">{label}</div>
      </div>
    </div>
  );
}

type ChatMsg = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isAdmin?: boolean;
  timestamp?: number;
};

/* Helpers */
async function resolveIsAdmin(uid: string): Promise<boolean> {
  try { const a = await get(ref(rtdb, `admins/${uid}`)); if (a.exists() && a.val() === true) return true; } catch {}
  try {
    const s = await getDoc(doc(db, "users", uid));
    if (s.exists()) {
      const u = s.data() as any;
      if (u?.isAdmin === true) return true;
      if (String(u?.role || "").toLowerCase() === "admin") return true;
    }
  } catch {}
  try { const t = await getIdTokenResult(auth.currentUser!, true); if ((t as any)?.claims?.admin) return true; } catch {}
  return false;
}

async function resolveMyName(uid: string): Promise<string> {
  try {
    const s = await getDoc(doc(db, "users", uid));
    if (s.exists()) {
      const d = s.data() as any;
      const n = (d?.name || d?.displayName || "").toString().trim();
      if (n) return n;
    }
  } catch {}
  const u = auth.currentUser;
  if (u?.displayName?.trim()) return u.displayName.trim();
  if (u?.email) return u.email.split("@")[0];
  return "Usuário";
}

/** vira participante (sem criar o nó do chat) */
async function ensureParticipant(chatId: string, uid: string) {
  await set(ref(rtdb, `chats/${chatId}/participants/${uid}`), true);
}

export default function ChatRoomPage() {
  const router = useRouter();
  const { chatId: raw } = useParams() as { chatId: string };
  const chatId = String(raw);

  const [me, setMe] = useState<{ uid: string; name: string; isAdmin: boolean }>({ uid: "", name: "", isAdmin: false });
  const [loading, setLoading] = useState(true);
  const [bootLoading, setBootLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const endRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  /* Splash */
  useEffect(() => {
    const t = setTimeout(() => setBootLoading(false), 1200);
    return () => clearTimeout(t);
  }, [chatId]);

  /* Auth + papel + nome */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setLoading(false);
        router.replace(`/login?next=/chat/${encodeURIComponent(chatId)}`);
        return;
      }
      const [name, isAdmin] = await Promise.all([resolveMyName(u.uid), resolveIsAdmin(u.uid)]);
      setMe({ uid: u.uid, name, isAdmin });
      setLoading(false);
    });
    return () => unsub();
  }, [chatId, router]);

  /* só vira participante ao abrir */
  useEffect(() => {
    (async () => {
      const u = auth.currentUser;
      if (!chatId || !u) return;
      try {
        await ensureParticipant(chatId, u.uid);
        try { await get(ref(rtdb, `chats/${chatId}/participants/${u.uid}`)); } catch {}
      } catch (e) {
        console.warn("[init] ensureParticipant error:", e);
      }
    })();
  }, [chatId]);

  /* streaming mensagens */
  useEffect(() => {
    let stopped = false;
    let detach: (() => void) | null = null;

    (async () => {
      if (!chatId) return;
      setMessages([]);

      const u = auth.currentUser;
      if (!u) return;

      try {
        await ensureParticipant(chatId, u.uid);
        try { await get(ref(rtdb, `chats/${chatId}/participants/${u.uid}`)); } catch {}
      } catch (e) {
        console.error("[stream] ensureParticipant error:", e);
        return;
      }
      if (stopped) return;

      const basePath = `chats/${chatId}/messages`;

      const buildList = (snap: any): ChatMsg[] => {
        const list: ChatMsg[] = [];
        snap.forEach((child: any) => {
          const v = child.val();
          const ts =
            typeof v?.timestamp === "number" ? v.timestamp :
            typeof v?.createdAt === "number" ? v.createdAt :
            typeof v?.sentAt === "number" ? v.sentAt :
            typeof v?.updatedAt === "number" ? v.updatedAt :
            (v?.timestamp && !Number.isNaN(Number(v.timestamp)) ? Number(v.timestamp) : undefined);
          list.push({
            id: child.key!,
            text: v?.text ?? v?.message ?? v?.content ?? "",
            senderId: v?.senderId ?? v?.uid ?? "",
            senderName: v?.senderName ?? v?.name ?? "Usuário",
            isAdmin: !!(v?.isAdmin || v?.from === "admin"),
            timestamp: ts,
          });
        });
        list.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
        return list;
      };

      const byTsRef = query(ref(rtdb, basePath), orderByChild("timestamp"), limitToLast(200));
      const offMain = onValue(
        byTsRef,
        (snap) => {
          if (snap.exists()) {
            setMessages(buildList(snap));
            setTimeout(scrollToBottom, 80);
          } else {
            const byKeyRef = query(ref(rtdb, basePath), orderByKey(), limitToLast(200));
            const offKey = onValue(byKeyRef, (snap2) => {
              setMessages(buildList(snap2));
              setTimeout(scrollToBottom, 80);
            });
            detach = () => offKey();
          }
        },
        () => {
          const byKeyRef = query(ref(rtdb, basePath), orderByKey(), limitToLast(200));
          const offKey = onValue(byKeyRef, (snap2) => {
            setMessages(buildList(snap2));
            setTimeout(scrollToBottom, 80);
          });
          detach = () => offKey();
        }
      );

      detach = detach ?? (() => offMain());
    })();

    return () => {
      stopped = true;
      try { detach && detach(); } catch {}
      setMessages([]);
    };
  }, [chatId]);

  /* enviar */
  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !me.uid || sending) return;

    setSending(true);
    try {
      await ensureParticipant(chatId, me.uid);

      const msgsRef = ref(rtdb, `chats/${chatId}/messages`);
      await push(msgsRef, {
        text,
        senderId: me.uid,
        senderName: me.name,
        isAdmin: me.isAdmin,
        timestamp: serverTimestamp(),
      });

      const chatRef = ref(rtdb, `chats/${chatId}`);
      const chatSnap = await get(chatRef);

      const updates: any = {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        hasMessages: true,
        lastMessageTimeClient: Date.now(),
      };

      if (!chatSnap.exists()) {
        updates.createdAt = serverTimestamp();
        updates.createdById = me.uid;
        updates.createdByName = me.name;
      }
      if (!me.isAdmin) {
        updates.lastSenderId = me.uid;
        updates.lastSenderName = me.name;
        updates.lastIsAdmin = false;
      }
      await update(chatRef, updates);

      setNewMessage("");
      setTimeout(scrollToBottom, 80);
    } catch (e) {
      console.error("[send] error:", e);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading || bootLoading) return <FullScreenSplash label="Abrindo chat..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAEAEA] to-white">
      {/* Header */}
      <div className="bg-white border-b border-[#EAEAEA]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[#EAEAEA] rounded-full transition"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-[#7A7A7A]" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#AF1B1B]" />
              <h1 className="text-xl font-semibold text-[#1A1A1A]">Suporte Técnico</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-[#EAEAEA] h-[calc(100vh-180px)] flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
            {messages.length === 0 ? (
              <div className="text-center text-[#7A7A7A] py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma mensagem ainda. Comece a conversa!</p>
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === me.uid;
                const time =
                  typeof m.timestamp === "number"
                    ? new Date(m.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                    : "";
                const isAdmin = !!m.isAdmin;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={[
                        "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm",
                        isAdmin
                          ? "bg-[#AF1B1B] text-white rounded-br-sm"
                          : mine
                          ? "bg-[#1F4E5F] text-white rounded-br-sm"
                          : "bg-white text-[#1A1A1A] rounded-bl-sm border border-[#EAEAEA]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isAdmin ? (
                          <Shield className="w-3 h-3 text-white/80" />
                        ) : (
                          <User className={`w-3 h-3 ${mine ? "text-white/80" : "text-[#7A7A7A]"}`} />
                        )}
                        <span className={`text-xs font-medium ${mine || isAdmin ? "text-white/90" : "text-[#7A7A7A]"}`}>
                          {m.senderName}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <div className={`mt-2 text-xs ${mine || isAdmin ? "text-white/80" : "text-[#7A7A7A]"}`}>{time}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#EAEAEA] bg-[#F8F8F8] p-4 rounded-b-2xl">
            <div className="flex gap-3 items-end">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 border border-[#EAEAEA] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1F4E5F] focus:border-transparent text-[#1A1A1A] placeholder-[#7A7A7A] bg-white"
                rows={1}
                style={{ maxHeight: 120 }}
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-[#1F4E5F] text-white rounded-xl hover:opacity-90 disabled:bg-[#7A7A7A] disabled:cursor-not-allowed transition inline-flex items-center justify-center"
                aria-label="Enviar"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
