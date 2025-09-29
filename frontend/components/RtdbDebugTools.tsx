// RtdbDebugTools.tsx (ou no final do arquivo da page ADM)
"use client";

import { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getDatabase, ref, get, set, push,
  onValue, query, orderByChild, orderByKey, limitToLast
} from "firebase/database";

// Se você já exporta auth/rtdb prontos, pode importar do seu módulo:
// import { auth, rtdb } from "@/src/firebase/firebase";

type Props = { selectedChat: string | null };

export default function RtdbDebugTools({ selectedChat }: Props) {
  const auth = getAuth();
  const rtdb = getDatabase();

  const [chatIdInput, setChatIdInput] = useState<string>(selectedChat || "");
  const [log, setLog] = useState<string>("");
  const [byTsActive, setByTsActive] = useState(false);
  const [byKeyActive, setByKeyActive] = useState(false);

  const offTsRef = useRef<(() => void) | null>(null);
  const offKeyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (selectedChat) setChatIdInput(selectedChat);
  }, [selectedChat]);

  const addLog = (line: any) => {
    const text = typeof line === "string" ? line : JSON.stringify(line, null, 2);
    setLog((prev) => `${new Date().toLocaleTimeString()}  ${text}\n${prev}`);
  };

  const showDbUrl = () => {
    const url =
      (rtdb as any)?._repoInfo_?.toString?.() ||
      (rtdb as any)?._repoInfo_ ||
      (rtdb.app as any)?.options?.databaseURL ||
      "(desconhecido)";
    addLog(`databaseURL: ${url}`);
  };

  const listChats = async () => {
    const snap = await get(ref(rtdb, "chats"));
    if (!snap.exists()) return addLog("Não há /chats nesta instância.");
    const ids = Object.keys(snap.val() || {});
    addLog({ chatIds: ids });
  };

  const inspectChat = async () => {
    const id = chatIdInput.trim();
    if (!id) return addLog("Informe um chatId.");
    const parts = await get(ref(rtdb, `chats/${id}/participants`));
    const msgs = await get(ref(rtdb, `chats/${id}/messages`));
    addLog({
      chatId: id,
      participantsExists: parts.exists(),
      participants: parts.val() || null,
      messagesExists: msgs.exists(),
      messageCount: msgs.exists() ? Object.keys(msgs.val() || {}).length : 0,
      sampleMessage: msgs.exists() ? Object.values(msgs.val() as any)[0] : null,
    });
  };

  const ensureParticipant = async () => {
    const id = chatIdInput.trim();
    if (!id) return addLog("Informe um chatId.");
    const uid = auth.currentUser?.uid;
    if (!uid) return addLog("Sem usuário autenticado.");
    await set(ref(rtdb, `chats/${id}/participants/${uid}`), true);
    addLog(`Virou participante: chats/${id}/participants/${uid} = true`);
  };

  const seedMessage = async () => {
    const id = chatIdInput.trim();
    if (!id) return addLog("Informe um chatId.");
    const uid = auth.currentUser?.uid || "ADM_DEBUG";
    const name = auth.currentUser?.displayName || "Debug";
    await push(ref(rtdb, `chats/${id}/messages`), {
      text: "Mensagem de diagnóstico",
      senderId: uid,
      senderName: name,
      isAdmin: true,
      timestamp: Date.now(), // evita validação de serverTimestamp
    });
    addLog(`Seed enviada em chats/${id}/messages (timestamp numérico).`);
  };

  const attachByTimestamp = () => {
    const id = chatIdInput.trim();
    if (!id) return addLog("Informe um chatId.");
    if (offTsRef.current) offTsRef.current(); // limpa anterior

    const tsRef = query(
      ref(rtdb, `chats/${id}/messages`),
      orderByChild("timestamp"),
      limitToLast(50)
    );

    const off = onValue(
        tsRef,
        (snap) => {
        const count = snap.exists() ? Object.keys(snap.val() || {}).length : 0;
        addLog({ listener: "byTimestamp", exists: snap.exists(), count });
        },
        (err) => addLog({ listener: "byTimestamp", error: { code: (err as any)?.code, message: String(err) } })
    );

    offTsRef.current = off;
    setByTsActive(true);
    addLog("Listener byTimestamp ligado.");
  };

  const attachByKey = () => {
    const id = chatIdInput.trim();
    if (!id) return addLog("Informe um chatId.");
    if (offKeyRef.current) offKeyRef.current();

    const kRef = query(
      ref(rtdb, `chats/${id}/messages`),
      orderByKey(),
      limitToLast(50)
    );

    const off = onValue(
        kRef,
        (snap) => {
        const count = snap.exists() ? Object.keys(snap.val() || {}).length : 0;
        addLog({ listener: "byKey", exists: snap.exists(), count });
        },
        (err) => addLog({ listener: "byKey", error: { code: (err as any)?.code, message: String(err) } })
    );

    offKeyRef.current = off;
    setByKeyActive(true);
    addLog("Listener byKey ligado.");
  };

  const detachAll = () => {
    try { offTsRef.current && offTsRef.current(); } catch {}
    try { offKeyRef.current && offKeyRef.current(); } catch {}
    offTsRef.current = null;
    offKeyRef.current = null;
    setByTsActive(false);
    setByKeyActive(false);
    addLog("Listeners desligados.");
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-yellow-900">
            RTDB Debug Tools (apagar depois)
          </h3>
          <button
            onClick={detachAll}
            className="text-xs px-2 py-1 rounded border hover:bg-yellow-100"
          >
            Desligar listeners
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={showDbUrl} className="px-3 py-2 text-xs rounded border bg-white hover:bg-gray-50">
                Mostrar databaseURL
              </button>
              <button onClick={listChats} className="px-3 py-2 text-xs rounded border bg-white hover:bg-gray-50">
                Listar chatIds
              </button>
            </div>

            <div className="flex gap-2">
              <input
                value={chatIdInput}
                onChange={(e) => setChatIdInput(e.target.value)}
                placeholder="chatId (usa o selecionado por padrão)"
                className="flex-1 px-2 py-2 text-xs rounded border"
              />
              <button onClick={inspectChat} className="px-3 py-2 text-xs rounded border bg-white hover:bg-gray-50">
                Inspecionar chat
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={ensureParticipant} className="px-3 py-2 text-xs rounded border bg-white hover:bg-gray-50">
                Garantir participante
              </button>
              <button onClick={seedMessage} className="px-3 py-2 text-xs rounded border bg-white hover:bg-gray-50">
                Seed mensagem
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={attachByTimestamp}
                disabled={byTsActive}
                className="px-3 py-2 text-xs rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Listener byTimestamp
              </button>
              <button
                onClick={attachByKey}
                disabled={byKeyActive}
                className="px-3 py-2 text-xs rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Listener byKey
              </button>
            </div>
          </div>

          <div>
            <pre className="text-xs bg-white border rounded p-3 max-h-64 overflow-auto whitespace-pre-wrap">
{log || "Logs aparecerão aqui..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
