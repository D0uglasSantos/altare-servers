import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import logo from "@/public/assets/images/logo-160x100.svg"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between">
          <div className="mb-2 flex items-center justify-center">
            <Image
              src={logo}
              alt="Logo do App"
              width={100}
              height={100}
              className="rounded-xl"
            />
          </div>
          <Link href="/login">
            <Button variant="secondary">Entrar</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Coordenadores de Guardias</CardTitle>
                <CardDescription>
                  Gerenciamento de guardias e suas escalas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Acesso ao cadastro, edição e escalas dos guardias da paróquia.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/login?type=guardia" className="w-full">
                  <Button className="w-full">
                    Acessar como Coordenador de Guardias
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Coordenadores de Acólitos/Cerimoniários</CardTitle>
                <CardDescription>
                  Gerenciamento de acólitos, cerimoniários e suas escalas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Acesso ao cadastro, edição e escalas dos acólitos e
                  cerimoniários da paróquia.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/login?type=acolitoCerimoniario" className="w-full">
                  <Button className="w-full">
                    Acessar como Coordenador de Acólitos
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Coordenadores de Coroinhas</CardTitle>
                <CardDescription>
                  Gerenciamento de coroinhas e suas escalas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Acesso ao cadastro, edição e escalas dos coroinhas da
                  paróquia.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/login?type=coroinha" className="w-full">
                  <Button className="w-full">
                    Acessar como Coordenador de Coroinhas
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
      <footer className="bg-muted px-4 py-6 text-muted-foreground">
        <div className="container mx-auto text-center">
          <p>
            © {new Date().getFullYear()} Sistema Altare Servers. Todos os
            direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
