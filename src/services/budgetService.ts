// src/services/budgetService.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc
} from "firebase/firestore";

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

// Criar ou Atualizar uma Cota
export const setBudgetLimit = async (householdId: string, category: string, limit: number) => {
  // Usamos a categoria + householdId para gerar um ID único (evita duplicatas)
  // Ex: "household123_Uber"
  const docId = `${householdId}_${category.replace(/\s+/g, '_').toLowerCase()}`;
  
  await setDoc(doc(db, "budgets", docId), {
    householdId,
    category,
    limit
  });
};

// Buscar todas as cotas da família
export const getBudgets = async (householdId: string) => {
  const q = query(
    collection(db, "budgets"),
    where("householdId", "==", householdId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Budget[];
};

// Deletar uma cota
export const deleteBudget = async (budgetId: string) => {
  await deleteDoc(doc(db, "budgets", budgetId));
};