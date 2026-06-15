export default function AlertBar() {
  return (
    <div style={{
      background: "#ff8c00",
      color: "white",
      padding: "15px",
      borderRadius: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <strong>🚨 Incident en cours – ERP indisponible</strong>
        <p style={{ margin: 0 }}>Mode crise activé</p>
      </div>

      <div style={{
        background: "rgba(0,0,0,0.2)",
        padding: "5px 10px",
        borderRadius: "6px"
      }}>
        CRISIS
      </div>
    </div>
  )
}