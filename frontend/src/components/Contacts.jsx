const contacts = [
  { initials: "DM", label: "Directeur MIS", role: "Responsable incident", bg: "#dbeafe", color: "#1d4ed8" },
  { initials: "AS", label: "Admin Système", role: "Infra & réseau", bg: "#dcfce7", color: "#166534" },
  { initials: "CC", label: "Chargé communication", role: "Communication crise", bg: "#fef3cd", color: "#856404" },
  { initials: "RH", label: "RH / Direction", role: "Escalade décisionnelle", bg: "#fce7f3", color: "#9d174d" },
]

export default function Contacts() {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "16px" }}>
      <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginBottom: "14px" }}>👥 Contacts d'urgence</div>
      {contacts.map(({ initials, label, role, bg, color }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: "0.5px solid #f3f4f6" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 500, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#111" }}>{label}</div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>{role}</div>
          </div>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>📞</div>
        </div>
      ))}
    </div>
  )
}
