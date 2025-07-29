"use client";

import { usePathname } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noNavBarRoutes = ["/login", "/cadastro", "/recuperarSenha"];

  const isNoNavBar = noNavBarRoutes.includes(pathname);

  return <>{isNoNavBar ? children : <ClientLayout>{children}</ClientLayout>}</>;
}
