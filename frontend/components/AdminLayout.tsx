// components/AdminLayout.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarSeparator,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home    as HomeIcon,
  Users   as UsersIcon,
  BookOpen as BookOpenIcon,
  ChartBar as ChartBarIcon,
  Settings as SettingsIcon,
  LogOut   as LogOutIcon,
} from 'lucide-react';

interface AdminLayoutProps {
  title?: string;
  children: ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const pathname = usePathname();
  const navItems = [
    { label: 'Dashboard',          href: '/admin',          Icon: HomeIcon     },
    { label: 'Gerenciar Usuários', href: '/admin/users',    Icon: UsersIcon    },
    { label: 'Treinamentos',       href: '/admin/trainings',Icon: BookOpenIcon },
    { label: 'Métricas',           href: '/admin/metrics',  Icon: ChartBarIcon },
    { label: 'Configurações',      href: '/admin/settings', Icon: SettingsIcon },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarTrigger />

          <SidebarHeader>
            <span className="text-lg font-bold">Administração</span>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarMenu>
              {navItems.map(({ label, href, Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                  >
                    <Link href={href} className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarSeparator />

          <SidebarFooter>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Sair">
                <Link href="/logout" className="flex items-center gap-2">
                  <LogOutIcon className="h-5 w-5" />
                  <span>Sair</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
            <h1 className="text-2xl font-semibold">{title}</h1>
          </header>
          <main className="p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
