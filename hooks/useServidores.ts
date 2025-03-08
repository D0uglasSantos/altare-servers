"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import toast from "react-hot-toast";
import { Servidor } from "@/types/Servidor";

export function useServidores() {
  const [servidores, setServidores] = useState<Servidor[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "servidores"), (snapshot) => {
      const servidoresData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Servidor)
      );
      setServidores(servidoresData);
    });

    return () => unsubscribe();
  }, []);

  const addServidor = async (formData: Omit<Servidor, "id">) => {
    try {
      await addDoc(collection(db, "servidores"), formData);
      toast.success("Servidor adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar servidor:", error);
      toast.error("Ocorreu um erro ao adicionar o servidor.");
    }
  };

  const updateServidor = async (id: string, formData: Omit<Servidor, "id">) => {
    try {
      await updateDoc(doc(db, "servidores", id), formData);
      toast.success("Servidor atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar servidor:", error);
      toast.error("Ocorreu um erro ao atualizar o servidor.");
    }
  };

  const deleteServidor = async (id: string) => {
    try {
      await deleteDoc(doc(db, "servidores", id));
      toast.success("Servidor excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir servidor:", error);
      toast.error("Ocorreu um erro ao excluir o servidor.");
    }
  };

  return { servidores, addServidor, updateServidor, deleteServidor };
}
