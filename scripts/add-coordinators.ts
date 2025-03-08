import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Inicialize o Firebase Admin SDK
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
})

const db = getFirestore()

interface Coordinator {
  uid: string
  email: string
  name: string
  role: "guardia" | "acolitoCerimoniario" | "coroinha"
}

const coordinators: Coordinator[] = [
  { uid: "lcR59rURVwdnJdg8TMALGcsr3KT2", email: "coordenacaoguardiaspnsf@gmail.com", name: "Coordenador Guardiãs", role: "guardia" },
  { uid: "ec1updms1oYGXkfGjdKy7T5qDYQ2", email: "acolitoscerimoniariospnsf@gmail.com", name: "Coordenador Acólitos e Cerimoniários", role: "acolitoCerimoniario" },
  { uid: "e33FxEZSmhfCowbeyYX56xTrb3m2", email: "wandreyist@gmail.com", name: "Coordenador Coroinha", role: "coroinha" },
]

async function addCoordinators() {
  for (const coordinator of coordinators) {
    try {
      await db.collection("users").doc(coordinator.uid).set({
        email: coordinator.email,
        name: coordinator.name,
        role: coordinator.role,
        createdAt: new Date(),
      })
      console.log(`Coordenador ${coordinator.name} adicionado com sucesso.`)
    } catch (error) {
      console.error(`Erro ao adicionar coordenador ${coordinator.name}:`, error)
    }
  }
}

addCoordinators()
  .then(() => {
    console.log("Processo concluído.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Erro no processo:", error)
    process.exit(1)
  })

