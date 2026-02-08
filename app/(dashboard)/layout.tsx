// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Sidebar />
      
      {/* Área de conteúdo que empurra para a direita no Desktop e para cima no Mobile */}
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}