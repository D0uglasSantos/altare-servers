"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/auth-guard";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type ServidorEscalado = {
  id: string;
  nome: string;
  funcao: string;
};

type Servidor = {
  id: string;
  nome: string;
  tipo: string;
  funcao?: string;
};

type MissaConfig = {
  dia: string;
  hora: string;
  descricao: string;
};

type EscalaGerada = {
  id: string;
  data: string;
  hora: string;
  descricao: string;
  servidores: ServidorEscalado[];
};

const MISSAS_CONFIG: MissaConfig[] = [
  { dia: "Sábado", hora: "18:00", descricao: "Missa de Sábado" },
  { dia: "Domingo", hora: "07:00", descricao: "Missa de Domingo" },
  { dia: "Domingo", hora: "08:30", descricao: "Missa de Domingo" },
  { dia: "Domingo", hora: "11:00", descricao: "Missa de Domingo" },
  { dia: "Domingo", hora: "18:00", descricao: "Missa de Domingo" },
  { dia: "Domingo", hora: "20:00", descricao: "Missa de Domingo" },
];

// Funções específicas para cerimoniários
const FUNCOES_CERIMONIARIOS = [
  "Cerimoniário Geral",
  "Cerimoniário da Palavra",
  "Cerimoniário da Credência",
];

// Funções específicas para acólitos
const FUNCOES_ACOLITOS = ["Librífero"];

