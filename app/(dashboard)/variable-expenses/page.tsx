// src/app/(dashboard)/variable-expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { getBudgets, setBudgetLimit, deleteBudget, Budget } from "@/services/budgetService";
import { getMonthlyTransactions, addSimpleTransaction } from "@/services/transactionService";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, TrendingUp, AlertCircle } from "lucide-react";

export default function VariableExpensesPage() {
  const { user } = useAuth();
  const { household } = useHousehold();

  // Estados
  const [currentDate, setCurrentDate] = useState(new Date());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [spentMap, setSpentMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Modal / Inputs
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  
  // Estado para adicionar gasto rápido em um card específico
  const [quickAddId, setQuickAddId] = useState<string | null>(null);
  const [quickAmount, setQuickAmount] = useState("");

  const loadData = async () => {
    if (!household) return;
    setLoading(true);
    try {
      // 1. Busca os Limites (Cotas)
      const budgetList = await getBudgets(household.id);
      setBudgets(budgetList);

      // 2. Busca os Gastos do Mês
      const transactions = await getMonthlyTransactions(household.id, currentDate);
      
      // 3. Soma os gastos por categoria
      const sums: Record<string, number> = {};
      transactions
        .filter(t => t.type === 'VARIABLE')
        .forEach(t => {
          // Normaliza a categoria para somar certo (ex: "Uber" == "Uber")
          const cat = t.category; 
          sums[cat] = (sums[cat] || 0) + t.amount;
        });
      setSpentMap(sums);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [household, currentDate]);

  // Criar nova Cota
  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household) return;
    await setBudgetLimit(household.id, newCategory, parseFloat(newLimit));
    setNewCategory("");
    setNewLimit("");
    setShowAddBudget(false);
    loadData();
  };

  // Adicionar gasto rápido dentro da cota
  const handleQuickAdd = async (category: string) => {
    if (!user || !household || !quickAmount) return;
    
    await addSimpleTransaction(user.uid, household.id, {
      description: `Gasto em ${category}`,
      amount: parseFloat(quickAmount),
      date: currentDate, // Data de hoje
      category: category, // A categoria TEM que ser igual a da cota
      type: 'VARIABLE'
    });

    setQuickAddId(null);
    setQuickAmount("");
    loadData();
  };

  const handleDeleteBudget = async (id: string) => {
    if(confirm("Remover esta cota? Os gastos passados não serão apagados.")) {
      await deleteBudget(id);
      loadData();
    }
  }

  // Cálculos Gerais
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = Object.values(spentMap).reduce((acc, v) => acc + v, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER: Navegação */}
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&lt;</button>
        <div className="text-center">
          <h2 className="text-xl font-bold capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h2>
          <p className="text-xs text-gray-500">Gestão de Cotas</p>
        </div>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&gt;</button>
      </div>

      {/* RESUMO GERAL */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-xs">Total Planejado</p>
          <p className="text-xl font-bold text-gray-200">R$ {totalLimit.toFixed(0)}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-xs">Total Gasto</p>
          <p className={`text-xl font-bold ${totalSpent > totalLimit ? 'text-red-500' : 'text-green-400'}`}>
            R$ {totalSpent.toFixed(2)}
          </p>
        </div>
      </div>

      {/* BOTÃO NOVA COTA */}
      <button 
        onClick={() => setShowAddBudget(!showAddBudget)}
        className="w-full py-3 bg-gray-800 border border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-gray-400 flex items-center justify-center gap-2 transition"
      >
        <Plus size={20} />
        {showAddBudget ? "Cancelar" : "Definir Nova Cota"}
      </button>

      {/* FORMULÁRIO NOVA COTA */}
      {showAddBudget && (
        <form onSubmit={handleCreateBudget} className="bg-gray-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 animate-in fade-in slide-in-from-top-4">
          <input 
            required
            placeholder="Categoria (ex: Uber, iFood)" 
            className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white"
            value={newCategory} onChange={e => setNewCategory(e.target.value)}
          />
          <input 
            required
            type="number"
            placeholder="Limite (R$)" 
            className="w-full md:w-32 bg-gray-900 border border-gray-700 rounded p-2 text-white"
            value={newLimit} onChange={e => setNewLimit(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Salvar</button>
        </form>
      )}

      {/* LISTA DE CARDS (COTAS) */}
      <div className="space-y-4">
        {budgets.map(budget => {
          const spent = spentMap[budget.category] || 0;
          const percentage = Math.min((spent / budget.limit) * 100, 100);
          const isOver = spent > budget.limit;

          return (
            <div key={budget.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800 relative group">
              {/* Cabeçalho do Card */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-white">{budget.category}</h3>
                  <p className="text-xs text-gray-400">
                    Gasto: R$ {spent.toFixed(2)} / <span className="text-gray-300">R$ {budget.limit}</span>
                  </p>
                </div>
                
                {/* Botão de Add Rápido */}
                {quickAddId !== budget.id ? (
                  <button 
                    onClick={() => setQuickAddId(budget.id)}
                    className="bg-blue-600/20 text-blue-400 p-2 rounded-full hover:bg-blue-600 hover:text-white transition"
                  >
                    <Plus size={18} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-black/50 p-1 rounded">
                    <input 
                      autoFocus
                      type="number" 
                      placeholder="Valor"
                      className="w-20 bg-transparent text-white text-sm p-1 outline-none text-right"
                      value={quickAmount}
                      onChange={e => setQuickAmount(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleQuickAdd(budget.category)}
                    />
                    <button onClick={() => handleQuickAdd(budget.category)} className="text-green-400 hover:bg-green-900/50 p-1 rounded"><TrendingUp size={16}/></button>
                    <button onClick={() => setQuickAddId(null)} className="text-red-400 hover:bg-red-900/50 p-1 rounded"><Trash2 size={16}/></button>
                  </div>
                )}
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Aviso se estourou */}
              {isOver && (
                <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle size={12} />
                  <span>Cota estourada em R$ {(spent - budget.limit).toFixed(2)}</span>
                </div>
              )}
              
              {/* Botão Deletar Cota (aparece no hover ou sempre no mobile) */}
              <button 
                onClick={() => handleDeleteBudget(budget.id)}
                className="absolute top-4 right-14 text-gray-700 hover:text-red-900 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}

        {!loading && budgets.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Nenhuma cota definida. <br/> Clique em "Definir Nova Cota" acima.
          </p>
        )}
      </div>
    </div>
  );
}