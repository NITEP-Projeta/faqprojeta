"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth, rtdb, db } from "@/src/firebase/firebase";
import {
  ref,
  onValue,
  query,
  limitToLast,
  orderByKey,
  get,
  orderByChild,
  set,
} from "firebase/database";
import {
  Shield,
  MessageSquare,
  Clock,
  ArrowLeft,
  User,
  ExternalLink,
  Bug,
  RefreshCw,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

type ChatRow = {
  id: string;
  lastMessage?: string;
  lastMessageTime?: number;
  messageCount?: number;
};

type ChatMsg = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isAdmin?: boolean;
  timestamp?: number;
};

async function resolveIsAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await get(ref(rtdb, `admins/${uid}`));
    if (snap.exists() && snap.val() === true) return true;
  } catch {}
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data() as any;
      if (data?.isAdmin === true) return true;
      if (String(data?.role || "").toLowerCase() === "admin") return true;
    }
  } catch {}
  try {
    const token = await getIdTokenResult(auth.currentUser!);
    if (token.claims?.admin === true) return true;
  } catch {}
  return false;
}

async function ensureParticipantAdmin(chatId: string, uid: string) {
  await set(ref(rtdb, `chats/${chatId}/participants/${uid}`), true);
}

export default function AdminChatInboxPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [chatNotFound, setChatNotFound] = useState(false);

  // Auth + checagem de admin
  useEffect(() => {
    let mounted = true;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!mounted) return;

      if (!u) {
        setLoading(false);
        router.replace("/login?next=/admin/chat");
        return;
      }

      try {
        const ok = await resolveIsAdmin(u.uid);
        console.log("🔐 Admin check result:", ok, "for user:", u.uid);
        if (!mounted) return;
        setIsAdmin(ok);
        setLoading(false);
        if (!ok) router.replace("/");
      } catch {
        if (!mounted) return;
        setIsAdmin(false);
        setLoading(false);
        router.replace("/");
      }
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, [router]);

  // Lista de chats
  useEffect(() => {
    if (!isAdmin) {
      setRows([]);
      return;
    }

    const qRef = query(ref(rtdb, "chats"), orderByKey(), limitToLast(100));
    const handle = (snap: any) => {
      const list: ChatRow[] = [];
      const debug: any = {};

      snap.forEach((child: any) => {
        const v = child.val() || {};
        const chatId = child.key as string;

        debug[chatId] = {
          rawData: v,
          hasMessages: !!v.messages,
          messageCount: v.messages ? Object.keys(v.messages).length : 0,
          lastMessage: v.lastMessage,
          lastMessageTime: v.lastMessageTime,
        };

        const ts =
          typeof v.lastMessageTime === "number"
            ? v.lastMessageTime
            : typeof v.updatedAt === "number"
            ? v.updatedAt
            : typeof v.createdAt === "number"
            ? v.createdAt
            : typeof v.lastMessageTimeClient === "number"
            ? v.lastMessageTimeClient
            : Date.now();

        list.push({
          id: chatId,
          lastMessage: v.lastMessage || "Sem mensagens",
          lastMessageTime: ts,
          messageCount: v.messages ? Object.keys(v.messages).length : 0,
        });
      });

      list.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
      setDebugInfo(debug);
      setRows(list);
    };

    const unsubscribe = onValue(qRef, handle);
    return () => {
      unsubscribe();
      setRows([]);
    };
  }, [isAdmin]);

  // Mensagens do chat selecionado (participants + sanity + byKey→byTimestamp)
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      setPermError(null);
      setChatNotFound(false);
      return;
    }

    setMessagesLoading(true);
    setMessages([]);
    setPermError(null);
    setChatNotFound(false);

    let stopCurrent: (() => void) | null = null;

    const buildListFromSnap = (snap: any): ChatMsg[] => {
      const list: ChatMsg[] = [];
      snap.forEach((child: any) => {
        const v = child.val() || {};
        const ts =
          typeof v?.timestamp === "number"
            ? v.timestamp
            : typeof v?.createdAt === "number"
            ? v.createdAt
            : typeof v?.sentAt === "number"
            ? v.sentAt
            : typeof v?.updatedAt === "number"
            ? v.updatedAt
            : v?.timestamp && !Number.isNaN(Number(v.timestamp))
            ? Number(v.timestamp)
            : undefined;

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

    const attachByTimestamp = () => {
      const tsRef = query(
        ref(rtdb, `chats/${selectedChat}/messages`),
        orderByChild("timestamp"),
        limitToLast(100)
      );
      const off = onValue(
        tsRef,
        (snap: any) => {
          if (!snap.exists() || snap.numChildren() === 0) {
            setMessages([]);
            setMessagesLoading(false);
            return;
          }
          setMessages(buildListFromSnap(snap));
          setMessagesLoading(false);
        },
        (error: any) => {
          console.error("❌ [ADMIN] byTimestamp error:", error?.code, error?.message || error);
          setPermError(`${error?.code || "error"}: ${error?.message || ""}`);
          setMessagesLoading(false);
        }
      );
      stopCurrent = () => off();
    };

    const attachByKey = () => {
      const keyRef = query(ref(rtdb, `chats/${selectedChat}/messages`), orderByKey(), limitToLast(100));
      const off = onValue(
        keyRef,
        (snap: any) => {
          if (!snap.exists() || snap.numChildren() === 0) {
            // sem msgs por key → tenta timestamp
            off();
            attachByTimestamp();
            return;
          }
          setMessages(buildListFromSnap(snap));
          setMessagesLoading(false);
        },
        (err: any) => {
          console.error("❌ [ADMIN] byKey error:", err?.code, err?.message || err);
          setPermError(`${err?.code || "error"}: ${err?.message || ""}`);
          setMessagesLoading(false);
        }
      );
      stopCurrent = () => off();
    };

    (async () => {
      try {
        const u = auth.currentUser;
        if (!u) throw new Error("not-authenticated(admin)");

        // vira participant
        await ensureParticipantAdmin(selectedChat, u.uid);

        // sanity: existe o chat?
        const chatSnap = await get(ref(rtdb, `chats/${selectedChat}`));
        if (!chatSnap.exists()) {
          setChatNotFound(true);
          setMessages([]);
          setMessagesLoading(false);
          return;
        }

        // listener principal por key
        attachByKey();
      } catch (e: any) {
        console.error("❌ [ADMIN] boot/ensureParticipant error:", e?.code, e?.message || e);
        setPermError(`${e?.code || "error"}: ${e?.message || ""}`);
        setMessagesLoading(false);
      }
    })();

    return () => {
      try {
        stopCurrent && stopCurrent();
      } catch {}
      setMessages([]);
      setMessagesLoading(false);
    };
  }, [selectedChat, rtdb]);

  const openChatInNewTab = (chatId: string) => {
    window.open(`/chat/${encodeURIComponent(chatId)}`, "_blank");
  };

  const selectChat = async (chatId: string) => {
    try {
      const u = auth.currentUser;
      if (u) await ensureParticipantAdmin(chatId, u.uid);
    } catch (e) {
      console.warn("ensureParticipant on selectChat:", e);
    } finally {
      setSelectedChat(chatId);
    }
  };

  const refreshChats = () => window.location.reload();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin" />
          <div className="text-sm text-gray-600">Carregando conversas…</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-800">
              {selectedChat ? `Chat: ${selectedChat}` : "Inbox do Suporte"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Toggle Debug"
            >
              <Bug className="w-4 h-4" />
            </button>
            <button
              onClick={refreshChats}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {selectedChat && (
              <button
                onClick={() => setSelectedChat(null)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Inbox
              </button>
            )}
          </div>
        </div>
      </header>

      {permError && (
        <div className="max-w-7xl mx-auto mt-3">
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            Permissão negada ao ler mensagens deste chat ({permError}). Verifique as regras do RTDB e se seu UID está em{" "}
            <code>/admins</code> ou em <code>participants</code>.
          </div>
        </div>
      )}

      {chatNotFound && (
        <div className="max-w-7xl mx-auto mt-3">
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            Este chat (<code>{selectedChat}</code>) não foi encontrado em <code>chats/{'{'}selectedChat{'}'}</code>. Verifique
            o <strong>ID</strong> e o ambiente do Realtime Database.
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info</h3>
            <div className="text-xs text-yellow-700 font-mono bg-white p-3 rounded overflow-x-auto">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        {!selectedChat ? (
          rows.length === 0 ? (
            <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
              <MessageSquare className="w-10 h-10 opacity-60 mx-auto mb-3" />
              <p>Nenhuma conversa ainda.</p>
              <p className="text-xs mt-2">Certifique-se de que existem chats no Realtime Database</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {rows.map((c) => {
                const when = c.lastMessageTime
                  ? new Date(c.lastMessageTime).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <div key={c.id} className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{when}</span>
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {c.messageCount || 0} msgs
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 break-words text-sm">{c.id}</h3>
                        <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                          {c.lastMessage || "Sem mensagens"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => selectChat(c.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Ver mensagens
                      </button>
                      <button
                        onClick={() => openChatInNewTab(c.id)}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 transition"
                        title="Abrir chat em nova aba"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Mensagens do Chat</h2>
                <span className="text-sm text-gray-500">ID: {selectedChat}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {messages.length} mensagens
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openChatInNewTab(selectedChat)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Responder
                </button>
              </div>
            </div>

            <div className="h-96 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma mensagem neste chat ainda.</p>
                  <p className="text-xs mt-2">Caminho: chats/{selectedChat}/messages</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => {
                    const time =
                      typeof m.timestamp === "number"
                        ? new Date(m.timestamp).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";
                    return (
                      <div key={m.id} className={`flex ${m.isAdmin ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            m.isAdmin ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {m.isAdmin ? (
                              <Shield className={`w-3 h-3 ${m.isAdmin ? "text-blue-200" : "text-blue-500"}`} />
                            ) : (
                              <User className={`w-3 h-3 ${m.isAdmin ? "opacity-80" : "text-gray-500"}`} />
                            )}
                            <span className={`text-xs font-medium ${m.isAdmin ? "text-blue-100" : "text-gray-600"}`}>
                              {m.senderName}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                          <div className="mt-2 text-xs opacity-70">{time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