export default function EscalasPage() {
  const params = useParams();
  const role = params.role as string;
  const { profile } = useAuth();
  const escalaPdfRef = useRef<HTMLDivElement>(null);

  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [baixandoPdf, setBaixandoPdf] = useState(false);
  const [escalasGeradas, setEscalasGeradas] = useState<EscalaGerada[]>([]);

  const fetchServidores = useCallback(async () => {
    if (!role) return;
  
    setLoading(true);
    try {
      const q = query(collection(db, "servidores"), where("ativo", "==", true));
      const querySnapshot = await getDocs(q);
      const servidoresData: Servidor[] = [];
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        servidoresData.push({
          id: doc.id,
          nome: data.nome,
          tipo: data.tipo,
          funcao: data.funcao,
        });
      });
  
      setServidores(servidoresData);
    } catch (error) {
      console.error("Erro ao buscar servidores:", error);
      toast({
        title: "Erro ao buscar servidores",
        description: "Ocorreu um erro ao buscar os servidores. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [role]); // Adicione role como dependência
  
  useEffect(() => {
    fetchServidores();
  }, [fetchServidores]);

  const gerarEscalas = () => {
    console.log("Função gerarEscalas iniciada");
    setGerando(true);

    try {
      // Verificar se há servidores carregados
      if (servidores.length === 0) {
        console.log("Nenhum servidor encontrado");
        toast({
          title: "Nenhum servidor encontrado",
          description: "Não há servidores ativos cadastrados no sistema.",
          variant: "destructive",
        });
        setGerando(false);
        return;
      }

      // Filtrar cerimoniários e acólitos baseado na função
      // Cerimoniários são aqueles que têm "cerimoniário" na função
      const cerimoniarios = servidores.filter((s) =>
        s.funcao?.toLowerCase().includes("cerimoniário")
      );

      // Acólitos são aqueles que NÃO têm "cerimoniário" na função
      const acolitos = servidores.filter(
        (s) => !s.funcao?.toLowerCase().includes("cerimoniário")
      );

      console.log("Cerimoniários encontrados:", cerimoniarios);
      console.log("Acólitos encontrados:", acolitos);

      // Verificar se há pelo menos alguns servidores
      if (cerimoniarios.length === 0) {
        console.log("Nenhum cerimoniário encontrado");
        toast({
          title: "Nenhum cerimoniário encontrado",
          description:
            "É necessário ter pelo menos um cerimoniário ativo cadastrado.",
          variant: "destructive",
        });
        setGerando(false);
        return;
      }

      // Embaralhar os servidores para distribuição aleatória
      const cerimoniariosShuffle = [...cerimoniarios].sort(
        () => Math.random() - 0.5
      );
      const acolitosShuffle = [...acolitos].sort(() => Math.random() - 0.5);

      // Usar a data atual como base
      const dataAtual = new Date();
      // Encontrar o próximo sábado
      const diasParaSabado = (6 - dataAtual.getDay() + 7) % 7;
      const proximoSabado = new Date(dataAtual);
      proximoSabado.setDate(dataAtual.getDate() + diasParaSabado);

      const novasEscalas: EscalaGerada[] = [];
      let cerimoniarioIndex = 0;
      let acolitoIndex = 0;

      MISSAS_CONFIG.forEach((missa, index) => {
        const dataMissa = new Date(proximoSabado);
        if (missa.dia === "Domingo") {
          dataMissa.setDate(dataMissa.getDate() + 1);
        }

        const servidoresEscalados: ServidorEscalado[] = [];

        // Adicionar até 3 cerimoniários com funções específicas (se houver disponíveis)
        const numCerimoniarios = Math.min(3, cerimoniariosShuffle.length);
        for (let i = 0; i < numCerimoniarios; i++) {
          if (cerimoniarioIndex >= cerimoniariosShuffle.length) {
            cerimoniarioIndex = 0;
          }

          const cerimoniario = cerimoniariosShuffle[cerimoniarioIndex];
          servidoresEscalados.push({
            id: cerimoniario.id,
            nome: cerimoniario.nome,
            funcao: FUNCOES_CERIMONIARIOS[i],
          });
          cerimoniarioIndex++;
        }

        // Adicionar 1 acólito como Librífero, exceto na missa das 20h
        if (missa.hora !== "20:00" && acolitosShuffle.length > 0) {
          if (acolitoIndex >= acolitosShuffle.length) {
            acolitoIndex = 0;
          }

          const acolito = acolitosShuffle[acolitoIndex];
          servidoresEscalados.push({
            id: acolito.id,
            nome: acolito.nome,
            funcao: FUNCOES_ACOLITOS[0],
          });
          acolitoIndex++;
        }

        console.log(
          `Servidores escalados para ${missa.descricao}:`,
          servidoresEscalados
        );

        novasEscalas.push({
          id: `temp-${index}`,
          data: dataMissa.toISOString().split("T")[0],
          hora: missa.hora,
          descricao: missa.descricao,
          servidores: servidoresEscalados,
        });
      });

      console.log("Escalas geradas:", novasEscalas);
      setEscalasGeradas(novasEscalas);
      toast({
        title: "Escalas geradas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar escalas:", error);
      toast({
        title: "Erro ao gerar escalas",
        description: "Ocorreu um erro ao gerar as escalas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGerando(false);
    }
  };

  const limparEscalasGeradas = () => {
    setEscalasGeradas([]);
    toast({
      title: "Escalas limpas",
    });
  };

  const baixarPDF = async () => {
    if (!escalaPdfRef.current) return;

    setBaixandoPdf(true);
    try {
      const canvas = await html2canvas(escalaPdfRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Escala_Missas_${new Date().toISOString().split("T")[0]}.pdf`);

      toast({
        title: "PDF baixado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setBaixandoPdf(false);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!profile || profile.role !== role) {
    return null;
  }

  return (
    <AuthGuard allowedRoles={[role]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gerador de Escalas</h1>

        <Card>
          <CardHeader>
            <CardTitle>Gerar Escala de Missas</CardTitle>
            <CardDescription>
              Clique no botão abaixo para gerar automaticamente uma escala para
              o próximo final de semana. Serão distribuídos 3 cerimoniários por
              missa e 1 acólito (exceto na missa das 20h).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4 flex items-center justify-center">
                {escalasGeradas.length === 0 ? (
                  <Button
                    onClick={gerarEscalas}
                    disabled={gerando}
                    size="lg"
                    className="w-max rounded-xl"
                  >
                    {gerando ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Gerando Escala...
                      </>
                    ) : (
                      "Gerar Escala"
                    )}
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={limparEscalasGeradas}
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Limpar e Gerar Nova
                    </Button>

                    <Button
                      variant="outline"
                      onClick={baixarPDF}
                      disabled={baixandoPdf}
                      className="flex-1"
                    >
                      {baixandoPdf ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando PDF...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Baixar PDF
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {escalasGeradas.length > 0 && (
          <div ref={escalaPdfRef} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center mb-6">
              Escala de Missas
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {escalasGeradas.map((escala) => (
                <Card key={escala.id} className="border-2">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg">
                      {escala.descricao}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {formatarData(escala.data)} às {escala.hora}
                    </p>
                    <div className="mt-3">
                      <h4 className="font-semibold mb-1">Servidores:</h4>
                      {escala.servidores && escala.servidores.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {escala.servidores.map((servidor, index) => (
                            <li key={`${servidor.id}-${index}`}>
                              <span className="font-medium">
                                {servidor.funcao}:
                              </span>{" "}
                              {servidor.nome}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">
                          Nenhum servidor escalado
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
