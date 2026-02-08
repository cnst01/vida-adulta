// src/types/finance.ts

/**
 * 1. ENUMS E TIPOS BÁSICOS
 */
export type TransactionType = 'FIXED' | 'INSTALLMENT' | 'VARIABLE';

/**
 * 2. INTERFACE BASE
 * (Campos comuns a todas as transações)
 */
export interface BaseTransaction {
  id: string;
  householdId: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  type: TransactionType;
  userId: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt?: Date | null;
}

/**
 * 3. TRANSAÇÕES ESPECÍFICAS
 */

// Custo Fixo (Aluguel, Luz)
export interface FixedCostTransaction extends BaseTransaction {
  type: 'FIXED';
}

// Compras Parceladas (TV, Carro)
export interface InstallmentTransaction extends BaseTransaction {
  type: 'INSTALLMENT';
  purchaseGroupId: string; // ID do grupo de parcelas
  installmentCurrent: number; // 1
  installmentTotal: number;   // 10
  totalPurchaseAmount: number; // Valor total da compra
}

// Gastos Variáveis (Uber, iFood)
export interface VariableTransaction extends BaseTransaction {
  type: 'VARIABLE';
  budgetId?: string;
}

/**
 * 4. TIPO UNIÃO (Transaction)
 * Este é o tipo principal usado nas listas
 */
export type Transaction = FixedCostTransaction | InstallmentTransaction | VariableTransaction;

/**
 * 5. ENTIDADES DO SISTEMA (Household, Budget, User)
 */

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  createdAt: any; // Aceita Date ou Timestamp do Firestore
  settings: {
    monthlyIncome: number;
    closingDay: number;
  };
}

export interface Budget {
  id: string;
  householdId: string;
  category: string;
  limit: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  householdId: string | null;
}