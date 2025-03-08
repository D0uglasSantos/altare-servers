"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import AuthGuard from "@/components/auth-guard"

type Servidor = {
  id: string
  nome: string
  ativo: boolean
  dataCadastro: string
}

export default function DashboardPage() {
  const params = useParams()
  const role = params.role as string
  const { profile } = useAuth()

  const [servidores, setServidores] = useState<Servidor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServidores = async () => {
      if (!role) return

      try {
        const q = query(collection(db, "servidores"), where("tipo", "==", role))

        const querySnapshot = await getDocs(q)
        const servidoresData: Servidor[] = []

        querySnapshot.forEach((doc) => {
          servidoresData.push({
            id: doc.id,
            ...doc.data(),
          } as Servidor)
        })

        setServidores(servidoresData)
      } catch (error) {
        console.error("Erro ao buscar servidores:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServidores()
  }, [role])

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

  if (!profile || profile.role !== role) {
    return null
  }

  return (
    <AuthGuard allowedRoles={[role]}>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">{getRoleName(role)}</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total de {getRoleName(role)}</CardTitle>
              <CardDescription>Servidores cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">{loading ? "..." : servidores.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ativos</CardTitle>
              <CardDescription>Servidores disponíveis para escalas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">
                {loading ? "..." : servidores.filter((s) => s.ativo).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Servidores Recentes</CardTitle>
            <CardDescription>Últimos servidores cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : servidores.length > 0 ? (
              <div className="space-y-4">
                {servidores.slice(0, 5).map((servidor) => (
                  <div key={servidor.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{servidor.nome}</p>
                    </div>
                    <div className="text-sm">
                      {servidor.ativo ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Ativo
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum servidor cadastrado ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}

