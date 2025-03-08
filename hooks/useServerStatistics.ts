import type { Servidor } from "@/types/Servidor";

export function useServerStatistics(servidores: Servidor[] = []) {
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

  return {
    totalServidores,
    totalAcolitos,
    totalCerimoniarios,
    distribuicaoPorFuncao,
    faixasEtarias,
  };
}
