"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { useAuth } from "@/lib/auth-context";
import { ChevronLeft, Lock, Mail } from "lucide-react";
import logo from "@/public/assets/images/logo-160x100.svg";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "";
  const { signIn, profile, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTitle = () => {
      switch (type) {
        case "guardia":
          return "Coordenador de Guardias";
        case "acolitoCerimoniario":
          return "Coordenador de Acólitos/Cerimoniários";
        case "coroinha":
          return "Coordenador de Coroinhas";
        default:
          return "Coordenador";
      }
    };

    if (!loading && profile) {
      if (type && profile.role !== type) {
        setError(`Você não tem permissão para acessar como ${getTitle()}`);
        return;
      }
      router.push(`/dashboard/${profile.role}`);
    }
  }, [loading, profile, router, type]);

  const getTitle = () => {
    switch (type) {
      case "guardia":
        return "Coordenador de Guardias";
      case "acolitoCerimoniario":
        return "Coordenador de Acólitos/Cerimoniários";
      case "coroinha":
        return "Coordenador de Coroinhas";
      default:
        return "Coordenador";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      setError("Erro ao fazer login");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium text-muted-foreground">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="relative hidden flex-1 bg-gradient-to-br from-primary to-primary/80 md:flex">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=800')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-white">
          <div className="mb-2 flex items-center justify-center">
            <Image
              src={logo}
              alt="Logo do App"
              width={200}
              height={200}
              className="rounded-xl"
            />
          </div>
          <p className="text-center text-xl opacity-90">
            Sistema de gerenciamento para coordenadores de liturgia
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center md:hidden">
            <Image
              src={logo}
              alt="Logo do App"
              width={250}
              height={250}
              className="rounded-xl"
            />
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Bem-vindo</CardTitle>
                <Link
                  href="/"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Voltar
                </Link>
              </div>
              <CardDescription className="text-base">
                {type
                  ? `Entre como ${getTitle()}`
                  : "Entre com suas credenciais para acessar o sistema"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <div className="animate-fadeIn rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pb-6">
                <Button
                  type="submit"
                  className="w-full py-6 text-base transition-all hover:shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Entrando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
