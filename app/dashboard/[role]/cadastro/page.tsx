"use client";

import type React from "react";

import { useState } from "react";
import { useParams } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/auth-guard";

interface DataToSubmit {
  nome: string;
  ativo: boolean;
  tipo: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataCadastro: any;
  criadoPor?: string;
  dataNascimento?: string;
  funcao?: string;
}

export default function CadastroPage() {
  const params = useParams();
  const role = params.role as string;
  const { profile } = useAuth();

  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    ativo: true,
  });


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, ativo: checked }));
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "guardia":
        return "Guardia";
      case "acolitoCerimoniario":
        return "Acólito/Cerimoniário";
      case "coroinha":
        return "Coroinha";
      default:
        return "Servidor";
    }
  };

  const calculateServidorType = (birthDate: string) => {
    const age = calculateAge(birthDate);
    if (age >= 14 && age < 16) return "acólito";
    if (age >= 16) return "cerimoniário";
    return "muito_jovem";
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const dataToSubmit: DataToSubmit = {
        nome: formData.nome,
        ativo: formData.ativo,
        tipo: role,
        dataCadastro: serverTimestamp(),
        criadoPor: profile?.uid,
      };
    

      if (role === "acolitoCerimoniario") {
        dataToSubmit.dataNascimento = formData.dataNascimento;
        dataToSubmit.funcao = calculateServidorType(formData.dataNascimento);
      }

      await addDoc(collection(db, "servidores"), dataToSubmit);

      setSuccess(true);
      setFormData({
        nome: "",
        dataNascimento: "",
        ativo: true,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Erro ao cadastrar servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!profile || profile.role !== role) {
    return null;
  }

  return (
    <AuthGuard allowedRoles={[role]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Cadastrar {getRoleName(role)}</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Novo {getRoleName(role)}</CardTitle>
              <CardDescription>
                Preencha os dados para cadastrar um novo{" "}
                {getRoleName(role).toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              {role === "acolitoCerimoniario" && (
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="ativo">Ativo para escalas</Label>
              </div>

              {error && (
                <div className="rounded bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded bg-green-100 p-3 text-sm text-green-800">
                  {getRoleName(role)} cadastrado com sucesso!
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthGuard>
  );
}
