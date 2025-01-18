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

interface EscalaMissa {
  [funcao: string]: Servidor;
}

interface Escala {
  [missa: string]: EscalaMissa;
}

const missas = [
  { id: "sabado18h", label: "Sábado 18h" },
  { id: "domingo07h", label: "Domingo 07h" },
  { id: "domingo0830h", label: "Domingo 08:30h" },
  { id: "domingo11h", label: "Domingo 11h" },
  { id: "domingo18h", label: "Domingo 18h" },
  { id: "domingo20h", label: "Domingo 20h" },
];

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
  const [escalaGerada, setEscalaGerada] = useState<Escala | null>(null);
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

    const escala: Escala = {};
    const servidoresDisponiveis = [...servidores];

    missas.forEach(({ id: missa }) => {
      const isSolene = tipoMissa !== "dominical" && missasSolenes[missa];
      const isSoleneMaior = tipoMissa === "soleneMaior" && missasSolenes[missa];

      escala[missa] = {};

      if (isSoleneMaior) {
        alocarServidoresSoleneMaior(
          escala[missa],
          servidoresDisponiveis,
          bispoPresente
        );
      } else if (isSolene) {
        alocarServidoresSolene(escala[missa], servidoresDisponiveis);
      } else {
        alocarServidoresDominical(escala[missa], servidoresDisponiveis);
      }
    });

    setEscalaGerada(escala);
    setError(null);
  };

  const alocarServidoresDominical = (
    escalaMissa: EscalaMissa,
    servidoresDisponiveis: Servidor[]
  ) => {
    const funcoes = [
      "Librífero/Cruciferário",
      "Cerimoniário Geral",
      "Cerimoniário Palavra",
      "Cerimoniário Credência",
    ];
    alocarServidores(escalaMissa, servidoresDisponiveis, funcoes);
  };

  const alocarServidoresSolene = (
    escalaMissa: EscalaMissa,
    servidoresDisponiveis: Servidor[]
  ) => {
    const funcoes = [
      "Librífero/Cruciferário",
      "Naveteiro",
      "Cerimoniário Geral",
      "Cerimoniário Palavra",
      "Cerimoniário Credência",
      "Turiferário",
    ];
    alocarServidores(escalaMissa, servidoresDisponiveis, funcoes);
  };

  const alocarServidoresSoleneMaior = (
    escalaMissa: EscalaMissa,
    servidoresDisponiveis: Servidor[],
    bispoPresente: boolean
  ) => {
    const funcoes = [
      "Librífero/Cruciferário",
      "Naveteiro",
      "Ceroferário 1",
      "Ceroferário 2",
      "Cerimoniário Geral 1",
      "Cerimoniário Geral 2",
      "Cerimoniário Palavra 1",
      "Cerimoniário Palavra 2",
      "Cerimoniário Credência 1",
      "Cerimoniário Credência 2",
      "Turiferário",
    ];
    if (bispoPresente) {
      funcoes.push("Báculífero", "Mitrífero");
    }
    alocarServidores(escalaMissa, servidoresDisponiveis, funcoes);
  };

  const formatarNome = (nome: string) => {
    const [primeiroNome, ...sobrenomes] = nome.split(" ");
    const ultimoSobrenome = sobrenomes[sobrenomes.length - 1];
    return `${primeiroNome} ${ultimoSobrenome.charAt(0)}.`;
  };

  const alocarServidores = (
    escalaMissa: EscalaMissa,
    servidoresDisponiveis: Servidor[],
    funcoes: string[]
  ) => {
    funcoes.forEach((funcao) => {
      const servidor = servidoresDisponiveis.find(
        (s) =>
          (funcao.includes("Cerimoniário") &&
            s.funcao.includes("Cerimoniário")) ||
          (!funcao.includes("Cerimoniário") && s.funcao.includes("Acólito"))
      );
      if (servidor) {
        escalaMissa[funcao] = {
          ...servidor,
          nome: formatarNome(servidor.nome),
        };
        servidoresDisponiveis.splice(
          servidoresDisponiveis.indexOf(servidor),
          1
        );
      } else {
        escalaMissa[funcao] = {
          id: "não-alocado",
          nome: "Não alocado",
          funcao: "Não alocado",
          idade: 0,
        };
      }
    });
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
          <Label htmlFor="tipoMissa">Tipo de Missa:</Label>
          <Select
            value={tipoMissa}
            onValueChange={(value) => setTipoMissa(value)}
          >
            <SelectTrigger className="w-full mt-1">
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
                        [missa.id]: checked as boolean,
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
                onCheckedChange={(checked) =>
                  setBispoPresente(checked as boolean)
                }
              />
              <Label htmlFor="bispoPresente">Sim</Label>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-4">
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
              {Object.entries(dados).map(([funcao, servidor]) => (
                <p key={funcao}>
                  {funcao}: {servidor.nome}
                </p>
              ))}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
