 import Sidebar from "../components/Sidebar"

// PCA / PRA
import PcaDashboard from "../components/pca/PcaDashboard"
import PcaProcedures from "../components/pca/PcaProcedures"
import PcaDocuments from "../components/pca/PcaDocuments"
import PcaActions from "../components/pca/PcaActions"
import PcaCommunication from "../components/pca/PcaCommunication"

// Gestion de crise
import DeclarationIncident from "../components/crise/DeclarationIncident"
import SalleDeCrise from "../components/crise/SalleDeCrise"
import JournalDeBord from "../components/crise/JournalDeBord"
import CommunicationCrise from "../components/crise/CommunicationCrise"
import DocumentsCritiques from "../components/crise/DocumentsCritiques"
import Retex from "../components/crise/Retex"

// Ressources
import Contacts from "../components/ressources/Contacts"
import Documentation from "../components/ressources/Documentation"
import ModelesFormulaires from "../components/ressources/ModelesFormulaires"
import ContinuiteService from "./ContinuiteService"

// Administration
import AdminDashboard from "../components/admin/AdminDashboard"
import Users from "../components/admin/Users"
import GestionUtilisateur from "../components/admin/GestionUtilisateur"
import RolesDroits from "../components/admin/RolesDroits"
import AdminSettings from "../components/admin/AdminSettings"

export default function Home({ page, setPage, onDeconnexion }) {

  function renderPage() {
    switch (page) {
      // PCA / PRA
      case "pca_dashboard": return <PcaDashboard />
      case "pca_procedures": return <PcaProcedures />
      case "pca_documents": return <PcaDocuments />
      case "pca_actions": return <PcaActions />
      case "pca_com": return <PcaCommunication />

      // Gestion de crise
      case "crise_declaration": return <DeclarationIncident />
      case "crise_salle": return <SalleDeCrise />
      case "crise_journal": return <JournalDeBord />
      case "crise_com": return <CommunicationCrise />
      case "crise_docs": return <DocumentsCritiques />
      case "crise_retex": return <Retex />

      // Ressources
      case "contacts": return <Contacts />
      case "documents": return <Documentation />
      case "modeles": return <ModelesFormulaires />

      case "continuite_service": return <ContinuiteService />
      // Administration
      case "admin_dashboard": return <AdminDashboard />
      case "users": return <Users />
      case "gestion_utilisateur": return <GestionUtilisateur />
      case "admin_roles": return <RolesDroits />
      case "admin_settings": return <AdminSettings />

      default:
        return <PcaDashboard />
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar page={page} setPage={setPage} />

      <div style={{ flex: 1, padding: "20px" }}>
        {renderPage()}
      </div>
    </div>
  )
}
