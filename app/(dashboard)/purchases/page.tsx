// src/app/(dashboard)/purchases/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHousehold } from "@/context/HouseholdContext";
import { 
  createInstallmentPurchase, 
  getMonthlyTransactions, 
  deleteTransaction, 
  toggleTransactionStatus,
  updateTransaction // <--- Importado
} from "@/services/transactionService";
import { Transaction } from "@/types/finance";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, ShoppingBag, X, CheckCircle, Circle, Edit2, Save } from "lucide-react";

export default function PurchasesPage() {
  const { user } = useAuth();
  const { household } = useHousehold();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States (Nova Compra)
  const [desc, setDesc] = useState("");
  const [amountTotal, setAmountTotal] = useState("");
  const [installments, setInstallments] = useState("1");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState("Outros");

  // Edit State (Edição Inline)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const loadData = async () => {
    if (!household) return;
    setLoading(true);
    try {
      const data = await getMonthlyTransactions(household.id, currentDate);
      setTransactions(data.filter(t => t.type === 'INSTALLMENT'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [household, currentDate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !household) return;
    try {
      await createInstallmentPurchase(user.uid, household.id, {
        description: desc,
        amountTotal: parseFloat(amountTotal),
        installments: parseInt(installments),
        startDate: new Date(date),
        category: category
      });
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      alert("Erro ao salvar compra");
    }
  };

  // --- LÓGICA DE EDIÇÃO ---
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

  const cancelEdit = () => {
    setEditingId(null);
  };
  // ------------------------

  const handleDelete = async (id: string) => {
    if(!confirm("Deletar esta parcela deste mês?")) return;
    await deleteTransaction(id);
    loadData();
  };
  
  const handleTogglePay = async (id: string, isPaid: boolean) => {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, isPaid: !isPaid } : t) as any);
      await toggleTransactionStatus(id, isPaid);
  };

  const resetForm = () => {
    setDesc("");
    setAmountTotal("");
    setInstallments("1");
    setCategory("Outros");
  };

  const totalMonth = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&lt;</button>
        <div className="text-center">
          <h2 className="text-xl font-bold capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h2>
          <p className="text-xs text-gray-500">Fatura / Parcelas</p>
        </div>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-gray-400 hover:text-white">&gt;</button>
      </div>

      {/* RESUMO */}
      <div className="bg-gradient-to-r from-blue-900 to-gray-900 p-6 rounded-xl border border-blue-800 flex justify-between items-center">
        <div>
          <p className="text-blue-200 text-sm mb-1">Total Parcelado</p>
          <h3 className="text-3xl font-bold text-white">R$ {totalMonth.toFixed(2)}</h3>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg">
          <Plus size={24} />
        </button>
      </div>

      {/* LISTA DE COMPRAS */}
      <div className="space-y-3">
        {loading ? <p className="text-center text-gray-500">Carregando...</p> : transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <ShoppingBag className="mx-auto mb-2 opacity-20" size={48} />
            <p>Nenhuma parcela para este mês.</p>
          </div>
        ) : (
          transactions.map((t: any) => (
            <div key={t.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => handleTogglePay(t.id, t.isPaid)} className="text-gray-400 hover:text-green-500">
                    {t.isPaid ? <CheckCircle className="text-green-500" size={20} /> : <Circle size={20} />}
                  </button>

                  {/* MODO EDIÇÃO VS VISUALIZAÇÃO */}
                  {editingId === t.id ? (
                    <div className="flex flex-col gap-2 w-full mr-4">
                      <input 
                        type="text" 
                        value={editDesc} 
                        onChange={e => setEditDesc(e.target.value)}
                        className="bg-gray-800 text-white p-1 rounded border border-blue-500 text-sm"
                      />
                      <input 
                        type="number" 
                        value={editAmount} 
                        onChange={e => setEditAmount(e.target.value)}
                        className="bg-gray-800 text-white p-1 rounded border border-blue-500 text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-white">{t.description}</h4>
                      <div className="flex gap-2 text-xs text-gray-400 mt-1">
                        <span className="bg-gray-800 px-2 py-0.5 rounded">{t.category}</span>
                        <span>{format(t.date, "dd/MM")}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right flex items-center gap-3">
                  {editingId === t.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(t.id)} className="text-green-400 hover:bg-green-900/50 p-2 rounded"><Save size={18}/></button>
                      <button onClick={cancelEdit} className="text-red-400 hover:bg-red-900/50 p-2 rounded"><X size={18}/></button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-bold text-lg">R$ {t.amount.toFixed(2)}</p>
                        <p className="text-xs text-blue-400">{t.installmentCurrent} / {t.installmentTotal}</p>
                      </div>
                      <div className="flex flex-col gap-2 ml-2">
                        <button onClick={() => startEditing(t)} className="text-gray-500 hover:text-blue-400">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-gray-600 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE NOVA COMPRA (Mantido igual) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Nova Compra Parcelada</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
               {/* ... (mesmo form de antes) ... */}
               <div>
                <label className="text-sm text-gray-400">Descrição</label>
                <input required className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1" 
                  value={desc} onChange={e => setDesc(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Valor TOTAL</label>
                  <input required type="number" step="0.01" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1" 
                    value={amountTotal} onChange={e => setAmountTotal(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Parcelas</label>
                  <input required type="number" min="1" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1" 
                    value={installments} onChange={e => setInstallments(e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Categoria</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1"
                    value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Outros</option>
                    <option>Eletrônicos</option>
                    <option>Casa</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Data 1ª Parc.</label>
                  <input required type="date" className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1" 
                    value={date} onChange={e => setDate(e.target.value)} 
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4">
                Lançar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}