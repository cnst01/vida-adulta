// src/services/householdService.ts
import { db } from "@/lib/firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion 
} from "firebase/firestore";
import { Household } from "@/types/finance"; // Certifique-se de ter criado os tipos antes, ou use 'any' por enquanto se esqueceu
import { v4 as uuidv4 } from 'uuid';

export const createHousehold = async (userId: string, userName: string, income: number) => {
  const householdId = uuidv4();
  
  const newHousehold = {
    id: householdId,
    name: `Família de ${userName}`,
    ownerId: userId,
    memberIds: [userId],
    createdAt: new Date(),
    settings: {
      monthlyIncome: income,
      closingDay: 10 // Padrão, depois muda
    }
  };

  // 1. Cria o documento da família
  await setDoc(doc(db, "households", householdId), newHousehold);

  // 2. Atualiza o usuário para dizer que ele pertence a essa família
  // Nota: Estamos criando/atualizando um doc na coleção 'users' para manter o vínculo
  await setDoc(doc(db, "users", userId), {
    householdId: householdId,
    email: userName // ou email real se tiver acesso
  }, { merge: true });

  return newHousehold;
};

export const getHousehold = async (householdId: string) => {
  const docRef = doc(db, "households", householdId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as any : null; // Cast simples
};

export const updateHouseholdSettings = async (householdId: string, settings: { monthlyIncome: number, closingDay: number }) => {
  const docRef = doc(db, "households", householdId);
  await updateDoc(docRef, {
    "settings.monthlyIncome": settings.monthlyIncome,
    "settings.closingDay": settings.closingDay
  });
};

// Função para sua esposa entrar na família depois
export const joinHousehold = async (userId: string, householdIdToJoin: string) => {
  const householdRef = doc(db, "households", householdIdToJoin);
  
  // Adiciona o ID dela na lista de membros
  await updateDoc(householdRef, {
    memberIds: arrayUnion(userId)
  });

  // Atualiza o perfil dela com o ID da família
  await setDoc(doc(db, "users", userId), {
    householdId: householdIdToJoin
  }, { merge: true });
};