// src/app/(dashboard)/fixed-costs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { 
  createRecurringFixedCost, 
  getMonthlyTransactions, 
  toggleTransactionStatus, 
  deleteTransaction,
  updateTransaction,
  deleteTransactionGroup // <--- Importado
} from "@/services/transactionService";
import { Transaction } from "@/types/finance";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, CheckCircle, Circle, Plus, Edit2, X, Save, AlertTriangle } from "lucide-react";

export default function FixedCostsPage() {
  const { user } = useAuth();
  const { household } = useHousehold();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDay, setNewDay] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  // DELETE MODAL STATE
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);

  const loadData = async () => {
    if (!household) return;
    setLoading(true);
    try {
      const data = await getMonthlyTransactions(household.id, currentDate);
      const fixed = data.filter(t => t.type === 'FIXED');
      setTransactions(fixed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [household, currentDate]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !household) return;
    try {
      await createRecurringFixedCost(user.uid, household.id, {
        description: newTitle,
        amount: parseFloat(newAmount),
        dueDay: parseInt(newDay),
        currentDate: currentDate,
        category: "Custo Fixo"
      });
      setNewTitle("");
      setNewAmount("");
      loadData();
    } catch (error) {
      alert("Erro ao criar custo fixo");
    }
  };

  // --- LÓGICA DE EXCLUSÃO ---
  
  // 1. Usuário clica na lixeira -> Abre o modal
  const requestDelete = (t: Transaction) => {
    setItemToDelete(t);
  };

  // 2. Opção: Excluir Apenas Este
  const confirmDeleteOne = async () => {
    if (!itemToDelete) return;
    await deleteTransaction(itemToDelete.id);
    setItemToDelete(null);
    loadData();
  };

  // 3. Opção: Excluir Série Inteira
  const confirmDeleteAll = async () => {
    if (!itemToDelete) return;
    // Se for um custo recorrente (tem purchaseGroupId), deleta o grupo. 
    // Se não, deleta só ele mesmo.
    if ((itemToDelete as any).purchaseGroupId) {
      await deleteTransactionGroup((itemToDelete as any).purchaseGroupId);
    } else {
      await deleteTransaction(itemToDelete.id);
    }
    setItemToDelete(null);
    loadData();
  };

  // Outras funções
  const startEditing = (t: Transaction) => {
    setEditingId(t.id);
    setEditAmount(t.amount.toString());
  };

  const saveEdit = async (id: string) => {
    if (!editAmount) return;
    await updateTransaction(id, { amount: parseFloat(editAmount) });
    setEditingId(null);
    loadData();
  };

  const handleTogglePay = async (id: string, isPaid: boolean) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, isPaid: !isPaid } : t) as any);
    await toggleTransactionStatus(id, isPaid);
  };

  // Cálculos
  const total = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalPaid = transactions.filter((t: any) => t.isPaid).reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-20 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&lt;</button>
        <h2 className="text-xl font-bold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&gt;</button>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleAdd} className="bg-gray-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end border border-gray-700">
        <div className="flex-1 w-full">
          <label className="text-xs text-gray-400">Descrição (Gera até o fim do ano)</label>
          <input 
            required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="Ex: Condomínio"
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <div className="w-full md:w-32">
          <label className="text-xs text-gray-400">Valor</label>
          <input 
            required type="number" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <div className="w-full md:w-24">
          <label className="text-xs text-gray-400">Dia Venc.</label>
          <input 
            required type="number" min="1" max="31" value={newDay} onChange={e => setNewDay(e.target.value)}
            placeholder="Dia"
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center">
          <Plus size={24} />
        </button>
      </form>

      {/* RESUMO */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-xs">A Pagar</p>
          <p className="text-xl font-bold text-white">R$ {total.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-xs">Pago</p>
          <p className="text-xl font-bold text-green-400">R$ {totalPaid.toFixed(2)}</p>
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-2">
        {loading ? <p className="text-center text-gray-500">Carregando...</p> : transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhum custo fixo neste mês.</p>
        ) : (
          transactions.map((t: any) => (
            <div key={t.id} className={`flex items-center justify-between p-4 rounded-lg border ${t.isPaid ? 'bg-gray-900/50 border-gray-800 opacity-60' : 'bg-gray-900 border-gray-700'}`}>
              
              <div className="flex items-center gap-4">
                <button onClick={() => handleTogglePay(t.id, t.isPaid)} className="text-gray-400 hover:text-green-500 transition">
                  {t.isPaid ? <CheckCircle className="text-green-500" /> : <Circle />}
                </button>
                <div>
                  <h3 className={`font-semibold ${t.isPaid ? 'line-through text-gray-500' : 'text-white'}`}>{t.description}</h3>
                  <p className="text-xs text-gray-400">Vence dia {format(t.date, 'dd')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {editingId === t.id ? (
                  <div className="flex items-center gap-1 bg-black/50 p-1 rounded">
                    <input 
                      autoFocus
                      type="number" 
                      className="w-20 bg-transparent text-white text-right border-b border-blue-500 outline-none"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                    />
                    <button onClick={() => saveEdit(t.id)} className="text-green-400"><Save size={16}/></button>
                    <button onClick={() => setEditingId(null)} className="text-red-400"><X size={16}/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">R$ {t.amount.toFixed(2)}</span>
                    {!t.isPaid && (
                      <button onClick={() => startEditing(t)} className="text-gray-500 hover:text-blue-400">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                )}

                {/* BOTÃO LIXEIRA CHAMA O MODAL */}
                <button onClick={() => requestDelete(t)} className="text-gray-600 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODAL DE EXCLUSÃO --- */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 w-full max-w-sm rounded-xl border border-gray-800 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-lg">Excluir Custo</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Você deseja excluir apenas a conta deste mês (<b>{itemToDelete.description}</b>) ou todas as ocorrências futuras também?
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDeleteOne}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium border border-gray-700 transition"
              >
                Excluir apenas este mês
              </button>
              
              {/* Só mostra opção de excluir tudo se for recorrente */}
              {(itemToDelete as any).purchaseGroupId && (
                <button 
                  onClick={confirmDeleteAll}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium shadow-lg shadow-red-900/20 transition"
                >
                  Excluir todas (Série Completa)
                </button>
              )}

              <button 
                onClick={() => setItemToDelete(null)}
                className="w-full text-gray-500 hover:text-white py-2 text-sm mt-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}