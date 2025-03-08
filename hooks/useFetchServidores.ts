"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Servidor } from "@/types/Servidor";

export function useFetchServidores() {
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServidores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "servidores"));
        const servidoresData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Servidor)
        );
        setServidores(servidoresData);
      } catch (error) {
        setError("Erro ao carregar servidores. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchServidores();
  }, []);

  return { servidores, loading, error };
}
