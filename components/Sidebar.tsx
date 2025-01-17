import Link from "next/link";
import { Home, BarChart2, Users, Calendar } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="bg-primary text-background w-64 min-h-screen p-4">
      <div className="text-2xl font-bold mb-8 text-secondary">
        Altare Servers
      </div>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/"
              className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
            >
              <BarChart2 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/servidores"
              className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
            >
              <Users className="h-5 w-5" />
              <span>Servidores</span>
            </Link>
          </li>
          <li>
            <Link
              href="/escala"
              className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
            >
              <Calendar className="h-5 w-5" />
              <span>Gerar Escala</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
