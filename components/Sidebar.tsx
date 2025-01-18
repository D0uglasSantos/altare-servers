"use client"

import Link from "next/link";
import { Home, BarChart2, Users, Calendar, Menu, X } from 'lucide-react';
import { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        className="md:hidden fixed top-2 right-3 z-20 p-2 bg-primary text-background rounded"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      <aside
        className={`bg-primary text-background w-64 min-h-screen p-4 fixed md:static transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } z-30`}
      >
        <div className="text-2xl font-bold mb-8 text-secondary">
          Altare Servers
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
                onClick={() => setIsOpen(false)}
              >
                <BarChart2 className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/servidores"
                className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
                onClick={() => setIsOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Servidores</span>
              </Link>
            </li>
            <li>
              <Link
                href="/escala"
                className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
                onClick={() => setIsOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <span>Gerar Escala</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

