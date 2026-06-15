import { useState } from "react"

const API_URL = "https://psychic-space-guide-r74pjwv5qw4pcxvr6-8000.app.github.dev"

export default function Login({ onConnexion }) {
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [erreur, setErreur] = useState("")
  const [chargement, setChargement] = useState(false)

  async function handleConnexion() {
    setErreur("")
    setChargement(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password: motDePasse })
      })
      const data = await res.json()
      if (!res.ok) {
        setErreur(data.detail || "Erreur de connexion")
      } else {
        localStorage.setItem("token", data.access_token)
        // Récupérer le rôle et les infos utilisateur
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` }
        })
        if (meRes.ok) {
          const me = await meRes.json()
          localStorage.setItem("role", me.role)
          localStorage.setItem("user_nom", `${me.prenom} ${me.nom}`)
          localStorage.setItem("user_email", me.email)
        }
        onConnexion()
      }
    } catch (e) {
      setErreur("Impossible de contacter le serveur")
    }
    setChargement(false)
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      <div style={{ width: "280px", background: "#1a1f36", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "32px 28px", flexShrink: 0 }}>
        <div>
          <img src="/logos/conti-mire.png" alt="Continuum" style={{ width: "300px", height: "auto" }} />
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "4px" }}>Continuité & Reprise d'activité</div>
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: "15px", fontWeight: 500, marginBottom: "8px" }}>Accès sécurisé</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", lineHeight: 1.6 }}>Cette plateforme est réservée aux équipes autorisées.</div>
          <div style={{ marginTop: "16px", background: "rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }}></div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>Plateforme opérationnelle</div>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>Continuum 2025 - Accès restreint</div>
      </div>
      <div style={{ flex: 1, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "32px 28px", width: "300px" }}>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "#111", marginBottom: "4px" }}>Connexion</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "24px" }}>Identifiez-vous pour accéder à la plateforme</div>
          {erreur && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px" }}>
              {erreur}
            </div>
          )}
          <label style={{ fontSize: "12px", color: "#374151", marginBottom: "5px", display: "block" }}>Adresse email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="prenom.nom@organisation.fr"
            style={{ width: "100%", height: "36px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "0 12px", fontSize: "13px", marginBottom: "14px", outline: "none" }}
            onKeyDown={e => e.key === "Enter" && handleConnexion()} />
          <label style={{ fontSize: "12px", color: "#374151", marginBottom: "5px", display: "block" }}>Mot de passe</label>
          <input type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder="••••••••"
            style={{ width: "100%", height: "36px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "0 12px", fontSize: "13px", marginBottom: "20px", outline: "none" }}
            onKeyDown={e => e.key === "Enter" && handleConnexion()} />
          <button onClick={handleConnexion} disabled={chargement}
            style={{ width: "100%", height: "36px", background: chargement ? "#9ca3af" : "#1a1f36", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  )
}
