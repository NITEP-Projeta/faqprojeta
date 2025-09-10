"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth, rtdb, db } from "@/src/firebase/firebase";
import {
  ref,
  onValue,
  query as rtdbQuery,
  limitToLast,
  orderByKey,
  orderByChild,
  get,
  set,
  remove,
  update,
  push,
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
  Search,
  MoreVertical,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

// Firestore (com alias para evitar conflitos com RTDB)
import {
  collection,
  doc,
  getDoc,
  query as fsQuery,
  orderBy as fsOrderBy,
  startAt,
  endAt,
  limit as fsLimit,
  getDoc as fsGetDoc,
} from "firebase/firestore";

import RtdbDebugTools from "@/components/RtdbDebugTools";
import useUnreadBadge from "@/hooks/useUnreadBadge";

/* ============================== Tipos ============================== */
type ChatRow = {
  id: string;
  lastMessage?: string;
  lastMessageTime?: number;
  messageCount?: number;
  lastSenderName?: string;
  createdByName?: string;
  hasMessages?: boolean;
};

type ChatMsg = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isAdmin?: boolean;
  timestamp?: number;
};

/* ============================== Helpers ============================== */
async function resolveIsAdmin(uid: string): Promise<boolean> {
  // 1) RTDB flag
  try {
    const a = await get(ref(rtdb, `admins/${uid}`));
    if (a.exists() && a.val() === true) return true;
  } catch {}

  // 2) Firestore user doc
  try {
    const s = await getDoc(doc(db, "users", uid));
    if (s.exists()) {
      const u = s.data() as any;
      if (u?.isAdmin === true) return true;
      if (String(u?.role || "").toLowerCase() === "admin") return true;
    }
  } catch {}

  // 3) Custom claims
  try {
    const token = await getIdTokenResult(auth.currentUser!, true);
    if ((token as any)?.claims?.admin === true) return true;
  } catch {}

  return false;
}

async function ensureParticipantAdmin(chatId: string, uid: string) {
  await set(ref(rtdb, `chats/${chatId}/participants/${uid}`), true);
}

async function getOrCreateChatWithUser(targetUid: string) {
  const me = auth.currentUser!;
  const chatId = push(ref(rtdb, "chats")).key!;
  const now = Date.now();

  await update(ref(rtdb, `chats/${chatId}`), {
    createdAt: now,
    createdBy: me.uid,
    createdByName: me.displayName || "Admin",
    participants: {
      [me.uid]: true,
      [targetUid]: true,
    },
    hasMessages: false,
  });

  return chatId;
}

async function sendFirstMessage(chatId: string, text: string) {
  const me = auth.currentUser!;
  const now = Date.now();
  const msgRef = push(ref(rtdb, `chats/${chatId}/messages`));

  await set(msgRef, {
    text,
    senderId: me.uid,
    senderName: me.displayName || "Admin",
    isAdmin: true,
    timestamp: now,
  });

  await update(ref(rtdb, `chats/${chatId}`), {
    lastMessage: text,
    lastMessageTime: now,
    lastSenderName: me.displayName || "Admin",
    hasMessages: true,
    updatedAt: now,
  });
}

