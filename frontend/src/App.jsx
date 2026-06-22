import { useState } from "react"
import Home from "./pages/Home"
import Login from "./pages/Login"

export default function App() {
  const [connecte, setConnecte] = useState(false)
  const [page, setPage] = useState("dashboard")

  function deconnexion() {
    localStorage.removeItem("token")
    setConnecte(false)
    setPage("dashboard")
  }

  if (!connecte) {
    return <Login onConnexion={() => setConnecte(true)} />
  }

  return <Home page={page} setPage={setPage} onDeconnexion={deconnexion} />
}