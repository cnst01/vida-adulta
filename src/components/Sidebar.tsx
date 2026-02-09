// src/components/Sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Adicione useRouter
import { 
  LayoutDashboard, 
  Zap, 
  ShoppingBag, 
  PieChart, 
  Settings, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); // Inicializa o router
  const { logOut } = useAuth();

  // Função dedicada para o Logout
  const handleLogout = async () => {
    try {
      console.log("Iniciando logout..."); // Log para depuração
      await logOut(); // Espera o Firebase desconectar
      router.push("/login"); // Força o redirecionamento
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  const menuItems = [
    { name: "Visão Geral", icon: LayoutDashboard, path: "/app" },
    { name: "Custos Fixos", icon: Zap, path: "/fixed-costs" },
    { name: "Compras", icon: ShoppingBag, path: "/purchases" },
    { name: "Variáveis", icon: PieChart, path: "/variable-expenses" },
    { name: "Ajustes", icon: Settings, path: "/settings" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-gray-900 border-r border-gray-800 fixed left-0 top-0">
        <div className="p-6 border-b border-gray-800">
          <Image 
              src="/logo.png" 
              alt="Vida Adulta Logo" 
              width={60}  // Define largura fixa
              height={60} // Define altura fixa
              className="rounded-lg shadow-lg shadow-blue-900/50 object-cover"
          />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout} // Usa a nova função
            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-900/20 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* MOBILE NAVBAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive(item.path) ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          ))}
          {/* Botão de Sair no Mobile também */}
          <button 
             onClick={handleLogout}
             className="flex flex-col items-center justify-center w-full h-full space-y-1 text-red-400"
          >
            <LogOut size={20} />
            <span className="text-[10px]">Sair</span>
          </button>
        </div>
      </nav>
    </>
  );
}