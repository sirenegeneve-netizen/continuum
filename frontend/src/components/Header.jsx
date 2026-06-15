export default function Header({ onDeconnexion }) {
  return (
    <div style={{
      background: "#fff",
      borderBottom: "0.5px solid #e5e7eb",
      padding: "0 24px",
      height: "52px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0
    }}>
      <div style={{ fontSize: "15px", fontWeight: 500, color: "#111" }}>Dashboard</div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          background: "#fef3cd", color: "#856404",
          fontSize: "11px", padding: "4px 10px",
          borderRadius: "20px", fontWeight: 500,
          display: "flex", alignItems: "center", gap: "5px"
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }}></span>
          ERP indisponible
        </div>
        <div style={{
          width: "30px", height: "30px", borderRadius: "50%",
          background: "#4f8ef7", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: "11px", fontWeight: 500
        }}>SG</div>
        <button onClick={onDeconnexion} style={{
          background: "#f3f4f6", color: "#374151",
          border: "none", borderRadius: "8px",
          padding: "6px 12px", fontSize: "12px",
          cursor: "pointer", display: "flex",
          alignItems: "center", gap: "5px"
        }}>
          🔓 Déconnexion
        </button>
      </div>
    </div>
  )
}
