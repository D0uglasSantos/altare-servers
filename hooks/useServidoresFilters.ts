"use client";

import { Servidor } from "@/types/Servidor";
import { useState, useMemo } from "react";

export function useServidoresFilters(servidores: Servidor[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFuncao, setFilterFuncao] = useState("todas");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredServidores = useMemo(() => {
    return servidores
      .filter((servidor) =>
        servidor.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((servidor) =>
        filterFuncao === "todas" ? true : servidor.funcao === filterFuncao
      )
      .sort((a, b) => {
        const nameA = a.nome.toLowerCase();
        const nameB = b.nome.toLowerCase();
        if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
        if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [servidores, searchTerm, filterFuncao, sortOrder]);

  const paginatedServidores = useMemo(() => {
    return filteredServidores.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredServidores, currentPage]);

  const totalPages = Math.ceil(filteredServidores.length / itemsPerPage);

  return {
    searchTerm,
    setSearchTerm,
    filterFuncao,
    setFilterFuncao,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    paginatedServidores,
    totalPages,
  };
}
