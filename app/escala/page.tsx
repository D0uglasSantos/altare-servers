"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";

interface Servidor {
  id: string;
  nome: string;
  funcao: string;
  idade: number;
}

interface Escala {
  acolitos: Servidor[];
  cerimoniarios: Servidor[];
}

export default function GerarEscala() {
  const [tipoMissa, setTipoMissa] = useState<string>("");
  const [missasSolenes, setMissasSolenes] = useState<{
    [key: string]: boolean;
  }>({
    sabado18h: false,
    domingo07h: false,
    domingo0830h: false,
    domingo11h: false,
    domingo18h: false,
    domingo20h: false,
  });
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [escalaGerada, setEscalaGerada] = useState<{
    [key: string]: Escala;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bispoPresente, setBispoPresente] = useState<boolean>(false);

  useEffect(() => {
    const fetchServidores = async () => {
      try {
        console.log("Iniciando busca de servidores...");
        const querySnapshot = await getDocs(collection(db, "servidores"));
        console.log(
          "Dados recebidos do Firestore:",
          querySnapshot.docs.length,
          "documentos"
        );
        const servidoresData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Servidor)
        );
        setServidores(servidoresData);
        setLoading(false);
        console.log("Servidores carregados com sucesso");
      } catch (err) {
        console.error("Erro ao buscar servidores:", err);
        setError(
          "Erro ao carregar servidores. Por favor, verifique sua conexão e tente novamente."
        );
        setLoading(false);
      }
    };

    fetchServidores();
  }, []);

  const handleGerarEscala = () => {
    if (servidores.length === 0) {
      setError("Não há servidores disponíveis para gerar a escala.");
      return;
    }

    const escala: { [key: string]: Escala } = {};
    const servidoresDisponiveis = [...servidores];

    // Definindo os horários das missas
    const horariosMissas = [
      "sabado18h",
      "domingo07h",
      "domingo0830h",
      "domingo11h",
      "domingo18h",
      "domingo20h",
    ];

    // Se o tipo de missa for dominical
    if (tipoMissa === "dominical") {
      horariosMissas.forEach((missa) => {
        escala[missa] = {
          acolitos: [],
          cerimoniarios: [],
        };

        // Selecionar Acólitos para Missas Dominicais
        for (let i = 0; i < 1; i++) {
          // 1 Acólito
          const acolito = servidoresDisponiveis.find((s) =>
            s.funcao.includes("Acólito")
          );
          if (acolito) {
            escala[missa].acolitos.push(acolito);
            servidoresDisponiveis.splice(
              servidoresDisponiveis.indexOf(acolito),
              1
            );
          }
        }

        // Selecionar Cerimoniários para Missas Dominicais
        for (let i = 0; i < 3; i++) {
          // 3 Cerimoniários
          const cerimoniario = servidoresDisponiveis.find((s) =>
            s.funcao.includes("Cerimoniário")
          );
          if (cerimoniario) {
            escala[missa].cerimoniarios.push(cerimoniario);
            servidoresDisponiveis.splice(
              servidoresDisponiveis.indexOf(cerimoniario),
              1
            );
          }
        }
      });
    } else if (tipoMissa === "solene" || tipoMissa === "soleneMaior") {
      horariosMissas.forEach((missa) => {
        if (missasSolenes[missa]) {
          escala[missa] = {
            acolitos: [],
            cerimoniarios: [],
          };

          const numAcolitos = tipoMissa === "solene" ? 2 : 4; // Acólitos para Solene ou Solene Maior
          const numCerimoniarios =
            tipoMissa === "solene" ? 4 : bispoPresente ? 9 : 7; // Cerimoniários

          // Selecionar Acólitos
          for (let i = 0; i < numAcolitos; i++) {
            const acolito = servidoresDisponiveis.find((s) =>
              s.funcao.includes("Acólito")
            );
            if (acolito) {
              escala[missa].acolitos.push(acolito);
              servidoresDisponiveis.splice(
                servidoresDisponiveis.indexOf(acolito),
                1
              );
            }
          }

          // Selecionar Cerimoniários
          for (let i = 0; i < numCerimoniarios; i++) {
            const cerimoniario = servidoresDisponiveis.find((s) =>
              s.funcao.includes("Cerimoniário")
            );
            if (cerimoniario) {
              escala[missa].cerimoniarios.push(cerimoniario);
              servidoresDisponiveis.splice(
                servidoresDisponiveis.indexOf(cerimoniario),
                1
              );
            }
          }
        }
      });

      // Para as missas que não foram selecionadas como solenes, gerar como dominicais
      horariosMissas.forEach((missa) => {
        if (!missasSolenes[missa]) {
          escala[missa] = {
            acolitos: [],
            cerimoniarios: [],
          };

          // Selecionar Acólitos para Missas Dominicais
          for (let i = 0; i < 1; i++) {
            // 1 Acólito
            const acolito = servidoresDisponiveis.find((s) =>
              s.funcao.includes("Acólito")
            );
            if (acolito) {
              escala[missa].acolitos.push(acolito);
              servidoresDisponiveis.splice(
                servidoresDisponiveis.indexOf(acolito),
                1
              );
            }
          }

          // Selecionar Cerimoniários para Missas Dominicais
          for (let i = 0; i < 3; i++) {
            // 3 Cerimoniários
            const cerimoniario = servidoresDisponiveis.find((s) =>
              s.funcao.includes("Cerimoniário")
            );
            if (cerimoniario) {
              escala[missa].cerimoniarios.push(cerimoniario);
              servidoresDisponiveis.splice(
                servidoresDisponiveis.indexOf(cerimoniario),
                1
              );
            }
          }
        }
      });
    }

    // Verifica se todas as missas têm pelo menos um servidor
    for (const missa in escala) {
      if (
        escala[missa].acolitos.length === 0 ||
        escala[missa].cerimoniarios.length === 0
      ) {
        alert(`Não há servidores suficientes para a missa ${missa}.`);
        return;
      }
    }

    setEscalaGerada(escala);
    setError(null);
  };

  const resetarEscala = () => {
    setTipoMissa("");
    setMissasSolenes({
      sabado18h: false,
      domingo07h: false,
      domingo0830h: false,
      domingo11h: false,
      domingo18h: false,
      domingo20h: false,
    });
    setEscalaGerada(null);
    setBispoPresente(false);
    setError(null);
  };

  const missas = [
    { id: "sabado18h", label: "Sábado 18h" },
    { id: "domingo07h", label: "Domingo 07h" },
    { id: "domingo0830h", label: "Domingo 08:30h" },
    { id: "domingo11h", label: "Domingo 11h" },
    { id: "domingo18h", label: "Domingo 18h" },
    { id: "domingo20h", label: "Domingo 20h" },
  ];

  if (loading) {
    return <div>Carregando servidores...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerar Escala</h1>
      {error && (
        <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>
      )}

      <Card className="p-6">
        <div>
          <Select
            id="tipoMissa"
            value={tipoMissa}
            onValueChange={(value) => setTipoMissa(value)}
            className="w-full mt-1"
          >
            <SelectTrigger className="w-max p-1">
              <SelectValue placeholder="Selecione o tipo de missa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dominical">Missas Dominicais</SelectItem>
              <SelectItem value="solene">Missas Solenes</SelectItem>
              <SelectItem value="soleneMaior">
                Missas Solenes Maiores
              </SelectItem>
            </SelectContent>
          </Select>

          {(tipoMissa === "solene" || tipoMissa === "soleneMaior") && (
            <div className="mt-4">
              <Label className="block mb-2">Selecione as missas solenes:</Label>
              {missas.map((missa) => (
                <div
                  key={missa.id}
                  className="flex items-center space-x-2 mt-2"
                >
                  <Checkbox
                    id={missa.id}
                    checked={missasSolenes[missa.id]}
                    onCheckedChange={(checked) =>
                      setMissasSolenes({
                        ...missasSolenes,
                        [missa.id]: checked,
                      })
                    }
                  />
                  <Label htmlFor={missa.id}>{missa.label}</Label>
                </div>
              ))}
            </div>
          )}

          {tipoMissa === "soleneMaior" && (
            <div className="mt-4">
              <Label className="block mb-2">Terá Bispo presente?</Label>
              <Checkbox
                id="bispoPresente"
                checked={bispoPresente}
                onCheckedChange={(checked) => setBispoPresente(checked)}
              />
              <Label htmlFor="bispoPresente">Sim</Label>
            </div>
          )}
        </div>
        <div className="w-max h-max p-1 flex items-center space-x-2 mt-4">
          <Button
            onClick={handleGerarEscala}
            disabled={
              !tipoMissa ||
              (tipoMissa !== "dominical" &&
                !Object.values(missasSolenes).some(Boolean))
            }
          >
            Gerar Escala
          </Button>
          <Button onClick={resetarEscala}>Resetar Tudo</Button>
        </div>
      </Card>

      {escalaGerada && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Escala Gerada</h2>
          {Object.entries(escalaGerada).map(([missa, dados]) => (
            <div key={missa} className="mb-4">
              <h3 className="text-lg font-semibold">
                {missas.find((m) => m.id === missa)?.label}
              </h3>
              <p>
                Acólitos:{" "}
                {dados.acolitos.map((a) => a.nome).join(", ") || "Nenhum"}
              </p>
              <p>
                Cerimoniários:{" "}
                {dados.cerimoniarios.map((c) => c.nome).join(", ") || "Nenhum"}
              </p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
