import { useState, useEffect } from "react"

const MODULES = [
  "Dashboard PCA",
  "Procédures",
  "Gestion de crise",
  "Continuité de service",
  "Contacts & ressources",
  "Gestion utilisateur",
  "Paramètres système",
]

const ACTIONS = ["lecture", "ecriture", "suppression", "administration"]
const ACTIONS_LABELS = { lecture: "Lecture", ecriture: "Écriture", suppression: "Suppression", administration: "Administration" }

const API_URL = "https://psychic-space-guide-r74pjwv5qw4pcxvr6-8000.app.github.dev"
function getToken() { return localStorage.getItem("token") || "" }

const PROFILS_DEFAUT = [
  { id: "super_admin", nom: "Super Administrateur", couleur: "#a32d2d", bg: "#fcebeb", systeme: true, description: "Accès complet à la plateforme", permissions: { "Dashboard PCA": ["lecture","ecriture","suppression","administration"], "Procédures": ["lecture","ecriture","suppression","administration"], "Gestion de crise": ["lecture","ecriture","suppression","administration"], "Continuité de service": ["lecture","ecriture","suppression","administration"], "Contacts & ressources": ["lecture","ecriture","suppression","administration"], "Gestion utilisateur": ["lecture","ecriture","suppression","administration"], "Paramètres système": ["lecture","ecriture","suppression","administration"] } },
  { id: "admin_org", nom: "Admin Organisation", couleur: "#1d4ed8", bg: "#dbeafe", systeme: true, description: "Responsable d'une entreprise cliente — gestion des utilisateurs et de la configuration", permissions: { "Dashboard PCA": ["lecture","ecriture"], "Procédures": ["lecture","ecriture","suppression"], "Gestion de crise": ["lecture","ecriture"], "Continuité de service": ["lecture","ecriture"], "Contacts & ressources": ["lecture","ecriture"], "Gestion utilisateur": ["lecture","ecriture","suppression"], "Paramètres système": [] } },
  { id: "bcm", nom: "Responsable BCM", couleur: "#166534", bg: "#dcfce7", systeme: true, description: "Création et gestion des plans PCA", permissions: { "Dashboard PCA": ["lecture","ecriture"], "Procédures": ["lecture","ecriture","suppression"], "Gestion de crise": ["lecture"], "Continuité de service": ["lecture","ecriture"], "Contacts & ressources": ["lecture","ecriture"], "Gestion utilisateur": [], "Paramètres système": [] } },
  { id: "it", nom: "Responsable IT", couleur: "#7e22ce", bg: "#f3e8ff", systeme: true, description: "Vision technique et gestion IT", permissions: { "Dashboard PCA": ["lecture"], "Procédures": ["lecture","ecriture"], "Gestion de crise": ["lecture"], "Continuité de service": ["lecture","ecriture"], "Contacts & ressources": ["lecture"], "Gestion utilisateur": [], "Paramètres système": ["lecture"] } },
  { id: "gestionnaire_crise", nom: "Gestionnaire de crise", couleur: "#856404", bg: "#fef3cd", systeme: true, description: "Pilotage des incidents en temps réel", permissions: { "Dashboard PCA": ["lecture"], "Procédures": ["lecture"], "Gestion de crise": ["lecture","ecriture","suppression"], "Continuité de service": ["lecture"], "Contacts & ressources": ["lecture"], "Gestion utilisateur": [], "Paramètres système": [] } },
  { id: "contributeur", nom: "Contributeur", couleur: "#475569", bg: "#f1f5f9", systeme: true, description: "Mise à jour des informations assignées", permissions: { "Dashboard PCA": ["lecture"], "Procédures": ["lecture"], "Gestion de crise": [], "Continuité de service": ["lecture"], "Contacts & ressources": ["lecture"], "Gestion utilisateur": [], "Paramètres système": [] } },
  { id: "auditeur", nom: "Auditeur", couleur: "#0369a1", bg: "#e0f2fe", systeme: true, description: "Lecture seule — audits ISO 22301, NIS2, DORA", permissions: { "Dashboard PCA": ["lecture"], "Procédures": ["lecture"], "Gestion de crise": ["lecture"], "Continuité de service": ["lecture"], "Contacts & ressources": ["lecture"], "Gestion utilisateur": [], "Paramètres système": [] } },
]

