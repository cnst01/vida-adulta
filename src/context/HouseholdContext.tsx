// src/context/HouseholdContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface HouseholdContextType {
  household: any | null; // Usando any por agilidade no MVP, ideal seria a interface Household
  loadingHousehold: boolean;
  refreshHousehold: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextType>({} as HouseholdContextType);

export const HouseholdProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [household, setHousehold] = useState<any | null>(null);
  const [loadingHousehold, setLoadingHousehold] = useState(true);

  const fetchHousehold = async () => {
    if (!user) return;
    
    try {
      // 1. Busca dados do User para pegar o householdId
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists() && userDoc.data().householdId) {
        const householdId = userDoc.data().householdId;
        
        // 2. Busca dados da Família
        const householdDoc = await getDoc(doc(db, "households", householdId));
        if (householdDoc.exists()) {
          setHousehold(householdDoc.data());
        }
      } else {
        setHousehold(null); // Usuário ainda não tem família
      }
    } catch (error) {
      console.error("Erro ao buscar família:", error);
    } finally {
      setLoadingHousehold(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHousehold();
    } else {
      setLoadingHousehold(false);
    }
  }, [user]);

  return (
    <HouseholdContext.Provider value={{ household, loadingHousehold, refreshHousehold: fetchHousehold }}>
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = () => useContext(HouseholdContext);