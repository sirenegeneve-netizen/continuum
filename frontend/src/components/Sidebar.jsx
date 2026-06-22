const ROLES_ADMIN_PLATEFORME = ["super_admin", "admin_org"]

function getRole() {
  return localStorage.getItem("role") || ""
}

function estAdminPlateforme() {
  return ROLES_ADMIN_PLATEFORME.includes(getRole())
}

export default function Sidebar({ page, setPage }) {
  const navItem = (icon, label, key) => (
    <div
      key={key}
      onClick={() => setPage(key)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 16px",
        cursor: "pointer",
        fontSize: "13px",
        color: page === key ? "#fff" : "rgba(255,255,255,0.6)",
        background: page === key ? "rgba(255,255,255,0.1)" : "transparent",
        borderLeft: page === key ? "2px solid #4f8ef7" : "2px solid transparent"
      }}
    >
      <span>{icon}</span>
      {label}
    </div>
  )

  return (
    <aside
      style={{
        width: "220px",
        height: "100vh",
        background: "#1a1f36",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflowY: "auto"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "0.5px solid rgba(255,255,255,0.08)"
        }}
      >
        <div style={{ color: "#fff", fontSize: "16px", fontWeight: 500 }}>
          Continuum
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "11px",
            marginTop: "2px"
          }}
        >
          Continuité & Reprise d'activité
        </div>
      </div>

      {/* BADGE MODE CRISE */}
      <div
        style={{
          margin: "12px 16px",
          background: "#c0392b",
          borderRadius: "8px",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <span style={{ color: "#fff", fontSize: "16px" }}>⚠️</span>
        <span style={{ color: "#fff", fontSize: "12px", fontWeight: 500 }}>
          Mode crise actif
        </span>
      </div>

      <nav style={{ padding: "16px 0" }}>
        {/* ESPACE OPÉRATIONNEL */}
        <div
          style={{
            padding: "0 16px 6px",
            fontSize: "10px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          Espace opérationnel
        </div>

        {navItem("📊", "Dashboard PCA/PRA", "pca_dashboard")}
        {navItem("📄", "Procédures de continuité", "pca_procedures")}
        {navItem("🗂️", "Documents par service", "pca_documents")}
        {navItem("📌", "Actions à réaliser", "pca_actions")}
        {navItem("📣", "Communication opérationnelle", "pca_com")}

        {/* GESTION DE CRISE */}
        <div
          style={{
            padding: "12px 16px 6px",
            fontSize: "10px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          Gestion de crise
        </div>

        {navItem("🚨", "Déclaration d’incident", "crise_declaration")}
        {navItem("🧭", "Salle de crise", "crise_salle")}
        {navItem("📝", "Journal de bord", "crise_journal")}
        {navItem("📢", "Communication de crise", "crise_com")}
        {navItem("📚", "Documents critiques", "crise_docs")}
        {navItem("🔍", "RETEX", "crise_retex")}

        {/* RESSOURCES */}
        <div
          style={{
            padding: "12px 16px 6px",
            fontSize: "10px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          Ressources
        </div>

        {navItem("👥", "Contacts & astreintes", "contacts")}
        {navItem("📄", "Documentation", "documents")}
        {navItem("🧩", "Modèles & formulaires", "modeles")}

          {navItem("🔌", "Continuité de service", "continuite_service")}

        {/* ADMINISTRATION */}
        {estAdminPlateforme() && (
          <>
            <div
              style={{
                padding: "12px 16px 6px",
                fontSize: "10px",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              Administration
            </div>

            {navItem("📊", "Dashboard Admin", "admin_dashboard")}
            {navItem("👥", "Gestion utilisateur", "gestion_utilisateur")}
            {navItem("⚙️", "Paramètres système", "admin_settings")}
          </>
        )}
      </nav>
    </aside>
  )
}
