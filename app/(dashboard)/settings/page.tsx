// src/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { createHousehold, updateHouseholdSettings, joinHousehold } from "@/services/householdService";
import { Save, Users, Copy } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { household, loadingHousehold, refreshHousehold } = useHousehold();
  
  const [income, setIncome] = useState("");
  const [closingDay, setClosingDay] = useState("10");
  const [joinId, setJoinId] = useState(""); // ID para esposa entrar
  const [isSaving, setIsSaving] = useState(false);

  // Carrega dados se já existirem
  useEffect(() => {
    if (household) {
      setIncome(household.settings.monthlyIncome.toString());
      setClosingDay(household.settings.closingDay.toString());
    }
  }, [household]);

  const handleCreateOrUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (household) {
        // Atualizar
        await updateHouseholdSettings(household.id, {
          monthlyIncome: parseFloat(income),
          closingDay: parseInt(closingDay)
        });
        alert("Configurações atualizadas!");
      } else {
        // Criar Nova Família
        await createHousehold(user.uid, user.displayName || "Usuário", parseFloat(income));
        alert("Família criada com sucesso!");
      }
      await refreshHousehold();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !joinId) return;
    try {
      await joinHousehold(user.uid, joinId);
      alert("Você entrou na família!");
      refreshHousehold();
    } catch (e) {
      alert("Erro ao entrar. Verifique o ID.");
    }
  };

  if (loadingHousehold) return <div className="p-8">Carregando configurações...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white mb-6">Configurações</h1>

      {/* --- SEÇÃO 1: DADOS FINANCEIROS --- */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Save className="text-blue-500" size={20} />
          Parâmetros da Casa
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Renda Mensal Familiar (R$)</label>
            <input 
              type="number" 
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: 5000.00"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Dia de Fechamento (Cartões)</label>
            <input 
              type="number" 
              value={closingDay}
              onChange={(e) => setClosingDay(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: 10"
              max={31}
              min={1}
            />
          </div>

          <button 
            onClick={handleCreateOrUpdate}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition"
          >
            {isSaving ? "Salvando..." : household ? "Atualizar Dados" : "Criar Meu Controle Financeiro"}
          </button>
        </div>
      </div>

      {/* --- SEÇÃO 2: COMPARTILHAMENTO (Só aparece se já criou) --- */}
      {household ? (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="text-green-500" size={20} />
            Convidar Esposa(o)
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Peça para ela(e) criar uma conta e colar este código na área "Entrar em uma Família" abaixo.
          </p>
          <div className="flex gap-2 items-center bg-black/30 p-3 rounded border border-dashed border-gray-700">
            <code className="flex-1 text-green-400 font-mono text-sm break-all">
              {household.id}
            </code>
            <button 
              onClick={() => navigator.clipboard.writeText(household.id)}
              className="p-2 hover:bg-gray-700 rounded"
              title="Copiar"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* --- SEÇÃO 3: ENTRAR EM OUTRA FAMÍLIA (Só se não tem família) --- */
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Entrar em uma Família Existente</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="Cole o ID da família aqui..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded p-3 text-white"
            />
            <button 
              onClick={handleJoin}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 rounded font-semibold"
            >
              Entrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}