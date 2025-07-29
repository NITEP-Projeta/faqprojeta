'use client'

import { Avatar } from 'primereact/avatar'
import { Ripple } from 'primereact/ripple'
import { useState } from 'react'
import Link from 'next/link'


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true)
  const [isApplicationOpen, setIsApplicationOpen] = useState(true)

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR FIXA */}
      {isSidebarOpen && (
        <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 left-0 shadow-sm z-20 transition-all duration-300">
          {/* TOPO COM LOGO */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img src="/Logotipo_Projeta_2.png" alt="logo" className="w-[120]" />
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="pi pi-times"></i>
            </button>
          </div>

          {/* MENU */}
          <div className="overflow-y-auto flex-1 px-4 py-4 text-sm">
            {/* FAVORITES */}
            <div className="mb-4">
              <button
                onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
                className="text-gray-500 font-medium mb-2 flex items-center justify-between w-full focus:outline-none"
              >
                <span>FAVORITES</span>
                <i
                  className={`pi ${isFavoritesOpen ? 'pi-chevron-up' : 'pi-chevron-down'} transition-transform`}
                ></i>
              </button>

              {isFavoritesOpen && (
                <ul className="space-y-1 transition-all">
                    <li>
                        <Link
                            href="/"
                            aria-label="Ir para a página principal"
                            className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#00A6C2] text-gray-700"
                        >
                            <i className="pi pi-home" />
                            <span className="font-medium">Início</span>
                        </Link>
                    </li>
                    <li className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#00A6C2] text-gray-700">
                        <i className="pi pi-bookmark text-gray-600"></i> <span>Bookmarks</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#00A6C2] text-gray-700">
                        <i className="pi pi-users text-gray-600"></i> <span>Team</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#00A6C2] text-gray-700">
                        <div className="flex items-center gap-2">
                        <i className="pi pi-comments text-gray-600"></i> <span>Messages</span>
                        </div>
                        <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5">3</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#00A6C2] text-gray-700">
                        <i className="pi pi-calendar text-gray-600"></i> <span>Calendar</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#00A6C2] text-gray-700">
                        <i className="pi pi-cog text-gray-600"></i> <span>Settings</span>
                    </li>
                </ul>
              )}
            </div>

            {/* APPLICATION */}
            <div>
              <button
                onClick={() => setIsApplicationOpen(!isApplicationOpen)}
                className="text-gray-500 font-medium mb-2 flex items-center justify-between w-full focus:outline-none"
              >
                <span>APPLICATION</span>
                <i
                  className={`pi ${isApplicationOpen ? 'pi-chevron-up' : 'pi-chevron-down'} transition-transform`}
                ></i>
              </button>

              {isApplicationOpen && (
                <ul className="space-y-1">
                  <li className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#00A6C2] text-gray-700">
                    <i className="pi pi-folder text-gray-600"></i> <span>Projects</span>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#00A6C2] text-gray-700">
                    <i className="pi pi-chart-bar text-gray-600"></i> <span>Performance</span>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded transition-all duration-300 ease-in-out hover:bg-[#F1F5F9] hover:scale-[1.03] hover:text-[#00A6C2] text-gray-700">
                    <i className="pi pi-cog text-gray-600"></i> <span>Settings</span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* RODAPÉ COM USUÁRIO */}
          <div className="p-4 border-t border-gray-200">
            <a className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition cursor-pointer">
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                shape="circle"
                className="w-8 h-8"
              />
              <span className="font-semibold text-sm text-gray-800">Amy Elsner</span>
            </a>
          </div>
        </aside>
      )}

      {/* BOTÃO DE REABRIR SIDEBAR */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white border border-gray-300 shadow p-2 rounded-full text-gray-600 hover:text-black"
        >
          <i className="pi pi-bars"></i>
        </button>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 bg-[#F5F5F5] p-4 overflow-y-auto">{children}</main>
    </div>
  )
}
