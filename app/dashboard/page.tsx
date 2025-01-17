"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Card } from "../../components/ui/card";
import { BarChart, PieChart } from "../../components/Charts";

interface Servidor {
  id: string;
  nome: string;
  funcao: string;
  idade: number;
}

export default function Dashboard() {
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

  const totalServidores = servidores.length;
  const totalAcolitos = servidores.filter((s) => s.funcao === "Acólito").length;
  const totalCerimoniarios = servidores.filter(
    (s) => s.funcao === "Cerimoniário"
  ).length;

  const distribuicaoPorFuncao = [
    { name: "Acólitos", value: totalAcolitos },
    { name: "Cerimoniários", value: totalCerimoniarios },
  ];

  const faixasEtarias = [
    {
      name: "10-15",
      value: servidores.filter((s) => s.idade >= 10 && s.idade <= 15).length,
    },
    {
      name: "16-20",
      value: servidores.filter((s) => s.idade >= 16 && s.idade <= 20).length,
    },
    {
      name: "21-25",
      value: servidores.filter((s) => s.idade >= 21 && s.idade <= 25).length,
    },
    {
      name: "26-30",
      value: servidores.filter((s) => s.idade >= 26 && s.idade <= 30).length,
    },
    { name: "31+", value: servidores.filter((s) => s.idade > 30).length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Total de Servidores</h2>
          <p className="text-4xl font-bold text-gray-400">{totalServidores}</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Acólitos</h2>
          <p className="text-4xl font-bold text-gray-400">{totalAcolitos}</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Cerimoniários</h2>
          <p className="text-4xl font-bold text-gray-400">
            {totalCerimoniarios}
          </p>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Distribuição por Função
          </h2>
          <PieChart data={distribuicaoPorFuncao} />
        </Card>
        <Card className="p-6 h-max">
          <h2 className="text-xl font-semibold mb-4">Variação de Idades</h2>
          <BarChart data={faixasEtarias} />
        </Card>
      </div>
    </div>
  );
}
