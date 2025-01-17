import { Card } from "../components/ui/card";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Bem-vindo ao <span className="text-amber-400 uppercase font-extrabold">Altare Servers</span>
      </h1>
      <p className="text-lg">
        Sistema de administração para servidores do altar
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Servidores</h2>
          <p>Gerencie os servidores do altar</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Escala</h2>
          <p>Gere e gerencie as escalas semanais</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Estatísticas</h2>
          <p>Visualize dados e estatísticas dos servidores</p>
        </Card>
      </div>
    </div>
  );
}
