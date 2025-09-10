// /hooks/useUnreadBadge.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { auth, rtdb } from "@/src/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, query, ref, orderByKey, limitToLast } from "firebase/database";

type PerChatCounts = Record<string, number>;

function lsKey(uid: string) {
  return `inbox_last_read_counts:${uid}`;
}

function loadLastRead(uid: string): PerChatCounts {
  try {
    const raw = localStorage.getItem(lsKey(uid));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLastRead(uid: string, data: PerChatCounts) {
  try {
    localStorage.setItem(lsKey(uid), JSON.stringify(data));
  } catch {}
}

export default function useUnreadBadge(enabled: boolean) {
  const [uid, setUid] = useState<string | null>(null);

  // contagem atual de mensagens por chat (snapshot do RTDB)
  const [currentCounts, setCurrentCounts] = useState<PerChatCounts>({});
  // “até onde” o usuário leu por chat (persistido em localStorage)
  const lastReadRef = useRef<PerChatCounts>({});

  // pega UID para isolar o armazenamento
  useEffect(() => {
    if (!enabled) {
      setUid(null);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUid(u.uid);
        lastReadRef.current = loadLastRead(u.uid);
      } else {
        setUid(null);
        lastReadRef.current = {};
      }
    });
    return () => unsub();
  }, [enabled]);

  // escuta a lista de chats e lê a contagem de mensagens
  useEffect(() => {
    if (!enabled) {
      setCurrentCounts({});
      return;
    }
    const qRef = query(ref(rtdb, "chats"), orderByKey(), limitToLast(200));
    const off = onValue(qRef, (snap) => {
      const next: PerChatCounts = {};
      snap.forEach((child) => {
        const v = child.val() || {};
        const id = child.key as string;

        // preferir contagem direta se existir; senão contar as chaves de messages
        const count =
          typeof v.messageCount === "number"
            ? v.messageCount
            : v.messages && typeof v.messages === "object"
            ? Object.keys(v.messages).length
            : 0;

        next[id] = count;
      });
      setCurrentCounts(next);
    });
    return () => off();
  }, [enabled]);

  // calcula perChat e total (somatório real)
  const perChat = useMemo(() => {
    const result: PerChatCounts = {};
    for (const [chatId, curr] of Object.entries(currentCounts)) {
      const last = lastReadRef.current[chatId] ?? 0;
      const diff = curr - last;
      result[chatId] = diff > 0 ? diff : 0;
    }
    return result;
  }, [currentCounts]);

  const total = useMemo(
    () => Object.values(perChat).reduce((sum, n) => sum + n, 0),
    [perChat]
  );

  // marca como lido: guarda a contagem atual (ou uma passada explicitamente)
  function markRead(chatId: string, currentCount?: number) {
    if (!uid) return;
    const curr =
      typeof currentCount === "number"
        ? currentCount
        : currentCounts[chatId] ?? 0;

    const next = { ...lastReadRef.current, [chatId]: curr };
    lastReadRef.current = next;
    saveLastRead(uid, next);
  }

  // utilitário opcional: marcar todos como lidos
  function markAllRead() {
    if (!uid) return;
    const next = { ...currentCounts };
    lastReadRef.current = next;
    saveLastRead(uid, next);
  }

  return { total, perChat, markRead, markAllRead };
}
