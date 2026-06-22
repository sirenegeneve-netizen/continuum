export default function PcaDashboard() {
  const metrics = [
    { label: "Services couverts", value: "12/14", sub: "86% de couverture", color: "var(--color-text-success)" },
    { label: "RTO/RPO non conformes", value: "3", sub: "Action requise", color: "var(--color-text-danger)" },
    { label: "Plans obsolètes", value: "2", sub: "Révision > 12 mois", color: "var(--color-text-warning)" },
    { label: "Prochain exercice", value: "15 juil.", sub: "Simulation PRA SI", color: "var(--color-text-primary)", small: true },
  ]

  const alertes = [
    { nom: "ERP Production", raison: "RTO objectif 4h — actuel 12h", criticite: "P1", couleur: "#e24b4a", bg: "#fcebeb", tc: "#a32d2d" },
    { nom: "Messagerie critique", raison: "Plan PCA expiré depuis 14 mois", criticite: "P1", couleur: "#e24b4a", bg: "#fcebeb", tc: "#a32d2d" },
    { nom: "CRM Commercial", raison: "RPO non conforme — données J-2", criticite: "P2", couleur: "#ef9f27", bg: "#faeeda", tc: "#854f0b" },
    { nom: "Intranet RH", raison: "Plan à jour — RTO conforme", criticite: "P3", couleur: "#639922", bg: "#eaf3de", tc: "#3b6d11" },
  ]

  const exercices = [
    { date: "15 juil. 25", nom: "Simulation PRA Système d'information", statut: "Planifié" },
    { date: "02 sept. 25", nom: "Test de bascule ERP", statut: "Planifié" },
    { date: "20 oct. 25", nom: "Exercice cellule de crise", statut: "À confirmer" },
    { date: "15 nov. 25", nom: "Audit ISO 22301", statut: "À confirmer" },
  ]

  const services = [
    { nom: "ERP Production", criticite: "P1", rtoObj: "4h", rtoAct: "12h", conforme: false },
    { nom: "Messagerie", criticite: "P1", rtoObj: "2h", rtoAct: "2h", conforme: true },
    { nom: "CRM Commercial", criticite: "P2", rtoObj: "8h", rtoAct: "8h", conforme: true },
    { nom: "Intranet RH", criticite: "P3", rtoObj: "24h", rtoAct: "24h", conforme: true },
    { nom: "Comptabilité", criticite: "P2", rtoObj: "4h", rtoAct: "6h", conforme: false },
    { nom: "VPN / Accès distants", criticite: "P1", rtoObj: "1h", rtoAct: "1h", conforme: true },
  ]

  const critBadge = (c) => ({
    P1: { bg: "#fcebeb", tc: "#a32d2d" },
    P2: { bg: "#faeeda", tc: "#854f0b" },
    P3: { bg: "#eaf3de", tc: "#3b6d11" },
  }[c] || {})

  const card = { background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "16px" }
  const badge = (bg, tc) => ({ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 500, background: bg, color: tc, whiteSpace: "nowrap" })
  const row = { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid #f3f4f6" }

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 500, color: "#111" }}>Dashboard PCA / PRA</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>Vue instantanée de la résilience</div>
        </div>
        <span style={{ ...badge("#fee2e2", "#991b1b"), padding: "6px 12px", fontSize: "12px" }}>3 alertes actives</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "8px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>{m.label}</div>
            <div style={{ fontSize: m.small ? "16px" : "22px", fontWeight: 500, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div style={card}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginBottom: "14px" }}>⚠️ Services critiques en alerte</div>
          {alertes.map(a => (
            <div key={a.nom} style={row}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: a.couleur, flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", color: "#111" }}>{a.nom}</div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>{a.raison}</div>
              </div>
              <span style={badge(a.bg, a.tc)}>{a.criticite}</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginBottom: "14px" }}>📅 Prochains exercices</div>
          {exercices.map(e => (
            <div key={e.nom} style={row}>
              <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#6b7280", width: "70px", flexShrink: 0 }}>{e.date}</div>
              <div style={{ flex: 1, fontSize: "12px", color: "#111" }}>{e.nom}</div>
              <span style={badge(e.statut === "Planifié" ? "#dbeafe" : "#f3f4f6", e.statut === "Planifié" ? "#1d4ed8" : "#6b7280")}>{e.statut}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginBottom: "14px" }}>📊 Conformité RTO/RPO par service</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 100px 100px 110px", gap: "8px", padding: "8px 0", borderBottom: "0.5px solid #e5e7eb", fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>
          <span>Service</span><span>Criticité</span><span>RTO objectif</span><span>RTO actuel</span><span>Statut</span>
        </div>
        {services.map(s => {
          const cb = critBadge(s.criticite)
          return (
            <div key={s.nom} style={{ display: "grid", gridTemplateColumns: "2fr 80px 100px 100px 110px", gap: "8px", padding: "9px 0", borderBottom: "0.5px solid #f3f4f6", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#111" }}>{s.nom}</span>
              <span style={badge(cb.bg, cb.tc)}>{s.criticite}</span>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{s.rtoObj}</span>
              <span style={{ fontSize: "12px", color: "#111" }}>{s.rtoAct}</span>
              <span style={badge(s.conforme ? "#eaf3de" : "#fcebeb", s.conforme ? "#3b6d11" : "#a32d2d")}>{s.conforme ? "Conforme" : "Non conforme"}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
