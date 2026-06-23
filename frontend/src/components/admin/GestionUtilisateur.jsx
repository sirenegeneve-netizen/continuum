import { useState } from "react"
import UsersContent from "../../pages/Users"
import RolesDroitsContent from "./RolesDroits"

const ONGLETS = [
  { id: "comptes", label: "Comptes" },
  { id: "profils", label: "Profils & droits" },
  { id: "equipes", label: "Équipes" },
  { id: "services", label: "Services" },
]

export default function GestionUtilisateur() {
  const [onglet, setOnglet] = useState("comptes")

  return (
    <div style={{ fontFamily: "Arial" }}>
      <div style={{ display: "flex", gap: "4px", padding: "0 24px", paddingTop: "20px", borderBottom: "0.5px solid #e5e7eb", background: "#f9fafb" }}>
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{
            padding: "8px 16px", fontSize: "13px", cursor: "pointer", border: "none", background: "none",
            color: onglet === o.id ? "#111" : "#6b7280",
            fontWeight: onglet === o.id ? 500 : 400,
            borderBottom: onglet === o.id ? "2px solid #1a1f36" : "2px solid transparent"
          }}>
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "comptes" && <UsersContent key="comptes" defaultTab="users" />}
      {onglet === "profils" && <RolesDroitsContent />}
      {onglet === "equipes" && (
        <div style={{ padding: "24px", background: "#f9fafb", minHeight: "60vh" }}>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "#111" }}>Équipes</div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>Référentiel des équipes (ex. Cellule de crise) — à venir.</div>
        </div>
      )}
      {onglet === "services" && <UsersContent key="services" defaultTab="services" />}
    </div>
  )
}
