// src/app/(dashboard)/variable-expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { getBudgets, setBudgetLimit, deleteBudget, Budget } from "@/services/budgetService";
import { 
  getMonthlyTransactions, 
  addSimpleTransaction, 
  deleteTransaction, 
  updateTransaction
} from "@/services/transactionService";
import { Transaction } from "@/types/finance";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, TrendingUp, AlertCircle, List, X, Edit2, Save } from "lucide-react";

export default function VariableExpensesPage() {
  const { user } = useAuth();
  const { household } = useHousehold();

  // Estados
  const [currentDate, setCurrentDate] = useState(new Date());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Todos os gastos do mês
  const [loading, setLoading] = useState(false);

  // States para Modal de Histórico/Edição
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // State Edição (Dentro do modal)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");

  // UI States
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  
  const [quickAddId, setQuickAddId] = useState<string | null>(null);
  const [quickAmount, setQuickAmount] = useState("");

  const loadData = async () => {
    if (!household) return;
    setLoading(true);
    try {
      const budgetList = await getBudgets(household.id);
      setBudgets(budgetList);

      const txs = await getMonthlyTransactions(household.id, currentDate);
      setTransactions(txs.filter(t => t.type === 'VARIABLE'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [household, currentDate]);

  // --- ACTIONS ---

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household) return;
    await setBudgetLimit(household.id, newCategory, parseFloat(newLimit));
    setNewCategory("");
    setNewLimit("");
    setShowAddBudget(false);
    loadData();
  };

  const handleQuickAdd = async (category: string) => {
    if (!user || !household || !quickAmount) return;
    await addSimpleTransaction(user.uid, household.id, {
      description: `Gasto em ${category}`,
      amount: parseFloat(quickAmount),
      date: currentDate, 
      category: category,
      type: 'VARIABLE'
    });
    setQuickAddId(null);
    setQuickAmount("");
    loadData();
  };

  const handleDeleteBudget = async (id: string) => {
    if(confirm("Remover esta cota?")) {
      await deleteBudget(id);
      loadData();
    }
  };

  // --- LÓGICA DE DETALHES E EDIÇÃO ---
  
  const openDetails = (category: string) => {
    setSelectedCategory(category);
    setDetailsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if(!confirm("Excluir este gasto?")) return;
    await deleteTransaction(id);
    loadData(); // Atualiza a tela de fundo
  };

  const startEditing = (t: Transaction) => {
    setEditingId(t.id);
    setEditDesc(t.description);
    setEditAmount(t.amount.toString());
  };

  const saveEdit = async (id: string) => {
    if (!editDesc || !editAmount) return;
    await updateTransaction(id, {
      description: editDesc,
      amount: parseFloat(editAmount)
    });
    setEditingId(null);
    loadData();
  };

  // Filtra as transações da categoria selecionada para exibir no modal
  const categoryTransactions = transactions.filter(t => t.category === selectedCategory);

  // Cálculos Gerais
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);

  // Função auxiliar para calcular gasto de UMA categoria
  const getSpentByCategory = (cat: string) => {
    return transactions
      .filter(t => t.category === cat)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&lt;</button>
        <h2 className="text-xl font-bold capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&gt;</button>
      </div>

      {/* RESUMO GERAL */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-xs">Cotas Definidas</p>
          <p className="text-xl font-bold text-gray-200">R$ {totalLimit.toFixed(0)}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-xs">Total Gasto</p>
          <p className={`text-xl font-bold ${totalSpent > totalLimit ? 'text-red-500' : 'text-green-400'}`}>
            R$ {totalSpent.toFixed(2)}
          </p>
        </div>
      </div>

      <button 
        onClick={() => setShowAddBudget(!showAddBudget)}
        className="w-full py-3 bg-gray-800 border border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        {showAddBudget ? "Cancelar" : "Definir Nova Cota"}
      </button>

      {showAddBudget && (
        <form onSubmit={handleCreateBudget} className="bg-gray-800 p-4 rounded-xl flex flex-col md:flex-row gap-3">
          <input required placeholder="Categoria" className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
          <input required type="number" placeholder="Limite (R$)" className="w-full md:w-32 bg-gray-900 border border-gray-700 rounded p-2 text-white" value={newLimit} onChange={e => setNewLimit(e.target.value)} />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Salvar</button>
        </form>
      )}

      {/* LISTA DE CARDS */}
      <div className="space-y-4">
        {budgets.map(budget => {
          const spent = getSpentByCategory(budget.category);
          const percentage = Math.min((spent / budget.limit) * 100, 100);
          const isOver = spent > budget.limit;

          return (
            <div key={budget.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800 relative group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-white">{budget.category}</h3>
                  <p className="text-xs text-gray-400">R$ {spent.toFixed(2)} / <span className="text-gray-300">R$ {budget.limit}</span></p>
                </div>
                
                {/* AÇÕES DO CARD */}
                <div className="flex items-center gap-2">
                  {/* Botão Ver Histórico */}
                  <button onClick={() => openDetails(budget.category)} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-full" title="Ver Lista">
                    <List size={18} />
                  </button>

                  {/* Botão Add Rápido */}
                  {quickAddId !== budget.id ? (
                    <button onClick={() => setQuickAddId(budget.id)} className="bg-blue-600/20 text-blue-400 p-2 rounded-full hover:bg-blue-600 hover:text-white transition">
                      <Plus size={18} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-black/50 p-1 rounded">
                      <input autoFocus type="number" placeholder="Valor" className="w-20 bg-transparent text-white text-sm p-1 outline-none text-right" value={quickAmount} onChange={e => setQuickAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAdd(budget.category)} />
                      <button onClick={() => handleQuickAdd(budget.category)} className="text-green-400 p-1"><TrendingUp size={16}/></button>
                      <button onClick={() => setQuickAddId(null)} className="text-red-400 p-1"><X size={16}/></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }} />
              </div>
              
              <button onClick={() => handleDeleteBudget(budget.id)} className="absolute top-4 right-28 text-gray-700 hover:text-red-900 opacity-0 group-hover:opacity-100 transition">
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL DE HISTÓRICO / DETALHES */}
      {detailsModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-gray-900 w-full max-w-lg rounded-xl border border-gray-800 flex flex-col max-h-[80vh]">
            
            <div className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 rounded-t-xl z-10">
              <h3 className="text-lg font-bold">Gastos: {selectedCategory}</h3>
              <button onClick={() => setDetailsModalOpen(false)}><X className="text-gray-400" /></button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {categoryTransactions.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum gasto registrado nesta categoria este mês.</p>
              ) : (
                categoryTransactions.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-black/30 p-3 rounded border border-gray-800">
                    
                    {/* MODO EDIÇÃO */}
                    {editingId === t.id ? (
                      <div className="flex gap-2 w-full">
                         <input 
                            className="flex-1 bg-gray-800 border border-blue-500 rounded px-2 py-1 text-sm text-white"
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                         />
                         <input 
                            className="w-24 bg-gray-800 border border-blue-500 rounded px-2 py-1 text-sm text-white"
                            type="number"
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                         />
                         <button onClick={() => saveEdit(t.id)} className="text-green-400"><Save size={18} /></button>
                         <button onClick={() => setEditingId(null)} className="text-red-400"><X size={18} /></button>
                      </div>
                    ) : (
                      /* MODO VISUALIZAÇÃO */
                      <>
                        <div>
                          <p className="text-sm text-white font-medium">{t.description}</p>
                          <p className="text-xs text-gray-500">{format(t.date, "dd/MM/yyyy")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">R$ {t.amount.toFixed(2)}</span>
                          <div className="flex gap-1">
                            <button onClick={() => startEditing(t)} className="text-gray-500 hover:text-blue-400 p-1">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-600 hover:text-red-400 p-1">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900 rounded-b-xl">
               <div className="flex justify-between font-bold text-white">
                 <span>Total</span>
                 <span>R$ {getSpentByCategory(selectedCategory!).toFixed(2)}</span>
               </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}