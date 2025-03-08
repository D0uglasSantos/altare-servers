"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Calendar, LogOut, UserPlus, UserCog } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import Logo from "@/public/assets/images/logo-160x100.svg";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const getRoleName = (role?: string) => {
    switch (role) {
      case "guardia":
        return "Guardias";
      case "acolitoCerimoniario":
        return "Acólitos/Cerimoniários";
      case "coroinha":
        return "Coroinhas";
      default:
        return "Servidores";
    }
  };

  if (!profile) return null;

  return (
    <>
      <div
        className={`fixed md:relative h-screen w-64 flex-col bg-card border-r-2 border-zinc-200 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-50`}
      >
        <div className="p-4">
          <div className="border-b-2 border-zinc-200 py-2">
            <Image
              src={Logo}
              alt="Logo Altare Servers"
              width={200}
              height={200}
            />
          </div>

          <div className="text-sm text-muted-foreground py-2">
            Olá, Coordenador {getRoleName(profile.role)}
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          <Link href={`/dashboard/${profile.role}`}>
            <Button
              variant={
                pathname === `/dashboard/${profile.role}`
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              {getRoleName(profile.role)}
            </Button>
          </Link>
          <Link href={`/dashboard/${profile.role}/cadastro`}>
            <Button
              variant={
                pathname === `/dashboard/${profile.role}/cadastro`
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar
            </Button>
          </Link>
          <Link href={`/dashboard/${profile.role}/gerenciar`}>
            <Button
              variant={
                pathname === `/dashboard/${profile.role}/gerenciar`
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start"
            >
              <UserCog className="mr-2 h-4 w-4" />
              Gerenciar
            </Button>
          </Link>
          <Link href={`/dashboard/${profile.role}/escalas`}>
            <Button
              variant={
                pathname === `/dashboard/${profile.role}/escalas`
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Escalas
            </Button>
          </Link>
        </nav>
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}
