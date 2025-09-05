"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Shield, User, Send, MessageCircle } from "lucide-react";
import { auth, rtdb, db } from "@/src/firebase/firebase";
import {
  ref,
  push,
  update,
  onValue,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  serverTimestamp,
  get,
  set, // 👈 necessário para ensureParticipant
} from "firebase/database";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/** Splash/Loader full-screen */
function FullScreenSplash({ label = "Abrindo chat..." }: { label?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin" />
        <div className="text-sm text-gray-600">{label}</div>
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
  timestamp?: number; // RTDB devolve epoch (ms) após resolver o serverTimestamp
};

/** ——— helpers ——— */
async function resolveIsAdmin(uid: string): Promise<boolean> {
  try {
    const a = await get(ref(rtdb, `admins/${uid}`));
    if (a.exists() && a.val() === true) return true;
  } catch {}
  try {
    const s = await getDoc(doc(db, "users", uid));
    if (s.exists()) {
      const u = s.data() as any;
      if (u?.isAdmin === true) return true;
      if (String(u?.role || "").toLowerCase() === "admin") return true;
    }
  } catch {}
  try {
    const token = await getIdTokenResult(auth.currentUser!);
    if (token.claims?.admin === true) return true;
  } catch {}
  return false;
}

async function resolveMyName(uid: string): Promise<string> {
  // tenta users/{uid}.name → displayName; cai para auth.displayName → parte do e-mail → "Usuário"
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

/** Garante que o usuário é participante antes de qualquer update/push */
async function ensureParticipant(chatId: string, uid: string) {
  try {
    await set(ref(rtdb, `chats/${chatId}/participants/${uid}`), true);
  } catch (e) {
    console.warn("ensureParticipant error:", e);
    throw e;
  }
}

export default function ChatRoomPage() {
  const router = useRouter();
  const { chatId: raw } = useParams() as { chatId: string };
  const chatId = String(raw);

  const [me, setMe] = useState<{ uid: string; name: string; isAdmin: boolean }>({
    uid: "",
    name: "",
    isAdmin: false,
  });

  const [loading, setLoading] = useState(true);         // auth/dados
  const [bootLoading, setBootLoading] = useState(true); // "charme" na abertura
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const endRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  /** Splash inicial (ajuste a duração se quiser) */
  useEffect(() => {
    const BOOT_MS = 1200;
    setBootLoading(true);
    const t = setTimeout(() => setBootLoading(false), BOOT_MS);
    return () => clearTimeout(t);
  }, [chatId]);

  /** Auth + papel + nome */
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

  /** Garante participantes + metadados do chat ao abrir (duas etapas) */
  useEffect(() => {
    const u = auth.currentUser;
    if (!chatId || !u) return;

    (async () => {
      try {
        // 1) vira participante (regra permite o próprio uid escrever em participants)
        await ensureParticipant(chatId, u.uid);

        // 2) agora atualiza/cria metadados com permissão garantida
        const chatRef = ref(rtdb, `chats/${chatId}`);
        const s = await get(chatRef);

        if (!s.exists()) {
          await update(chatRef, {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isAdminChat: true, // opcional
          });
        } else {
          const v = s.val() || {};
          const updates: any = { updatedAt: serverTimestamp() };
          if (typeof v.createdAt !== "number") {
            updates.createdAt = serverTimestamp();
          }
          await update(chatRef, updates);
        }
      } catch (e) {
        console.warn("init chat meta error:", e);
      }
    })();
  }, [chatId]);

  /** Streaming de mensagens (robusto com fallback e normalização) */
  useEffect(() => {
    if (!chatId) return;

    setMessages([]);

    const basePath = `chats/${chatId}/messages`;

    // Normaliza o snapshot em ChatMsg[]
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

    let stopCurrent: (() => void) | null = null;

    // Fallback: orderByKey() para mensagens antigas sem timestamp
    const attachByKey = () => {
      const byKeyRef = query(ref(rtdb, basePath), orderByKey(), limitToLast(200));
      const off = onValue(
        byKeyRef,
        (snap2) => {
          const list = buildList(snap2);
          setMessages(list);
          setTimeout(scrollToBottom, 100);
        },
        (err) => console.error("fallback orderByKey error:", err)
      );
      stopCurrent = () => off();
    };

    // Principal: orderByChild('timestamp')
    const byTsRef = query(ref(rtdb, basePath), orderByChild("timestamp"), limitToLast(200));
    const offMain = onValue(
      byTsRef,
      (snap) => {
        if (snap.exists()) {
          const list = buildList(snap);
          setMessages(list);
          setTimeout(scrollToBottom, 100);
        } else {
          console.warn("Sem mensagens com timestamp; usando fallback por key…");
          offMain();        // desliga o listener principal
          attachByKey();    // ativa fallback
        }
      },
      (err) => {
        console.error("messages by timestamp error:", err);
        offMain();          // desliga o listener principal em caso de erro (ex.: permission_denied)
        attachByKey();      // tenta por key mesmo assim
      }
    );

    // por padrão, o listener ativo é o principal
    stopCurrent = () => offMain();

    return () => {
      try { stopCurrent && stopCurrent(); } catch {}
      setMessages([]);
    };
  }, [chatId, rtdb]);  // <- inclua rtdb aqui se não estava

  /** Enviar mensagem */
  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !me.uid || sending) return;

    setSending(true);
    try {
      // 1) garante participação antes de escrever em messages/metadados
      await ensureParticipant(chatId, me.uid);

      // 2) envia a mensagem
      const msgsRef = ref(rtdb, `chats/${chatId}/messages`);
      await push(msgsRef, {
        text,
        senderId: me.uid,
        senderName: me.name,
        isAdmin: me.isAdmin,
        timestamp: serverTimestamp(),
      });

      // 3) atualiza metadados do chat
      const chatRef = ref(rtdb, `chats/${chatId}`);
      await update(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // FALLBACK local enquanto o serverTimestamp não resolve
        lastMessageTimeClient: Date.now(),
      });

      setNewMessage("");
      setTimeout(scrollToBottom, 100);
    } catch (e: any) {
      console.error("Erro ao enviar (RTDB):", e?.code, e?.message || e);
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

  const goBack = () => router.back();

  if (loading || bootLoading) {
    return <FullScreenSplash label="Abrindo chat..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-800">Suporte Técnico</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Container do chat */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-180px)] flex flex-col">
          {/* Mensagens */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma mensagem ainda. Comece a conversa!</p>
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === me.uid;
                const time =
                  typeof m.timestamp === "number"
                    ? new Date(m.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        mine
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {m.isAdmin ? (
                          <Shield className={`w-3 h-3 ${mine ? "text-blue-200" : "text-blue-500"}`} />
                        ) : (
                          <User className={`w-3 h-3 ${mine ? "opacity-80" : "text-gray-500"}`} />
                        )}
                        <span className={`text-xs font-medium ${mine ? "text-blue-100" : "text-gray-600"}`}>
                          {m.senderName}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <div className="mt-2 text-xs opacity-70">{time}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-gray-50 p-4 rounded-b-lg">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Digite sua mensagem... (Shift + Enter = quebra de linha)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  style={{ maxHeight: "120px" }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center"
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
