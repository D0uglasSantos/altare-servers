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
import jsPDF from "jspdf";

interface Servidor {
  id: string;
  nome?: string;
  funcao: string;
  idade: number;
  nomeFormatado?: string;
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

  // const formatarNomesUnicos = (servidores: Servidor[]) => {
  //   const contagem = servidores.reduce((acc, servidor) => {
  //     const primeiroNome = servidor.nome.split(" ")[0];
  //     acc[primeiroNome] = (acc[primeiroNome] || 0) + 1;
  //     return acc;
  //   }, {} as Record<string, number>);

  //   return servidores.map((servidor) => {
  //     const [primeiroNome, ...sobrenomes] = servidor.nome.split(" ");
  //     if (contagem[primeiroNome] > 1) {
  //       const ultimoSobrenome = sobrenomes[sobrenomes.length - 1];
  //       return {
  //         ...servidor,
  //         nomeFormatado: `${primeiroNome} ${ultimoSobrenome.charAt(0)}.`,
  //       };
  //     }
  //     return { ...servidor, nomeFormatado: primeiroNome };
  //   });
  // };

  const formatarNome = (
    nome: string,
    servidoresFormatados: Servidor[] = []
  ) => {
    const servidorFormatado = servidoresFormatados.find((s) => s.nome === nome);
    return servidorFormatado ? servidorFormatado.nomeFormatado : nome;
  };

  const handleGerarEscala = () => {
    if (servidores.length === 0) {
      setError("Não há servidores disponíveis para gerar a escala.");
      return;
    }

    const escala: Escala = {};
    const servidoresDisponiveis = [...servidores];

    // Primeiro, alocar servidores para missas solenes e solenes maiores
    missas.forEach(({ id: missa }) => {
      const isSolene = tipoMissa !== "dominical" && missasSolenes[missa];
      const isSoleneMaior = tipoMissa === "soleneMaior" && missasSolenes[missa];

      if (isSolene || isSoleneMaior) {
        escala[missa] = {};
        if (isSoleneMaior) {
          alocarServidoresSoleneMaior(
            escala[missa],
            servidoresDisponiveis,
            bispoPresente
          );
        } else {
          alocarServidoresSolene(escala[missa], servidoresDisponiveis);
        }
      }
    });

    // Depois, alocar servidores para missas dominicais
    missas.forEach(({ id: missa }) => {
      if (!escala[missa]) {
        escala[missa] = {};
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

  const servidorDisponivel = (
    servidoresDisponiveis: Servidor[],
    funcao: string
  ): Servidor | undefined => {
    return servidoresDisponiveis.find(
      (s) =>
        (funcao.includes("Cerimoniário") &&
          s.funcao.includes("Cerimoniário")) ||
        (!funcao.includes("Cerimoniário") && s.funcao.includes("Acólito"))
    );
  };

  const alocarServidores = (
    escalaMissa: EscalaMissa,
    servidoresDisponiveis: Servidor[],
    funcoes: string[]
  ) => {
    funcoes.forEach((funcao) => {
      const servidor = servidorDisponivel(servidoresDisponiveis, funcao);
      if (servidor) {
        escalaMissa[funcao] = {
          ...servidor,
          nome: formatarNome(servidor.nome as string),
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

  // const realocarServidoresNaoAlocados = (
  //   escala: Escala,
  //   servidoresDisponiveis: Servidor[]
  // ) => {
  //   const missasNaoSolenes = missas.filter(({ id }) => !missasSolenes[id]);

  //   Object.entries(escala).forEach(([missa, dadosMissa]) => {
  //     Object.entries(dadosMissa).forEach(([funcao, servidor]) => {
  //       if (servidor.nome === "Não alocado") {
  //         const servidorDisponivel = servidoresDisponiveis.find(
  //           (s) =>
  //             (funcao.includes("Cerimoniário") &&
  //               s.funcao.includes("Cerimoniário")) ||
  //             (!funcao.includes("Cerimoniário") && s.funcao.includes("Acólito"))
  //         );
  //         if (servidorDisponivel) {
  //           escala[missa][funcao] = {
  //             ...servidorDisponivel,
  //             nome: formatarNome(
  //               servidorDisponivel.nome,
  //               servidoresDisponiveis
  //             ),
  //           };
  //           servidoresDisponiveis.splice(
  //             servidoresDisponiveis.indexOf(servidorDisponivel),
  //             1
  //           );
  //         } else if (missasNaoSolenes.length > 0) {
  //           // Se não houver servidor disponível, tente mover um servidor de uma missa não solene
  //           for (const missaNaoSolene of missasNaoSolenes) {
  //             const servidorParaMover = Object.entries(
  //               escala[missaNaoSolene.id]
  //             ).find(
  //               ([f, s]) =>
  //                 s.nome !== "Não alocado" &&
  //                 ((funcao.includes("Cerimoniário") &&
  //                   s.funcao.includes("Cerimoniário")) ||
  //                   (!funcao.includes("Cerimoniário") &&
  //                     s.funcao.includes("Acólito")))
  //             );
  //             if (servidorParaMover) {
  //               escala[missa][funcao] = servidorParaMover[1];
  //               escala[missaNaoSolene.id][servidorParaMover[0]] = {
  //                 id: "não-alocado",
  //                 nome: "Não alocado",
  //                 funcao: "Não alocado",
  //                 idade: 0,
  //               };
  //               break;
  //             }
  //           }
  //         }
  //       }
  //     });
  //   });
  // };

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

  const exportarParaPDF = () => {
    if (!escalaGerada) return;

    const pdf = new jsPDF();
    let yOffset = 20;

    pdf.setFontSize(18);
    pdf.text("Escala de Servidores", 105, yOffset, { align: "center" });
    yOffset += 15;

    pdf.setFontSize(12);
    Object.entries(escalaGerada).forEach(([missa, dados], index) => {
      const missaLabel = missas.find((m) => m.id === missa)?.label;
      pdf.setFont("Helvetica", "bold");
      pdf.text(`${missaLabel}`, 20, yOffset);
      yOffset += 7;

      pdf.setFont("Helvetica", "normal");
      Object.entries(dados).forEach(([funcao, servidor]) => {
        pdf.text(`${funcao}: ${servidor.nome}`, 25, yOffset);
        yOffset += 7;
      });

      yOffset += 5;

      if (yOffset > 270 || index === Object.entries(escalaGerada).length - 1) {
        pdf.addPage();
        yOffset = 20;
      }
    });

    pdf.save("escala_servidores.pdf");
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
          {Object.entries(escalaGerada).map(([missa, dados]) => {
            const missaInfo = missas.find((m) => m.id === missa);
            const isSolene = tipoMissa !== "dominical" && missasSolenes[missa];
            const isSoleneMaior =
              tipoMissa === "soleneMaior" && missasSolenes[missa];
            const label =
              isSolene || isSoleneMaior
                ? `${missaInfo?.label} - ${
                    isSoleneMaior ? "Solenidade Maior" : "Solenidade"
                  }`
                : missaInfo?.label;

            return (
              <div key={missa} className="mb-4">
                <h3
                  className={`text-lg font-semibold ${
                    isSolene || isSoleneMaior ? "text-amber-400" : ""
                  }`}
                >
                  {label}
                </h3>
                {Object.entries(dados).map(([funcao, servidor]) => (
                  <p key={funcao}>
                    {funcao}: {servidor.nome}
                  </p>
                ))}
              </div>
            );
          })}
          <Button onClick={exportarParaPDF} className="mt-4">
            Exportar para PDF
          </Button>
        </Card>
      )}
    </div>
  );
}