function permInitVide() {
  return Object.fromEntries(MODULES.map(m => [m, []]))
}

export default function RolesDroits() {
  const [profils, setProfils] = useState(PROFILS_DEFAUT)
  const [selectionId, setSelectionId] = useState("admin_org")

  useEffect(() => { chargerProfils() }, [])

  async function chargerProfils() {
    try {
      const res = await fetch(`${API_URL}/api/roles`, { headers: { Authorization: `Bearer ${getToken()}` } })
      if (res.ok) setProfils(await res.json())
    } catch {}
  }
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ nom: "", couleur: "#3b82f6", description: "", permissions: permInitVide() })
  const [erreur, setErreur] = useState("")

  const selection = profils.find(p => p.id === selectionId)

  function ouvrirNouveauProfil() {
    setEditId(null)
    setForm({ nom: "", couleur: "#3b82f6", description: "", permissions: permInitVide() })
    setErreur("")
    setShowForm(true)
  }

  function ouvrirEdition() {
    if (!selection) return
    setEditId(selection.id)
    setForm({ nom: selection.nom, couleur: selection.couleur, description: selection.description, permissions: JSON.parse(JSON.stringify(selection.permissions)) })
    setErreur("")
    setShowForm(true)
  }

  function togglePermission(module, action) {
    const perms = { ...form.permissions }
    const liste = perms[module] || []
    perms[module] = liste.includes(action) ? liste.filter(a => a !== action) : [...liste, action]
    setForm({ ...form, permissions: perms })
  }

  async function sauvegarder() {
    if (!form.nom.trim()) { setErreur("Le nom est obligatoire"); return }
    try {
      const method = editId ? "PUT" : "POST"
      const url = editId ? `${API_URL}/api/roles/${editId}` : `${API_URL}/api/roles`
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ nom: form.nom, description: form.description, couleur: form.couleur, bg: form.couleur + "22", permissions: form.permissions })
      })
      if (res.ok) {
        await chargerProfils()
        setShowForm(false)
      } else {
        setErreur("Erreur lors de la sauvegarde")
      }
    } catch { setErreur("Impossible de contacter le serveur") }
  }

  async function supprimer(id) {
    if (profils.find(p => p.id === id)?.systeme) return
    try {
      await fetch(`${API_URL}/api/roles/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } })
      await chargerProfils()
      setSelectionId(profils[0]?.id)
    } catch {}
  }

  const s = {
    badge: (bg, tc) => ({ display: "inline-block", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 500, background: bg, color: tc }),
    sysBadge: { fontSize: "10px", padding: "1px 6px", borderRadius: "20px", background: "#f3f4f6", color: "#6b7280" },
    customBadge: { fontSize: "10px", padding: "1px 6px", borderRadius: "20px", background: "#e1f5ee", color: "#0f6e56" },
    btn: { background: "#1a1f36", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", cursor: "pointer" },
    btnSec: { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", cursor: "pointer" },
    input: { width: "100%", height: "34px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "0 10px", fontSize: "13px", fontFamily: "Arial" },
  }

  if (showForm) {
    return (
      <div style={{ padding: "24px", background: "#f9fafb", minHeight: "60vh", fontFamily: "Arial" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button style={s.btnSec} onClick={() => setShowForm(false)}>← Retour</button>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "#111" }}>{editId ? "Modifier le profil" : "Nouveau profil"}</div>
        </div>

        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "20px", maxWidth: "720px" }}>
          {erreur && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px" }}>{erreur}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#374151", display: "block", marginBottom: "4px" }}>Nom du profil *</label>
              <input style={s.input} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex. Coordinateur terrain" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#374151", display: "block", marginBottom: "4px" }}>Couleur</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="color" value={form.couleur} onChange={e => setForm({ ...form, couleur: e.target.value })} style={{ width: "36px", height: "34px", border: "0.5px solid #d1d5db", borderRadius: "8px", cursor: "pointer", padding: "2px" }} />
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{form.couleur}</span>
              </div>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: "12px", color: "#374151", display: "block", marginBottom: "4px" }}>Description</label>
              <input style={s.input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description du rôle" />
            </div>
          </div>

          <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Permissions par module</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 8px", fontSize: "11px", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb", width: "200px" }}>Module</th>
                {ACTIONS.map(a => <th key={a} style={{ padding: "6px 8px", fontSize: "11px", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb", textAlign: "center" }}>{ACTIONS_LABELS[a]}</th>)}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(m => (
                <tr key={m}>
                  <td style={{ padding: "8px", borderBottom: "0.5px solid #f3f4f6", color: "#111" }}>{m}</td>
                  {ACTIONS.map(a => (
                    <td key={a} style={{ padding: "8px", borderBottom: "0.5px solid #f3f4f6", textAlign: "center" }}>
                      <input type="checkbox" checked={(form.permissions[m] || []).includes(a)} onChange={() => togglePermission(m, a)} style={{ cursor: "pointer", width: "15px", height: "15px" }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "14px", borderTop: "0.5px solid #f3f4f6" }}>
            <button style={s.btn} onClick={sauvegarder}>Enregistrer</button>
            <button style={s.btnSec} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "60vh", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 500, color: "#111" }}>Profils & droits</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{profils.length} profils · {profils.filter(p => p.systeme).length} système · {profils.filter(p => !p.systeme).length} personnalisé{profils.filter(p => !p.systeme).length > 1 ? "s" : ""}</div>
        </div>
        <button style={s.btn} onClick={ouvrirNouveauProfil}>+ Nouveau profil</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "16px" }}>
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "0.5px solid #e5e7eb", fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Profils</div>
          {profils.map(p => (
            <div key={p.id} onClick={() => setSelectionId(p.id)} style={{ padding: "10px 14px", borderBottom: "0.5px solid #f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: selectionId === p.id ? "#eff6ff" : "#fff", borderLeft: selectionId === p.id ? "2px solid #1a1f36" : "2px solid transparent" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.couleur, flexShrink: 0 }}></div>
              <div style={{ fontSize: "12px", fontWeight: selectionId === p.id ? 500 : 400, color: "#111", flex: 1 }}>{p.nom}</div>
              <span style={p.systeme ? s.sysBadge : s.customBadge}>{p.systeme ? "sys" : "custom"}</span>
            </div>
          ))}
        </div>

        {selection && (
          <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", paddingBottom: "14px", borderBottom: "0.5px solid #f3f4f6" }}>
              <div>
                <span style={s.badge(selection.bg, selection.couleur)}>{selection.nom}</span>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>{selection.description}</div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button style={s.btnSec} onClick={ouvrirEdition}>✏️ Modifier</button>
                {!selection.systeme && <button style={{ ...s.btnSec, color: "#991b1b", background: "#fee2e2" }} onClick={() => supprimer(selection.id)}>🗑 Supprimer</button>}
              </div>
            </div>

            <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Permissions par module</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontSize: "11px", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb", width: "180px" }}>Module</th>
                  {ACTIONS.map(a => <th key={a} style={{ padding: "6px 8px", fontSize: "11px", color: "#6b7280", borderBottom: "0.5px solid #e5e7eb", textAlign: "center" }}>{ACTIONS_LABELS[a]}</th>)}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(m => (
                  <tr key={m}>
                    <td style={{ padding: "8px", borderBottom: "0.5px solid #f3f4f6", color: "#111" }}>{m}</td>
                    {ACTIONS.map(a => (
                      <td key={a} style={{ padding: "8px", borderBottom: "0.5px solid #f3f4f6", textAlign: "center" }}>
                        {(selection.permissions[m] || []).includes(a)
                          ? <span style={{ color: "#166534", fontSize: "16px" }}>✓</span>
                          : <span style={{ color: "#d1d5db", fontSize: "16px" }}>—</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
