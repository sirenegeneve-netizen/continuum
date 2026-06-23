import { useState, useEffect } from "react"

const API_URL = "https://psychic-space-guide-r74pjwv5qw4pcxvr6-8000.app.github.dev"

const ROLES = {
  super_admin:       { label: "Super administrateur",    bg: "#fee2e2", text: "#991b1b" },
  admin_org:         { label: "Admin. organisation",      bg: "#dbeafe", text: "#1d4ed8" },
  bcm:               { label: "Responsable continuité",   bg: "#dcfce7", text: "#166534" },
  it:                { label: "Resp. informatique",        bg: "#f3e8ff", text: "#7e22ce" },
  gestionnaire_crise:{ label: "Gestionnaire de crise",    bg: "#fef3cd", text: "#856404" },
  contributeur:      { label: "Contributeur",              bg: "#f1f5f9", text: "#475569" },
  auditeur:          { label: "Auditeur",                  bg: "#e0f2fe", text: "#0369a1" },
}

const SERVICE_COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316","#6366f1","#84cc16"]

function getToken() {
  return localStorage.getItem("token") || ""
}

export default function Users(props) {
  const hideTab = props.hideTab || null
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [roles, setRoles] = useState([])
  const [activeTab, setActiveTab] = useState(props.defaultTab || "users")

  // Filtres
  const [sortOrder, setSortOrder] = useState("az")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")

  // Formulaire utilisateur
  const [showUserForm, setShowUserForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [userForm, setUserForm] = useState({ nom:"", prenom:"", email:"", mot_de_passe:"", confirmer:"", role:"contributeur", actif:true, service_ids:[] })
  const [userError, setUserError] = useState("")

  // Formulaire service
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editService, setEditService] = useState(null)
  const [serviceForm, setServiceForm] = useState({ nom:"", description:"", couleur:"#3b82f6" })
  const [serviceError, setServiceError] = useState("")

  useEffect(() => {
    chargerUsers()
    chargerServices()
    chargerRoles()
  }, [])

  async function chargerUsers() {
    const res = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${getToken()}` } })
    if (res.ok) setUsers(await res.json())
  }

  async function chargerRoles() {
    const res = await fetch(`${API_URL}/api/roles`, { headers: { Authorization: `Bearer ${getToken()}` } })
    if (res.ok) setRoles(await res.json())
  }

  async function chargerServices() {
    const res = await fetch(`${API_URL}/api/services`, { headers: { Authorization: `Bearer ${getToken()}` } })
    if (res.ok) setServices(await res.json())
  }

  // ─── UTILISATEURS ───────────────────────────────────────────────

  function ouvrirFormulaireUser(user = null) {
    setEditUser(user)
    setUserForm(user ? {
      nom: user.nom, prenom: user.prenom, email: user.email,
      mot_de_passe: "", confirmer: "",
      role: user.role, actif: user.actif,
      service_ids: user.service_ids || []
    } : { nom:"", prenom:"", email:"", mot_de_passe:"", confirmer:"", role:"contributeur", actif:true, service_ids:[] })
    setUserError("")
    setShowUserForm(true)
  }

  function toggleService(id) {
    setUserForm(f => ({
      ...f,
      service_ids: f.service_ids.includes(id)
        ? f.service_ids.filter(s => s !== id)
        : [...f.service_ids, id]
    }))
  }

  async function sauvegarderUser() {
    setUserError("")
    if (!userForm.nom || !userForm.prenom || !userForm.email) {
      setUserError("Prénom, nom et email sont obligatoires."); return
    }
    if (!editUser) {
      if (!userForm.mot_de_passe) { setUserError("Le mot de passe est obligatoire."); return }
      if (userForm.mot_de_passe.length < 8) { setUserError("Minimum 8 caractères."); return }
      if (userForm.mot_de_passe !== userForm.confirmer) { setUserError("Les mots de passe ne correspondent pas."); return }
    }
    const body = {
      nom: userForm.nom, prenom: userForm.prenom, email: userForm.email,
      role: userForm.role, actif: userForm.actif, service_ids: userForm.service_ids,
      ...(editUser ? {} : { mot_de_passe: userForm.mot_de_passe })
    }
    const url = editUser ? `${API_URL}/api/users/${editUser.id}` : `${API_URL}/api/users`
    const res = await fetch(url, {
      method: editUser ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body)
    })
    if (!res.ok) { const d = await res.json(); setUserError(d.detail || "Erreur"); return }
    setShowUserForm(false)
    chargerUsers()
  }

  async function supprimerUser(id) {
    if (!confirm("Confirmer la suppression ?")) return
    await fetch(`${API_URL}/api/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } })
    chargerUsers()
  }

  const filteredUsers = users
    .filter(u => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      if (statusFilter === "active" && !u.actif) return false
      if (statusFilter === "inactive" && u.actif) return false
      if (serviceFilter === "none" && (u.service_ids||[]).length > 0) return false
      if (serviceFilter !== "all" && serviceFilter !== "none" && !(u.service_ids||[]).map(String).includes(String(serviceFilter))) return false
      return true
    })
    .sort((a, b) => {
      const na = `${a.nom} ${a.prenom}`.toLowerCase()
      const nb = `${b.nom} ${b.prenom}`.toLowerCase()
      return sortOrder === "az" ? na.localeCompare(nb) : nb.localeCompare(na)
    })

  // ─── SERVICES ───────────────────────────────────────────────────

  function ouvrirFormulaireService(service = null) {
    setEditService(service)
    setServiceForm(service
      ? { nom: service.nom, description: service.description || "", couleur: service.couleur }
      : { nom: "", description: "", couleur: "#3b82f6" })
    setServiceError("")
    setShowServiceForm(true)
  }

  async function sauvegarderService() {
    setServiceError("")
    if (!serviceForm.nom) { setServiceError("Le nom est obligatoire."); return }
    const url = editService ? `${API_URL}/api/services/${editService.id}` : `${API_URL}/api/services`
    const res = await fetch(url, {
      method: editService ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(serviceForm)
    })
    if (!res.ok) { const d = await res.json(); setServiceError(d.detail || "Erreur"); return }
    setShowServiceForm(false)
    chargerServices()
  }

  async function supprimerService(id) {
    if (!confirm("Supprimer ce service ? Les utilisateurs seront désaffectés.")) return
    await fetch(`${API_URL}/api/services/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } })
    chargerServices()
    chargerUsers()
  }

  // ─── STYLES ─────────────────────────────────────────────────────

  const s = {
    page:      { padding: "24px", background: "#f9fafb", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
    topTitle:  { fontSize: "18px", fontWeight: 500, marginBottom: "2px" },
    topSub:    { fontSize: "12px", color: "#6b7280", marginBottom: "20px" },
    tabs:      { display: "flex", gap: "4px", borderBottom: "1px solid #e5e7eb", marginBottom: "20px" },
    tab:       (active) => ({ padding: "8px 16px", fontSize: "13px", cursor: "pointer", border: "none", background: "none", color: active ? "#111" : "#6b7280", fontWeight: active ? 600 : 400, borderBottom: active ? "2px solid #111" : "2px solid transparent", marginBottom: "-1px" }),
    stats:     { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" },
    statCard:  { background: "#f3f4f6", borderRadius: "8px", padding: "14px 16px" },
    statLbl:   { fontSize: "11px", color: "#6b7280", marginBottom: "4px" },
    statVal:   { fontSize: "22px", fontWeight: 500 },
    filters:   { display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" },
    select:    { fontSize: "13px", padding: "6px 10px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff" },
    btnPri:    { background: "#1a1f36", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" },
    btnSec:    { background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontSize: "13px" },
    btnSm:     { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "12px" },
    btnDanger: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "12px", color: "#dc2626" },
    card:      { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" },
    thead:     { display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 90px", gap: "12px", padding: "10px 16px", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
    trow:      { display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 90px", gap: "12px", padding: "12px 16px", borderBottom: "1px solid #f3f4f6", fontSize: "13px", alignItems: "center" },
    formPanel: { background: "#fff", border: "1px solid #d1d5db", borderRadius: "12px", padding: "20px", marginBottom: "20px" },
    formGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
    formGrp:   { display: "flex", flexDirection: "column", gap: "4px" },
    formLbl:   { fontSize: "12px", fontWeight: 500, color: "#6b7280" },
    formInp:   { fontSize: "13px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db" },
    error:     { color: "#dc2626", fontSize: "12px", padding: "8px 12px", background: "#fef2f2", borderRadius: "8px", marginBottom: "12px" },
    badge:     (bg, text) => ({ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, background: bg, color: text }),
    svcChip:   (color) => ({ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "20px", fontSize: "11px", background: color + "18", color: color, margin: "2px" }),
    svcOpt:    (sel) => ({ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", cursor: "pointer", fontSize: "13px", background: sel ? "#eff6ff" : "#fff", borderBottom: "1px solid #f3f4f6" }),
    svcRow:    { display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f3f4f6", fontSize: "13px" },
    colorSwatch: (c, sel) => ({ width: "22px", height: "22px", borderRadius: "50%", background: c, cursor: "pointer", border: sel ? "3px solid #1a1f36" : "2px solid transparent", flexShrink: 0 }),
  }

  const statActifs = users.filter(u => u.actif).length
  const statSansService = users.filter(u => !(u.service_ids||[]).length).length

  return (
    <div style={s.page}>
      <div style={s.topTitle}>Administration</div>
      <div style={s.topSub}>{users.length} utilisateur(s) · {services.length} service(s)</div>

      {/* TABS */}
      <div style={s.tabs}>
        {hideTab !== "users" && <button style={s.tab(activeTab==="users")} onClick={() => setActiveTab("users")}>👥 Utilisateurs</button>}
        {hideTab !== "services" && <button style={s.tab(activeTab==="services")} onClick={() => setActiveTab("services")}>🏥 Services</button>}
      </div>

      {/* ── ONGLET UTILISATEURS ── */}
      {activeTab === "users" && (
        <>
          <div style={s.stats}>
            <div style={s.statCard}><div style={s.statLbl}>Total</div><div style={s.statVal}>{users.length}</div></div>
            <div style={s.statCard}><div style={s.statLbl}>Actifs</div><div style={s.statVal}>{statActifs}</div></div>
            <div style={s.statCard}><div style={s.statLbl}>Sans service</div><div style={s.statVal}>{statSansService}</div></div>
            <div style={s.statCard}><div style={s.statLbl}>Services</div><div style={s.statVal}>{services.length}</div></div>
          </div>

          <div style={s.filters}>
            <select style={s.select} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="az">Nom A → Z</option>
              <option value="za">Nom Z → A</option>
            </select>
            <select style={s.select} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">Tous les rôles</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
            <select style={s.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <select style={s.select} value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
              <option value="all">Tous les services</option>
              <option value="none">Sans service</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
            <button style={{ ...s.btnSec, fontSize: "12px" }} onClick={() => { setSortOrder("az"); setRoleFilter("all"); setStatusFilter("all"); setServiceFilter("all") }}>↺ Réinitialiser</button>
            <div style={{ flex: 1 }} />
            <button style={s.btnPri} onClick={() => ouvrirFormulaireUser()}>+ Ajouter un utilisateur</button>
          </div>

          {showUserForm && (
            <div style={s.formPanel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "15px", fontWeight: 500 }}>{editUser ? "Modifier l'utilisateur" : "Créer un utilisateur"}</span>
                <button style={s.btnSm} onClick={() => setShowUserForm(false)}>✕</button>
              </div>
              {userError && <div style={s.error}>{userError}</div>}
              <div style={s.formGrid}>
                <div style={s.formGrp}><label style={s.formLbl}>Prénom</label><input style={s.formInp} value={userForm.prenom} onChange={e => setUserForm({...userForm, prenom: e.target.value})} placeholder="Prénom" /></div>
                <div style={s.formGrp}><label style={s.formLbl}>Nom</label><input style={s.formInp} value={userForm.nom} onChange={e => setUserForm({...userForm, nom: e.target.value})} placeholder="Nom" /></div>
                <div style={{ ...s.formGrp, gridColumn: "1/-1" }}><label style={s.formLbl}>Email</label><input style={s.formInp} type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="email@hopital.fr" /></div>
                <div style={s.formGrp}><label style={s.formLbl}>Rôle</label>
                  <select style={s.formInp} value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                  </select>
                </div>
                <div style={s.formGrp}><label style={s.formLbl}>Statut</label>
                  <select style={s.formInp} value={userForm.actif} onChange={e => setUserForm({...userForm, actif: e.target.value === "true"})}>
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>
                {!editUser && <>
                  <div style={s.formGrp}><label style={s.formLbl}>Mot de passe</label><input style={s.formInp} type="password" value={userForm.mot_de_passe} onChange={e => setUserForm({...userForm, mot_de_passe: e.target.value})} placeholder="Min. 8 caractères" /></div>
                  <div style={s.formGrp}><label style={s.formLbl}>Confirmer</label><input style={s.formInp} type="password" value={userForm.confirmer} onChange={e => setUserForm({...userForm, confirmer: e.target.value})} placeholder="Confirmer" /></div>
                </>}
                <div style={{ ...s.formGrp, gridColumn: "1/-1" }}>
                  <label style={s.formLbl}>Services associés <span style={{ fontWeight: 400, color: "#9ca3af" }}>(sélection multiple)</span></label>
                  <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", overflow: "hidden", maxHeight: "180px", overflowY: "auto" }}>
                    {services.length === 0
                      ? <div style={{ padding: "12px", fontSize: "13px", color: "#6b7280" }}>Aucun service disponible — créez-en un d'abord</div>
                      : services.map(sv => (
                        <div key={sv.id} style={s.svcOpt(userForm.service_ids.includes(sv.id))} onClick={() => toggleService(sv.id)}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: sv.couleur, display: "inline-block", flexShrink: 0 }}></span>
                          <span style={{ flex: 1 }}>{sv.nom}</span>
                          {userForm.service_ids.includes(sv.id) && <span style={{ color: "#2563eb", fontSize: "14px" }}>✓</span>}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
                <button style={s.btnSec} onClick={() => setShowUserForm(false)}>Annuler</button>
                <button style={s.btnPri} onClick={sauvegarderUser}>{editUser ? "Enregistrer" : "Créer l'utilisateur"}</button>
              </div>
            </div>
          )}

          <div style={s.card}>
            <div style={s.thead}>
              <span>Utilisateur</span><span>Email</span><span>Rôle</span><span>Services</span><span>Statut</span><span>Actions</span>
            </div>
            {filteredUsers.length === 0
              ? <div style={{ padding: "40px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>Aucun utilisateur trouvé</div>
              : filteredUsers.map(u => {
                const roleObj = roles.find(r => r.id === u.role); const role = roleObj ? { label: roleObj.nom, bg: roleObj.bg || "#f1f5f9", text: roleObj.couleur || "#475569" } : { label: u.role, bg: "#f1f5f9", text: "#475569" }
                const initials = `${u.prenom?.[0]||""}${u.nom?.[0]||""}`.toUpperCase()
                return (
                  <div key={u.id} style={s.trow}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: role.bg, color: role.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500, flexShrink: 0 }}>{initials}</div>
                      <span style={{ fontWeight: 500 }}>{u.prenom} {u.nom}</span>
                    </div>
                    <span style={{ color: "#6b7280", fontSize: "12px" }}>{u.email}</span>
                    <span style={s.badge(role.bg, role.text)}>{role.label}</span>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {(u.service_ids||[]).map(sid => {
                        const sv = services.find(x => x.id === sid)
                        if (!sv) return null
                        return <span key={sid} style={s.svcChip(sv.couleur)}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sv.couleur, display: "inline-block" }}></span>{sv.nom}</span>
                      })}
                      {!(u.service_ids||[]).length && <span style={{ color: "#9ca3af", fontSize: "11px" }}>—</span>}
                    </div>
                    <span style={s.badge(u.actif ? "#dcfce7" : "#f1f5f9", u.actif ? "#166534" : "#64748b")}>{u.actif ? "Actif" : "Inactif"}</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button style={s.btnSm} onClick={() => ouvrirFormulaireUser(u)}>✏️</button>
                      <button style={s.btnDanger} onClick={() => supprimerUser(u.id)}>🗑</button>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </>
      )}

      {/* ── ONGLET SERVICES ── */}
      {activeTab === "services" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button style={s.btnPri} onClick={() => ouvrirFormulaireService()}>+ Créer un service</button>
          </div>

          {showServiceForm && (
            <div style={s.formPanel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "15px", fontWeight: 500 }}>{editService ? "Modifier le service" : "Créer un service"}</span>
                <button style={s.btnSm} onClick={() => setShowServiceForm(false)}>✕</button>
              </div>
              {serviceError && <div style={s.error}>{serviceError}</div>}
              <div style={s.formGrid}>
                <div style={s.formGrp}><label style={s.formLbl}>Nom du service</label><input style={s.formInp} value={serviceForm.nom} onChange={e => setServiceForm({...serviceForm, nom: e.target.value})} placeholder="Ex. Bloc opératoire" /></div>
                <div style={s.formGrp}><label style={s.formLbl}>Description</label><input style={s.formInp} value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} placeholder="Description courte" /></div>
                <div style={{ ...s.formGrp, gridColumn: "1/-1" }}>
                  <label style={s.formLbl}>Couleur d'identification</label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                    {SERVICE_COLORS.map(c => <div key={c} style={s.colorSwatch(c, serviceForm.couleur===c)} onClick={() => setServiceForm({...serviceForm, couleur: c})} />)}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
                <button style={s.btnSec} onClick={() => setShowServiceForm(false)}>Annuler</button>
                <button style={s.btnPri} onClick={sauvegarderService}>{editService ? "Enregistrer" : "Créer le service"}</button>
              </div>
            </div>
          )}

          <div style={s.card}>
            {services.length === 0
              ? <div style={{ padding: "40px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>Aucun service créé — cliquez sur "Créer un service"</div>
              : services.map(sv => {
                const nbUsers = users.filter(u => (u.service_ids||[]).includes(sv.id)).length
                return (
                  <div key={sv.id} style={s.svcRow}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 500 }}>
                        <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: sv.couleur, display: "inline-block", flexShrink: 0 }}></span>
                        {sv.nom}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{sv.description} · {nbUsers} utilisateur(s)</div>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button style={s.btnSm} onClick={() => ouvrirFormulaireService(sv)}>✏️</button>
                      <button style={s.btnDanger} onClick={() => supprimerService(sv.id)}>🗑</button>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </>
      )}
    </div>
  )
}
