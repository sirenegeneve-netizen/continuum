export default function RolesDroits() {
  const roles = [
    { nom: "Super Administrateur", description: "Accès complet à la plateforme", couleur: "#fee2e2", tc: "#991b1b" },
    { nom: "Administrateur Organisation", description: "Gestion de son organisation", couleur: "#dbeafe", tc: "#1d4ed8" },
    { nom: "Responsable Continuité (BCM)", description: "Création et gestion des plans PCA", couleur: "#dcfce7", tc: "#166534" },
    { nom: "Responsable Informatique", description: "Vision technique et gestion IT", couleur: "#f3e8ff", tc: "#7e22ce" },
    { nom: "Gestionnaire de Crise", description: "Pilotage des incidents en temps réel", couleur: "#fef3cd", tc: "#856404" },
    { nom: "Contributeur", description: "Mise à jour des informations assignées", couleur: "#f1f5f9", tc: "#475569" },
    { nom: "Auditeur", description: "Lecture seule — audits ISO 22301, NIS2, DORA", couleur: "#e0f2fe", tc: "#0369a1" },
  ]

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "60vh", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 500, color: "#111" }}>Profils & droits</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{roles.length} profils configurés</div>
        </div>
        <button style={{ background: "#1a1f36", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}>+ Nouveau profil</button>
      </div>

      <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 80px", gap: "8px", padding: "10px 16px", fontSize: "11px", color: "#6b7280", fontWeight: 500, borderBottom: "0.5px solid #e5e7eb", background: "#f9fafb" }}>
          <span>Profil</span><span>Description</span><span>Actions</span>
        </div>
        {roles.map(r => (
          <div key={r.nom} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 80px", gap: "8px", padding: "12px 16px", borderBottom: "0.5px solid #f3f4f6", alignItems: "center" }}>
            <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "20px", background: r.couleur, color: r.tc, fontWeight: 500, display: "inline-block" }}>{r.nom}</span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>{r.description}</span>
            <button style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer" }}>✏️ Éditer</button>
          </div>
        ))}
      </div>
    </div>
  )
}
