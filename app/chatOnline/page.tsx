"use client";

import { useState } from 'react';
import { FiMenu, FiSearch, FiSend } from 'react-icons/fi';

interface Chat {
  id: number;
  name: string;
  last: string;
  avatar: string;
  unread: number;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  avatar: string;
  isOwn?: boolean;
}

const chats: Chat[] = [
    { id: 1, name: 'Alice Campbell', last: 'Could someone please send a recording of...', avatar: 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png', unread: 1 },
    { id: 2, name: 'Human Resources', last: 'Please save all the CVs in...', avatar: 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png', unread: 0 },
    { id: 3, name: 'Teste 03', last: 'Could someone please send a recording of...', avatar: 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png', unread: 1 },
    { id: 4, name: 'Teste 04', last: 'Please save all the CVs in...', avatar: 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png', unread: 0 },
];

// Exemplo de mensagens para o chat selecionado
const messagesData: Record<number, Message[]> = {
    1: [
    { id: 1, sender: 'Alice', text: 'Could someone please send a recording of the conference?', time: '15:03', avatar: 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png'},
    { id: 2, sender: 'You', text: 'Sure, uploading now!', time: '15:05', avatar: 'Logotipo_Projeta.png', isOwn: true }
    ],

  2: [{ id: 1, sender: 'HR', text: 'Please save all the CVs in the shared folder.', time: '09:00', avatar: 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png'}],
};

export default function ChatLayout() {
  const [selected, setSelected] = useState<Chat>(chats[0]);
  const [openSidebar, setOpenSidebar] = useState(false);

  // Pega as mensagens do chat selecionado ou vazio
  const messages = messagesData[selected.id] || [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-20 transform ${openSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex flex-col h-full w-72 bg-white shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
            <button className="md:hidden text-gray-600" onClick={() => setOpenSidebar(false)}>
              ✕
            </button>
          </div>
          <div className="p-4">
            <div className="relative">
              <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-2">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => { setSelected(chat); setOpenSidebar(false); }}
                className={`group flex items-center px-3 py-2 my-1 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${selected.id === chat.id ? 'bg-blue-100' : ''}`}
              >
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full mr-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-800 group-hover:text-blue-600 truncate">{chat.name}</h3>
                    {chat.unread > 0 && (
                      <span className="text-xs font-semibold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">{chat.last}</p>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col ml-0 md:ml-72">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
          <div className="flex items-center">
            <button className="md:hidden mr-4 text-gray-600" onClick={() => setOpenSidebar(true)}>
              <FiMenu size={24} />
            </button>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{selected.name}</h3>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-6">
            {/* Renderiza mensagens dinamicamente */}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'items-start'}`}>
                {!msg.isOwn && (
                  <img src={msg.avatar} alt={msg.sender} className="w-10 h-10 rounded-full mr-4" />
                )}
                <div className={`max-w-xl p-4 rounded-2xl shadow ${msg.isOwn ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>                
                  <p>{msg.text}</p>
                  <span className={`block mt-2 text-xs ${msg.isOwn ? 'text-gray-200' : 'text-gray-400'} text-right`}>{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="px-6 py-4 bg-white border-t">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              <FiSend size={20} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
