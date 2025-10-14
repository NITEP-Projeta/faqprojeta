'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { auth, rtdb } from "@/src/firebase/firebase";
import {
  onValue,
  ref,
  update,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";

/**
 * Calcula badge de não lidas por chat a partir de:
 * - readReceipts por usuário: chats/{chatId}/readReceipts/{uid} = timestamp (ms)
 * - mensagens com 'timestamp' numérico e 'senderId'
 * Regra: conta mensagens com timestamp > lastReadAt E senderId !== uid
 */
type PerChat = Record<string, number>;

export default function useUnreadBadge(isAdmin: boolean) {
  const [perChat, setPerChat] = useState<PerChat>({});
  const total = useMemo(
    () => Object.values(perChat).reduce((a, b) => a + b, 0),
    [perChat]
  );

  const uidRef = useRef<string | null>(null);
  useEffect(() => {
    uidRef.current = auth.currentUser?.uid ?? null;
  }, [auth.currentUser]);

  useEffect(() => {
    if (!isAdmin) {
      setPerChat({});
      return;
    }

    // Observa lista de chats que têm mensagens (pode ajustar o filtro ao seu schema)
    const chatsRef = ref(rtdb, "chats");
    const stopAll: Array<() => void> = [];

    const unsubChats = onValue(chatsRef, (snap) => {
      const uid = uidRef.current;
      if (!uid || !snap.exists()) {
        setPerChat({});
        return;
      }

      const acc: PerChat = {};
      const detachMap: Record<string, Array<() => void>> = {};

      snap.forEach((child) => {
        const chatId = child.key as string;
        const v = child.val() || {};

        // filtra chats sem mensagens
        const hasMsgs =
          v.hasMessages === true ||
          (v.messages && typeof v.messages === "object" && Object.keys(v.messages).length > 0);
        if (!hasMsgs) return;

        // Observa recibo de leitura do usuário
        const rrRef = ref(rtdb, `chats/${chatId}/readReceipts/${uid}`);
        let lastReadAt = 0;

        const stopRR = onValue(rrRef, (rrSnap) => {
          lastReadAt = Number(rrSnap.val() || 0);
        });

        // Observa últimas N mensagens para contar não lidas
        const msgsRef = query(
          ref(rtdb, `chats/${chatId}/messages`),
          orderByChild("timestamp"),
          limitToLast(200) // pode ajustar
        );

        const stopMsgs = onValue(msgsRef, (msgsSnap) => {
          if (!msgsSnap.exists()) {
            acc[chatId] = 0;
            setPerChat((old) => ({ ...old, ...acc }));
            return;
          }
          const me = uidRef.current;
          let cnt = 0;
          msgsSnap.forEach((m) => {
            const mv = m.val() || {};
            const ts = Number(
              typeof mv.timestamp === "number"
                ? mv.timestamp
                : mv.createdAt ?? mv.sentAt ?? mv.updatedAt ?? 0
            );
            const senderId = mv.senderId ?? mv.uid ?? "";
            if (ts > lastReadAt && senderId && senderId !== me) cnt++;
          });
          acc[chatId] = cnt;
          setPerChat((old) => ({ ...old, ...acc }));
        });

        detachMap[chatId] = [stopRR, stopMsgs];
      });

      // limpa handlers antigos a cada mudança grande
      stopAll.forEach((f) => f());
      stopAll.length = 0;
      Object.values(detachMap).forEach((arr) => {
        stopAll.push(...arr);
      });
    });

    return () => {
      unsubChats();
      stopAll.forEach((f) => f());
    };
  }, [isAdmin]);

  /** Marca como lido agora (por usuário) */
  async function markRead(chatId: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await update(ref(rtdb, `chats/${chatId}/readReceipts`), {
      [uid]: Date.now(),
    });
  }

  return { total, perChat, markRead };
}
