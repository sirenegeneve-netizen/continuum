import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import AlertBar from "../components/AlertBar"
import Metrics from "../components/Metrics"
import Procedures from "../components/Procedures"
import Contacts from "../components/Contacts"
import Users from "./Users"
import Incident from "./Incident"
import ContinuiteService from "./ContinuiteService"

const ROLES_ADMIN_PLATEFORME = ["super_admin", "admin_org"]
function estAdminPlateforme() {
  return ROLES_ADMIN_PLATEFORME.includes(localStorage.getItem("role") || "")
}

function AccesRefuse() {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center", color: "#6b7280" }}>
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔒</div>
      <div style={{ fontWeight: 500, marginBottom: "6px", fontSize: "15px" }}>Accès refusé</div>
      <div style={{ fontSize: "13px" }}>Cette section est réservée aux administrateurs de la plateforme.</div>
    </div>
  )
}

export default function Home({ page, setPage, onDeconnexion }) {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      <Sidebar page={page} setPage={setPage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header onDeconnexion={onDeconnexion} />
        <AlertBar />
        <div style={{ flex: 1, overflowY: "auto", background: "#f9fafb" }}>
          {page === "dashboard" && (
            <div style={{ padding: "20px 24px" }}>
              <Metrics />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Procedures />
                <Contacts />
              </div>
            </div>
          )}
          {page === "incident"   && <Incident />}
          {page === "users"      && (estAdminPlateforme() ? <Users /> : <AccesRefuse />)}
          {page === "continuite" && <ContinuiteService />}
        </div>
      </div>
    </div>
  )
}
