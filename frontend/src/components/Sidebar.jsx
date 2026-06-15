export default function Sidebar({ page, setPage }) {
  const navItem = (icon, label, key) => (
    <div key={key} onClick={() => setPage(key)} style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "8px 16px", cursor: "pointer", fontSize: "13px",
      color: page === key ? "#fff" : "rgba(255,255,255,0.6)",
      background: page === key ? "rgba(255,255,255,0.1)" : "transparent",
      borderLeft: page === key ? "2px solid #4f8ef7" : "2px solid transparent"
    }}>
      <span>{icon}</span>{label}
    </div>
  )

  return (
    <aside style={{ width: "220px", height: "100vh", background: "#1a1f36", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ color: "#fff", fontSize: "16px", fontWeight: 500 }}>Continuum</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "2px" }}>Continuité & Reprise d'activité</div>
      </div>

      <div style={{ margin: "12px 16px", background: "#c0392b", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#fff", fontSize: "16px" }}>⚠️</span>
        <span style={{ color: "#fff", fontSize: "12px", fontWeight: 500 }}>Mode crise actif</span>
      </div>

      <nav style={{ padding: "16px 0" }}>
        <div style={{ padding: "0 16px 6px", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Principal</div>
        {navItem("📊", "Dashboard", "dashboard")}
        {navItem("🚨", "Incident en cours", "incident")}
        {navItem("📄", "Procédures", "procedures")}
        {navItem("🔌", "Continuité de service", "continuite")}

        <div style={{ padding: "12px 16px 6px", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Ressources</div>
        {navItem("📣", "Communication", "communication")}
        {navItem("👥", "Contacts", "contacts")}
        {navItem("🖨️", "Documents", "documents")}

        <div style={{ padding: "12px 16px 6px", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Administration</div>
        {navItem("👤", "Utilisateurs", "users")}
      </nav>
    </aside>
  )
}
