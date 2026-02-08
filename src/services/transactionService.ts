// src/services/transactionService.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  writeBatch, 
  addDoc,
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc
} from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { InstallmentTransaction, TransactionType, Transaction } from "@/types/finance"; 

/**
 * 1. CRIAR COMPRA PARCELADA (Gera N documentos)
 */
export const createInstallmentPurchase = async (
  userId: string,
  householdId: string,
  data: {
    description: string;
    amountTotal: number;
    installments: number; // Ex: 10
    startDate: Date;      // Data da primeira parcela
    category: string;
  }
) => {
  if (!householdId) throw new Error("Household ID é obrigatório");

  const batch = writeBatch(db);
  const groupId = uuidv4();
  // Divide o valor total pelo número de parcelas
  const amountPerInstallment = data.amountTotal / data.installments;

  for (let i = 0; i < data.installments; i++) {
    const docRef = doc(collection(db, "transactions"));
    
    // Calcula o mês correto: Data Inicial + i meses
    const dueDate = addMonths(data.startDate, i);

    const transactionData: InstallmentTransaction = {
      id: docRef.id,
      householdId: householdId,
      description: `${data.description} (${i + 1}/${data.installments})`,
      amount: amountPerInstallment,
      date: dueDate, 
      category: data.category,
      type: 'INSTALLMENT',
      purchaseGroupId: groupId,
      installmentCurrent: i + 1,
      installmentTotal: data.installments,
      totalPurchaseAmount: data.amountTotal,
      userId: userId,
      createdAt: new Date(),
      isPaid: false // Adicionado para evitar erro de tipo na listagem
    } as any; // Cast 'any' aqui pois o tipo BaseTransaction pede paidAt opcional

    batch.set(docRef, transactionData);
  }

  await batch.commit();
};

/**
 * 2. ADICIONAR TRANSAÇÃO SIMPLES (Fixo ou Variável)
 */
export const addSimpleTransaction = async (
  userId: string,
  householdId: string,
  data: {
    description: string;
    amount: number;
    date: Date;
    category: string;
    type: TransactionType;
  }
) => {
  await addDoc(collection(db, "transactions"), {
    ...data,
    householdId,
    userId,
    isPaid: false,
    createdAt: new Date()
  });
};

/**
 * 3. BUSCAR TRANSAÇÕES DO MÊS
 */
export const getMonthlyTransactions = async (
  householdId: string, 
  dateReference: Date
) => {
  const start = startOfMonth(dateReference);
  const end = endOfMonth(dateReference);

  const q = query(
    collection(db, "transactions"),
    where("householdId", "==", householdId),
    where("date", ">=", start),
    where("date", "<=", end)
  );

  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate() // Converte Timestamp do Firestore para Date do JS
    };
  }) as Transaction[];
};

/**
 * 4. MARCAR COMO PAGO/NÃO PAGO
 */
export const toggleTransactionStatus = async (transactionId: string, currentStatus: boolean) => {
  const ref = doc(db, "transactions", transactionId);
  await updateDoc(ref, {
    isPaid: !currentStatus,
    paidAt: !currentStatus ? new Date() : null
  });
};

/**
 * 5. DELETAR TRANSAÇÃO
 */
export const deleteTransaction = async (transactionId: string) => {
  await deleteDoc(doc(db, "transactions", transactionId));
};