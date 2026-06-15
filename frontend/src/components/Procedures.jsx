const procedures = [
  { icon: "🖥️", label: "Restauration serveurs", status: "Critique", color: "#fee2e2", text: "#991b1b" },
  { icon: "📧", label: "Communication externe", status: "En cours", color: "#fef3cd", text: "#856404" },
  { icon: "👥", label: "Activation cellule de crise", status: "Fait", color: "#dcfce7", text: "#166534" },
  { icon: "☁️", label: "Bascule mode dégradé", status: "Fait", color: "#dcfce7", text: "#166534" },
]

export default function Procedures() {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "16px" }}>
      <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginBottom: "14px" }}>📄 Procédures prioritaires</div>
      {procedures.map(({ icon, label, status, color, text }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid #f3f4f6" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{icon}</div>
          <div style={{ flex: 1, fontSize: "12px", color: "#111" }}>{label}</div>
          <div style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 500, background: color, color: text }}>{status}</div>
        </div>
      ))}
    </div>
  )
}
