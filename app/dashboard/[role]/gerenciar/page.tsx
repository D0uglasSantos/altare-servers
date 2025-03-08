"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import AuthGuard from "@/components/auth-guard"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Servidor = {
  id: string
  nome: string
  dataNascimento?: string
  ativo: boolean
}

export default function GerenciarServidoresPage() {
  const params = useParams()
  const role = params.role as string
  const router = useRouter()
  const { profile } = useAuth()

  const [servidores, setServidores] = useState<Servidor[]>([])
  const [filteredServidores, setFilteredServidores] = useState<Servidor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [functionFilter, setFunctionFilter] = useState<"all" | "acolito" | "cerimoniario">("all")
  const [editingServidor, setEditingServidor] = useState<Servidor | null>(null)

  useEffect(() => {
    let filtered = servidores.filter((servidor) => servidor.nome.toLowerCase().includes(searchTerm.toLowerCase()))

    // Apply function filter for acolitoCerimoniario role
    if (role === "acolitoCerimoniario" && functionFilter !== "all") {
      filtered = filtered.filter((servidor) => {
        if (!servidor.dataNascimento) return false
        const age = calculateAge(servidor.dataNascimento)
        if (functionFilter === "acolito") return age >= 14 && age < 16
        if (functionFilter === "cerimoniario") return age >= 16
        return true
      })
    }

    setFilteredServidores(filtered)
  }, [searchTerm, servidores, functionFilter, role])

  const fetchServidores = useCallback(async () => {
    if (!role) return;
  
    setLoading(true);
    try {
      const q = query(collection(db, "servidores"), where("tipo", "==", role));
      const querySnapshot = await getDocs(q);
      const servidoresData: Servidor[] = [];
  
      querySnapshot.forEach((doc) => {
        servidoresData.push({
          id: doc.id,
          ...doc.data(),
        } as Servidor);
      });
  
      setServidores(servidoresData);
      setFilteredServidores(servidoresData);
    } catch (error) {
      console.error("Erro ao buscar servidores:", error);
    } finally {
      setLoading(false);
    }
  }, [role]); // Adicione role como dependência
  
  useEffect(() => {
    fetchServidores();
  }, [fetchServidores]);

  const handleEdit = (servidor: Servidor) => {
    setEditingServidor(servidor)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este servidor?")) {
      try {
        await deleteDoc(doc(db, "servidores", id))
        setServidores(servidores.filter((s) => s.id !== id))
        setFilteredServidores(filteredServidores.filter((s) => s.id !== id))
      } catch (error) {
        console.error("Erro ao excluir servidor:", error)
      }
    }
  }

  const handleSaveEdit = async (editedServidor: Servidor) => {
    try {
      await updateDoc(doc(db, "servidores", editedServidor.id), editedServidor)
      setServidores(servidores.map((s) => (s.id === editedServidor.id ? editedServidor : s)))
      setFilteredServidores(filteredServidores.map((s) => (s.id === editedServidor.id ? editedServidor : s)))
      setEditingServidor(null)
    } catch (error) {
      console.error("Erro ao atualizar servidor:", error)
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "guardia":
        return "Guardias"
      case "acolitoCerimoniario":
        return "Acólitos/Cerimoniários"
      case "coroinha":
        return "Coroinhas"
      default:
        return "Servidores"
    }
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getServidorType = (age: number) => {
    if (age >= 14 && age < 16) return "Acólito"
    if (age >= 16) return "Cerimoniário"
    return "Muito jovem"
  }

  if (!profile || profile.role !== role) {
    return null
  }

  return (
    <AuthGuard allowedRoles={[role]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gerenciar {getRoleName(role)}</h1>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Input
              className="max-w-sm"
              placeholder="Pesquisar por nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {role === "acolitoCerimoniario" && (
              <div className="flex gap-2">
                <Button
                  variant={functionFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFunctionFilter("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={functionFilter === "acolito" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFunctionFilter("acolito")}
                >
                  Acólitos
                </Button>
                <Button
                  variant={functionFilter === "cerimoniario" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFunctionFilter("cerimoniario")}
                >
                  Cerimoniários
                </Button>
              </div>
            )}
          </div>
          <Button onClick={() => router.push(`/dashboard/${role}/cadastro`)}>Adicionar Novo</Button>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                {role === "acolitoCerimoniario" && <TableHead>Idade</TableHead>}
                {role === "acolitoCerimoniario" && <TableHead>Funcao</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServidores.map((servidor) => (
                <TableRow key={servidor.id}>
                  <TableCell>{servidor.nome}</TableCell>
                  {role === "acolitoCerimoniario" && servidor.dataNascimento && (
                    <TableCell>{calculateAge(servidor.dataNascimento)} anos</TableCell>
                  )}
                  {role === "acolitoCerimoniario" && servidor.dataNascimento && (
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          getServidorType(calculateAge(servidor.dataNascimento)) === "Acólito"
                            ? "bg-blue-100 text-blue-800"
                            : getServidorType(calculateAge(servidor.dataNascimento)) === "Cerimoniário"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {getServidorType(calculateAge(servidor.dataNascimento))}
                      </span>
                    </TableCell>
                  )}
                  <TableCell>
                    {servidor.ativo ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Ativo
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        Inativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(servidor)}>
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Servidor</DialogTitle>
                          </DialogHeader>
                          {editingServidor && (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                handleSaveEdit(editingServidor)
                              }}
                            >
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="nome">Nome</Label>
                                  <Input
                                    id="nome"
                                    value={editingServidor.nome}
                                    onChange={(e) => setEditingServidor({ ...editingServidor, nome: e.target.value })}
                                  />
                                </div>
                                {role === "acolitoCerimoniario" && (
                                  <div>
                                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                                    <Input
                                      id="dataNascimento"
                                      type="date"
                                      value={editingServidor.dataNascimento || ""}
                                      onChange={(e) =>
                                        setEditingServidor({ ...editingServidor, dataNascimento: e.target.value })
                                      }
                                    />
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="ativo"
                                    checked={editingServidor.ativo}
                                    onCheckedChange={(checked) =>
                                      setEditingServidor({ ...editingServidor, ativo: checked })
                                    }
                                  />
                                  <Label htmlFor="ativo">Ativo</Label>
                                </div>
                                <Button type="submit">Salvar Alterações</Button>
                              </div>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(servidor.id)}>
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AuthGuard>
  )
}

