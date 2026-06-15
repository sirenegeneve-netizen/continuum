import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import AlertBar from "../components/AlertBar"
import Metrics from "../components/Metrics"
import Procedures from "../components/Procedures"
import Contacts from "../components/Contacts"
import Users from "./Users"
import Incident from "./Incident"

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
          {page === "incident" && <Incident />}
          {page === "users" && <Users />}
        </div>
      </div>
    </div>
  )
}
