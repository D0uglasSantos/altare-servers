"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import type { Servidor } from "@/types/Servidor"

interface ServidorFormProps {
  servidor?: Servidor
  isEditing?: boolean
}

export default function ServidorForm({ servidor, isEditing = false }: ServidorFormProps) {
  const [nome, setNome] = useState(servidor?.nome || "")
  const [idade, setIdade] = useState(servidor?.idade?.toString() || "")
  const [funcao, setFuncao] = useState(servidor?.funcao || "")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !idade || !funcao) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      const servidorData = {
        nome,
        idade: Number.parseInt(idade),
        funcao,

      }

      if (isEditing && servidor?.id) {
        await updateDoc(doc(db, "servidores", servidor.id), servidorData)
        toast({
          title: "Sucesso",
          description: "Servidor atualizado com sucesso!",
        })
      } else {
        await addDoc(collection(db, "servidores"), servidorData)
        toast({
          title: "Sucesso",
          description: "Servidor cadastrado com sucesso!",
        })
      }

      router.push("/servidores")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar servidor:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o servidor.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="idade">Idade</Label>
        <Input id="idade" type="number" value={idade} onChange={(e) => setIdade(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="funcao">Função</Label>
        <Select value={funcao} onValueChange={setFuncao} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Acólito">Acólito</SelectItem>
            <SelectItem value="Cerimoniário">Cerimoniário</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.push("/servidores")}>
          Cancelar
        </Button>
        <Button type="submit">{isEditing ? "Atualizar" : "Cadastrar"}</Button>
      </div>
    </form>
  )
}

