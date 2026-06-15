export default function Metrics() {
  const cards = [
    { label: "Systèmes affectés", value: "3", sub: "ERP, CRM, Mail", color: "#c0392b" },
    { label: "Procédures actives", value: "7", sub: "2 en attente", color: "#16a34a" },
    { label: "Équipes mobilisées", value: "12", sub: "Sur 4 sites", color: "#d97706" },
    { label: "Dernière sauvegarde", value: "2h", sub: "Snapshot valide", color: "#16a34a" },
  ]
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
      {cards.map(({ label, value, sub, color }) => (
        <div key={label} style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "8px", padding: "14px 16px" }}>
          <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>{label}</div>
          <div style={{ fontSize: "22px", fontWeight: 500, color }}>{value}</div>
          <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px" }}>{sub}</div>
        </div>
      ))}
    </div>
  )
}