/* ============================== Componente ============================== */
export default function AdminChatInboxPage() {
  const router = useRouter();

  // Estado principal
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [chatNotFound, setChatNotFound] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // UI
  const [search, setSearch] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; last?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Badge de não lidas + som de notificação
  const unread = useUnreadBadge(isAdmin); // { total, perChat, markRead }
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevUnread = useRef(0);
  const firstRun = useRef(true);

  // Busca de usuários (Firestore)
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);

  /* ------------------------------ Som de notificação ------------------------------ */
  useEffect(() => {
    const a = new Audio("/sounds/notify.mp3");
    a.preload = "auto";
    audioRef.current = a;

    const unlock = () => {
      a.play().then(() => a.pause()).catch(() => {});
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      prevUnread.current = unread.total;
      return;
    }
    if (unread.total > prevUnread.current) {
      audioRef.current?.play().catch(() => {});
    }
    prevUnread.current = unread.total;
  }, [unread.total]);

  /* ------------------------------ Auth/Admin ------------------------------ */
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

  /* ------------------------------ Listagem de chats ------------------------------ */
  useEffect(() => {
    if (!isAdmin) {
      setRows([]);
      return;
    }

    const qRef = rtdbQuery(ref(rtdb, "chats"), orderByKey(), limitToLast(200));
    const unsubscribe = onValue(qRef, (snap) => {
      const list: ChatRow[] = [];

      snap.forEach((child) => {
        const v = child.val() || {};
        const chatId = child.key as string;

        const hasMsgs =
          v.hasMessages === true ||
          (v.messages && typeof v.messages === "object" && Object.keys(v.messages).length > 0);
        if (!hasMsgs) return;

        const ts =
          typeof v.lastMessageTime === "number"
            ? v.lastMessageTime
            : typeof v.updatedAt === "number"
            ? v.updatedAt
            : typeof v.createdAt === "number"
            ? v.createdAt
            : typeof v.lastMessageTimeClient === "number"
            ? v.lastMessageTimeClient
            : 0;

        list.push({
          id: chatId,
          lastMessage: v.lastMessage || "Sem mensagens",
          lastMessageTime: ts,
          messageCount: v.messages ? Object.keys(v.messages).length : v.messageCount || 0,
          lastSenderName: v.lastSenderName ?? v.last_sender_name,
          createdByName: v.createdByName ?? v.created_by_name,
          hasMessages: true,
        });
      });

      list.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
      setRows(list);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  /* ------------------------------ Mensagens do chat selecionado ------------------------------ */
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
      const tsRef = rtdbQuery(
        ref(rtdb, `chats/${selectedChat}/messages`),
        orderByChild("timestamp"),
        limitToLast(200)
      );

      let unsubscribe: (() => void) | null = null;

      const handler = (snap: any) => {
        const count = snap.exists() ? Object.keys(snap.val() || {}).length : 0;
        if (count === 0) {
          setMessages([]);
          setMessagesLoading(false);
          return;
        }
        setMessages(buildListFromSnap(snap));
        setMessagesLoading(false);
      };

      const errHandler = (error: any) => {
        setPermError(`${error?.code || "error"}: ${error?.message || ""}`);
        setMessagesLoading(false);
      };

      unsubscribe = onValue(tsRef, handler, errHandler);
      stopCurrent = () => {
        const u = unsubscribe;
        unsubscribe = null;
        if (u) u();
      };
    };

    const attachByKey = () => {
      const keyRef = rtdbQuery(
        ref(rtdb, `chats/${selectedChat}/messages`),
        orderByKey(),
        limitToLast(200)
      );

      let unsubscribe: (() => void) | null = null;

      const handler = (snap: any) => {
        const count = snap.exists() ? Object.keys(snap.val() || {}).length : 0;
        if (count === 0) {
          const u = unsubscribe;
          unsubscribe = null;
          if (u) setTimeout(() => u(), 0);
          attachByTimestamp();
          return;
        }
        setMessages(buildListFromSnap(snap));
        setMessagesLoading(false);
      };

      const errHandler = (err: any) => {
        setPermError(`${err?.code || "error"}: ${err?.message || ""}`);
        setMessagesLoading(false);
      };

      unsubscribe = onValue(keyRef, handler, errHandler);
      stopCurrent = () => {
        const u = unsubscribe;
        unsubscribe = null;
        if (u) u();
      };
    };

    (async () => {
      try {
        const u = auth.currentUser;
        if (!u) throw new Error("not-authenticated(admin)");

        try {
          await ensureParticipantAdmin(selectedChat, u.uid);
        } catch {}

        const chatSnap = await get(ref(rtdb, `chats/${selectedChat}`));
        if (!chatSnap.exists()) {
          setChatNotFound(true);
          setMessages([]);
          setMessagesLoading(false);
          return;
        }

        attachByKey();
      } catch (e: any) {
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
  }, [selectedChat]);

  /* ------------------------------ Busca e seleção ------------------------------ */
  const filteredRows = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) => {
      const id = r.id.toLowerCase();
      const last = (r.lastMessage || "").toLowerCase();
      const who = (r.lastSenderName || r.createdByName || "").toLowerCase();
      return id.includes(t) || last.includes(t) || who.includes(t);
    });
  }, [rows, search]);

  const selectedChatRow = useMemo(
    () => (selectedChat ? rows.find((r) => r.id === selectedChat) ?? null : null),
    [selectedChat, rows]
  );

  const refreshChats = () => window.location.reload();
  const openChatInNewTab = (chatId: string) => window.open(`/chat/${encodeURIComponent(chatId)}`, "_blank");

  const selectChat = async (chatId: string) => {
    try {
      const u = auth.currentUser;
      if (u) await ensureParticipantAdmin(chatId, u.uid);
    } catch {}
    await unread.markRead(chatId);
    setSelectedChat(chatId);
  };

  const requestDeleteChat = (id: string, last?: string) => {
    setMenuOpenId(null);
    setDeleteTarget({ id, last });
  };

  const confirmDeleteChat = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await update(ref(rtdb, `chats/${deleteTarget.id}`), { deletedAt: Date.now() });
      await remove(ref(rtdb, `chats/${deleteTarget.id}`));
      if (selectedChat === deleteTarget.id) setSelectedChat(null);
      setDeleteTarget(null);
    } catch {
      alert("Não foi possível excluir o chat. Verifique permissões/rede.");
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------------------ Busca de usuários (Firestore) ------------------------------ */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const term = userSearch.trim();
      if (!term) {
        setUserResults([]);
        return;
      }

      const coll = collection(db, "users");

      // Se parece UID, tenta doc direto
      if (/^[A-Za-z0-9_-]{10,}$/.test(term)) {
        try {
          const ds = await fsGetDoc(doc(db, "users", term));
          if (!cancelled && ds.exists()) {
            setUserResults([{ id: ds.id, ...ds.data() }]);
            return;
          }
        } catch {}
      }

      const lc = term.toLowerCase();
      const q = fsQuery(coll, fsOrderBy("nameLower"), startAt(lc), endAt(lc + "\uf8ff"), fsLimit(5));

      const unsub = (await import("firebase/firestore")).onSnapshot(
        q,
        (snap) => {
          if (cancelled) return;
          setUserResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        },
        () => setUserResults([])
      );

      return () => unsub();
    };

    let cleaner: void | (() => void);
    run().then((c) => (cleaner = c));

    return () => {
      cancelled = true;
      if (typeof cleaner === "function") cleaner();
    };
  }, [userSearch]);

  /* ------------------------------ Render ------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#EAEAEA]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#7A7A7A] border-t-[#AF1B1B] animate-spin" />
          <div className="text-sm text-[#1A1A1A]">Carregando conversas…</div>
        </div>
      </div>
    );
  }

  const currentTitle =
    selectedChat && selectedChatRow
      ? `Chat: ${selectedChatRow.lastSenderName || selectedChatRow.createdByName || selectedChat}`
      : "Inbox do Suporte";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EAEAEA] to-white">
      {/* Topbar */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/85 border-b border-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#AF1B1B]" />
            <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-2">{currentTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Busca de usuários */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EAEAEA] bg-white relative z-20">
              <Search className="w-4 h-4 text-[#7A7A7A]" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar usuário por ID ou nome…"
                className="outline-none text-sm bg-transparent w-56 text-[#1A1A1A] placeholder-[#7A7A7A]"
              />
              {userResults.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-[#EAEAEA] rounded-lg shadow-lg">
                  {userResults.map((u) => (
                    <button
                      key={(u as any).id}
                      onClick={async () => {
                        const chatId = await getOrCreateChatWithUser((u as any).id);
                        await sendFirstMessage(chatId, "Olá, posso ajudar?");
                        setSelectedChat(chatId);
                        setUserSearch("");
                        setUserResults([]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#EAEAEA]"
                    >
                      {(u as any).name || (u as any).displayName || (u as any).id}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDebug((v) => !v)}
              className="p-2 text-[#7A7A7A] hover:bg-[#EAEAEA] rounded-lg transition"
              title="Toggle Debug"
            >
              <Bug className="w-4 h-4" />
            </button>
            <button
              onClick={refreshChats}
              className="p-2 text-[#7A7A7A] hover:bg-[#EAEAEA] rounded-lg transition"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {selectedChat && (
              <button
                onClick={() => {
                  window.location.reload();
                  setSelectedChat(null);
                }}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm bg-[#EAEAEA] hover:bg-[#D96C06]/10 text-[#1A1A1A] rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            )}
          </div>
        </div>
        
        {/* Busca mobile (chats) */}
        <div className="sm:hidden border-t border-[#EAEAEA] bg-white">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EAEAEA] bg-white">
              <Search className="w-4 h-4 text-[#7A7A7A]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por ID, nome ou mensagem…"
                className="outline-none text-sm bg-transparent w-full text-[#1A1A1A] placeholder-[#7A7A7A]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Alertas */}
      {permError && (
        <div className="max-w-7xl mx-auto mt-3">
          <div className="rounded-md bg-[#F2C14E]/10 border border-[#F2C14E] p-3 text-sm text-[#1A1A1A]">
            Permissão negada ({permError}). Verifique regras do RTDB e presença em <code>/admins</code> ou <code>participants</code>.
          </div>
        </div>
      )}
      {chatNotFound && (
        <div className="max-w-7xl mx-auto mt-3">
          <div className="rounded-md bg-[#D96C06]/10 border border-[#D96C06] p-3 text-sm text-[#1A1A1A]">
            Este chat (<code>{selectedChat}</code>) não foi encontrado em <code>chats/{selectedChat}</code>
          </div>
        </div>
      )}

      {/* Debug opcional */}
      {showDebug && (
        <div className="bg-[#F2C14E]/10 border-y border-[#F2C14E]/40">
          <div className="max-w-7xl mx-auto p-4">
            <RtdbDebugTools selectedChat={selectedChat} />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        {!selectedChat ? (
          // GRID de conversas
          filteredRows.length === 0 ? (
            <div className="rounded-2xl border border-[#EAEAEA] bg-white p-10 text-center text-[#7A7A7A] shadow-sm">
              <MessageSquare className="w-10 h-10 opacity-60 mx-auto mb-3" />
              <p>Nenhuma conversa encontrada.</p>
              <p className="text-xs mt-2">Tente limpar a busca ou aguarde novas mensagens.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRows.map((c) => {
                const when = c.lastMessageTime
                  ? new Date(c.lastMessageTime).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
                const title = c.lastSenderName || c.createdByName || c.id;
                const unreadCount = unread.perChat[c.id] || 0;

                return (
                  <div
                    key={c.id}
                    className="group rounded-2xl border border-[#EAEAEA] bg-white p-4 shadow-sm hover:shadow-lg hover:border-[#AF1B1B]/40 transition relative"
                  >
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[#EAEAEA]"
                      aria-label="Ações"
                    >
                      <MoreVertical className="w-4 h-4 text-[#7A7A7A]" />
                    </button>

                    {menuOpenId === c.id && (
                      <div className="absolute top-9 right-3 w-44 rounded-xl border border-[#EAEAEA] bg-white shadow-lg z-10">
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            openChatInNewTab(c.id);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#EAEAEA] flex items-center gap-2 text-[#1A1A1A]"
                        >
                          <ExternalLink className="w-4 h-4 text-[#1F4E5F]" />
                          Abrir em nova aba
                        </button>
                        <button
                          onClick={() => requestDeleteChat(c.id, c.lastMessage)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#D96C06]/10 text-[#AF1B1B] flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir chat
                        </button>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#7A7A7A] flex items-center gap-1 mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{when}</span>
                          {unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center min-w-[16px] h-[16px] text-[10px] rounded-full bg-[#AF1B1B] text-white">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-[#1A1A1A] break-words text-sm">{title}</h3>
                        <p className="mt-2 text-sm text-[#7A7A7A] line-clamp-2">{c.lastMessage || "Sem mensagens"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => selectChat(c.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-[#EAEAEA] px-3 py-2 text-sm hover:bg-[#EAEAEA] transition text-[#1A1A1A]"
                      >
                        <MessageSquare className="w-4 h-4 text-[#1F4E5F]" />
                        Ver mensagens
                      </button>
                      <button
                        onClick={() => openChatInNewTab(c.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#EAEAEA] px-3 py-2 text-sm hover:bg-[#EAEAEA] transition text-[#1A1A1A]"
                        title="Abrir chat em nova aba"
                      >
                        <ExternalLink className="w-4 h-4 text-[#1F4E5F]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // MENSAGENS
          <div className="bg-white rounded-2xl shadow-lg border border-[#EAEAEA] overflow-hidden">
            <div className="border-b border-[#EAEAEA] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Mensagens — {selectedChatRow?.lastSenderName || selectedChatRow?.createdByName || selectedChat}
                </h2>
                <span className="text-xs bg-[#F2C14E]/20 text-[#1A1A1A] px-2 py-1 rounded-full border border-[#F2C14E]/60">
                  {messages.length} mensagens
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openChatInNewTab(selectedChat)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[#1F4E5F] text-white rounded-xl hover:opacity-90 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Responder
                </button>
                <button
                  onClick={() => requestDeleteChat(selectedChat)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[#AF1B1B]/10 text-[#AF1B1B] rounded-xl hover:bg-[#AF1B1B]/20 border border-[#AF1B1B]/30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>

            <div className="h-[70vh] overflow-y-auto p-4 bg-[#EAEAEA]">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="h-8 w-8 rounded-full border-4 border-white border-t-[#AF1B1B] animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-[#7A7A7A] py-8">
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
                            m.isAdmin
                              ? "bg-[#AF1B1B] text-white rounded-br-sm"
                              : "bg-white text-[#1A1A1A] rounded-bl-sm border border-[#EAEAEA]"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {m.isAdmin ? (
                              <Shield className="w-3 h-3 text-white/80" />
                            ) : (
                              <User className="w-3 h-3 text-[#7A7A7A]" />
                            )}
                            <span className={`text-xs font-medium ${m.isAdmin ? "text-white/90" : "text-[#7A7A7A]"}`}>
                              {m.senderName}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                          <div className={`mt-2 text-[11px] ${m.isAdmin ? "text-white/80" : "text-[#7A7A7A]"}`}>{time}</div>
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

      {/* Modal de exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-[#EAEAEA]">
            <div className="p-4 border-b border-[#EAEAEA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D96C06]" />
                <h3 className="font-semibold text-[#1A1A1A]">Excluir chat</h3>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="p-2 rounded-lg hover:bg-[#EAEAEA]">
                <X className="w-4 h-4 text-[#7A7A7A]" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-sm text-[#1A1A1A]">
                Tem certeza que deseja excluir o chat:
                <span className="font-mono"> {deleteTarget.id}</span>?
              </p>
              <p className="text-xs text-[#7A7A7A]">Isso removerá todas as mensagens e participantes deste chat. A ação não pode ser desfeita.</p>
            </div>
            <div className="p-4 border-t border-[#EAEAEA] flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-xl border border-[#EAEAEA] hover:bg-[#EAEAEA] disabled:opacity-50 text-[#1A1A1A]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteChat}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-xl bg-[#AF1B1B] text-white hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
