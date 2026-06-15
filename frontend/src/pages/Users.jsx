import { useState, useEffect } from "react"

const API_URL = "https://psychic-space-guide-r74pjwv5qw4pcxvr6-8000.app.github.dev"

const ROLES = {
  super_admin: { label: "Super Administrateur", color: "#fee2e2", text: "#991b1b" },
  admin_org: { label: "Administrateur Organisation", color: "#dbeafe", text: "#1d4ed8" },
  bcm: { label: "Responsable Continuité", color: "#dcfce7", text: "#166534" },
  it: { label: "Responsable Informatique", color: "#f3e8ff", text: "#7e22ce" },
  gestionnaire_crise: { label: "Gestionnaire de Crise", color: "#fef3cd", text: "#856404" },
  contributeur: { label: "Contributeur", color: "#f1f5f9", text: "#475569" },
  auditeur: { label: "Auditeur", color: "#e0f2fe", text: "#0369a1" },
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [erreur, setErreur] = useState("")
  const [editUser, setEditUser] = useState(null)

  // 🔍 FILTRES
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("az")

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
    confirmer: "",
    role: "contributeur"
  })

  useEffect(() => {
    chargerUsers()
  }, [])

  async function chargerUsers() {
    const token = localStorage.getItem("token")

    const res = await fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
  }

  function openEdit(user) {
    setEditUser(user)

    setForm({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      mot_de_passe: "",
      confirmer: "",
      role: user.role || "contributeur"
    })

    setShowForm(true)
  }

  function resetForm() {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      mot_de_passe: "",
      confirmer: "",
      role: "contributeur"
    })

    setEditUser(null)
    setShowForm(false)
    setErreur("")
  }

  async function ajouterUser() {
    setErreur("")

    if (!form.nom || !form.prenom || !form.email || !form.mot_de_passe) {
      setErreur("Tous les champs sont obligatoires")
      return
    }

    if (form.mot_de_passe.length < 8) {
      setErreur("Mot de passe trop court")
      return
    }

    if (form.mot_de_passe !== form.confirmer) {
      setErreur("Les mots de passe ne correspondent pas")
      return
    }

    const token = localStorage.getItem("token")

    const res = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        mot_de_passe: form.mot_de_passe,
        role: form.role
      })
    })

    if (!res.ok) {
      const data = await res.json()
      setErreur(data.detail || "Erreur création")
      return
    }

    resetForm()
    chargerUsers()
  }

  async function modifierUser() {
    const token = localStorage.getItem("token")

    const res = await fetch(`${API_URL}/api/users/${editUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        role: form.role
      })
    })

    if (!res.ok) {
      const data = await res.json()
      setErreur(data.detail || "Erreur modification")
      return
    }

    resetForm()
    chargerUsers()
  }

  async function supprimerUser(id) {
    const confirmDelete = window.confirm("⚠️ Confirmer la suppression ?")
    if (!confirmDelete) return

    const token = localStorage.getItem("token")

    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      alert("Erreur suppression")
      return
    }

    chargerUsers()
  }

  // 🔍 FILTRAGE + TRI
  const filteredUsers = users
    .filter(u => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      if (statusFilter === "active" && !u.actif) return false
      if (statusFilter === "inactive" && u.actif) return false
      return true
    })
    .sort((a, b) => {
      const nameA = `${a.nom} ${a.prenom}`.toLowerCase()
      const nameB = `${b.nom} ${b.prenom}`.toLowerCase()

      if (sortOrder === "az") return nameA.localeCompare(nameB)
      if (sortOrder === "za") return nameB.localeCompare(nameA)

      return 0
    })

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh", fontFamily: "Arial" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 500 }}>Gestion des utilisateurs</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {users.length} utilisateur(s)
          </div>
        </div>

        <button
          onClick={() => {
            setShowForm(true)
            setEditUser(null)
          }}
          style={{
            background: "#1a1f36",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer"
          }}
        >
          + Ajouter
        </button>
      </div>

      {/* FILTRES */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "11px", flexWrap: "wrap" }}>

        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="az">Nom A → Z</option>
          <option value="za">Nom Z → A</option>
        </select>

        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">Tous rôles</option>
          {Object.keys(ROLES).map(r => (
            <option key={r} value={r}>{ROLES[r].label}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>

        <button
          onClick={() => {
            setRoleFilter("all")
            setStatusFilter("all")
            setSortOrder("az")
          }}
        >
          Reset
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div style={{ background: "#fff", padding: "20px", marginBottom: "20px" }}>
          <div style={{ marginBottom: "10px" }}>
            {editUser ? "Modifier utilisateur" : "Créer utilisateur"}
          </div>

          {erreur && <div style={{ color: "red" }}>{erreur}</div>}

          <input placeholder="Prénom" value={form.prenom}
            onChange={e => setForm({ ...form, prenom: e.target.value })} />

          <input placeholder="Nom" value={form.nom}
            onChange={e => setForm({ ...form, nom: e.target.value })} />

          <input placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} />

          <select value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}>
            {Object.keys(ROLES).map(r => (
              <option key={r} value={r}>{ROLES[r].label}</option>
            ))}
          </select>

          <div>
            <button onClick={editUser ? modifierUser : ajouterUser}>
              {editUser ? "Modifier" : "Créer"}
            </button>

            <button onClick={resetForm}>Annuler</button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <table style={{ width: "100%", background: "#fff" }}>
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map(u => (
            <tr key={u.id}>

              <td>{u.prenom} {u.nom}</td>
              <td>{u.email}</td>

              <td>
                <span style={{ color: ROLES[u.role]?.text }}>
                  {ROLES[u.role]?.label}
                </span>
              </td>

              <td>{u.actif ? "Actif" : "Inactif"}</td>

              <td>
                <button onClick={() => openEdit(u)}>Modifier</button>
                <button onClick={() => supprimerUser(u.id)}>Supprimer</button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}