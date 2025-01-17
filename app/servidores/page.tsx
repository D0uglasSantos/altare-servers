"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface Servidor {
  id: string;
  nome: string;
  funcao: string;
  idade: number;
}

export default function Servidores() {
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [formData, setFormData] = useState({ nome: "", funcao: "", idade: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFuncao, setFilterFuncao] = useState("todas");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Controle de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "servidores"), (snapshot) => {
      const servidoresData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Servidor)
      );
      setServidores(servidoresData);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, "servidores", editingId), formData);
    } else {
      await addDoc(collection(db, "servidores"), formData);
    }
    setFormData({ nome: "", funcao: "", idade: "" });
    setEditingId(null);
  };

  const handleEdit = (servidor: Servidor) => {
    setFormData({
      nome: servidor.nome,
      funcao: servidor.funcao,
      idade: servidor.idade.toString(),
    });
    setEditingId(servidor.id);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDoc(doc(db, "servidores", deleteId));
      setDeleteId(null);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  // Filtro, ordenação e paginação
  const filteredServidores = servidores
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

  const paginatedServidores = filteredServidores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredServidores.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Servidores</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="nome"
          placeholder="Nome"
          value={formData.nome}
          onChange={handleInputChange}
        />
        <Input
          name="funcao"
          placeholder="Função"
          value={formData.funcao}
          onChange={handleInputChange}
        />
        <Input
          name="idade"
          placeholder="Idade"
          type="number"
          value={formData.idade}
          onChange={handleInputChange}
        />
        <Button type="submit">
          {editingId ? "Atualizar" : "Adicionar"} Servidor
        </Button>
      </form>
      <div className="flex items-center justify-between gap-4">
        {/* Filtro por nome */}
        <Input
          placeholder="Pesquisar por nome"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filtro por função */}
        <Select onValueChange={(value) => setFilterFuncao(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="Acólito">Acólito</SelectItem>
            <SelectItem value="Cerimoniário">Cerimoniário</SelectItem>
          </SelectContent>
        </Select>

        {/* Ordenação por nome */}
        <Select
          onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ordem alfabética" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Crescente</SelectItem>
            <SelectItem value="desc">Decrescente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela com paginação */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Idade</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedServidores.map((servidor) => (
            <TableRow key={servidor.id}>
              <TableCell>{servidor.nome}</TableCell>
              <TableCell>{servidor.funcao}</TableCell>
              <TableCell>{servidor.idade}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(servidor)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(servidor.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginação */}
      <div className="flex justify- gap-4">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Anterior
        </Button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Próxima
        </Button>
      </div>

      {/* Diálogo de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação</DialogTitle>
          </DialogHeader>
          <p>Você tem certeza que deseja excluir este servidor?</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
