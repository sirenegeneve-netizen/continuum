import { useState, useEffect } from "react"

const SYSTEMES = [
  { nom: "ERP", statut: "indisponible" },
  { nom: "CRM", statut: "indisponible" },
  { nom: "Messagerie", statut: "degrade" },
  { nom: "Intranet", statut: "operationnel" },
  { nom: "VPN", statut: "operationnel" },
]

const STATUT_STYLE = {
  indisponible: { bg: "#fee2e2", text: "#991b1b", label: "Indisponible" },
  degrade: { bg: "#fef3cd", text: "#856404", label: "Dégradé" },
  operationnel: { bg: "#dcfce7", text: "#166534", label: "Opérationnel" },
}

const GRAVITE_STYLE = {
  critique: { bg: "#fee2e2", text: "#991b1b", label: "Critique" },
  majeur: { bg: "#ffedd5", text: "#c2410c", label: "Majeur" },
  mineur: { bg: "#fef9c3", text: "#854d0e", label: "Mineur" },
}

const INCIDENT_DEFAUT = {
  titre: "ERP indisponible",
  date: "2025-06-12",
  heure: "08:14",
  gravite: "critique",
  description: "L'ERP principal est inaccessible depuis 08h14. Impact sur la production et la comptabilité."
}

const TACHES_DEFAUT = [
  { id: "1", texte: "Activer la cellule de crise", fait: true, responsable: "Directeur MIS" },
  { id: "2", texte: "Notifier les équipes impactées", fait: true, responsable: "RH / Direction" },
  { id: "3", texte: "Contacter le prestataire ERP", fait: false, responsable: "Admin Système" },
  { id: "4", texte: "Préparer communication externe", fait: false, responsable: "Chargé communication" },
]

const CHRONOLOGIE_DEFAUT = [
  { id: "1", heure: "08:14", texte: "Détection de l'incident — ERP inaccessible", type: "alerte" },
  { id: "2", heure: "08:22", texte: "Cellule de crise activée", type: "action" },
  { id: "3", heure: "08:45", texte: "CRM identifié comme affecté", type: "alerte" },
  { id: "4", heure: "09:10", texte: "Prestataire ERP contacté", type: "action" },
]

function chargerDepuisStorage(cle, defaut) {
  try {
    const val = localStorage.getItem(cle)
    return val ? JSON.parse(val) : defaut
  } catch { return defaut }
}

export default function Incident() {
  const [incident, setIncident] = useState(() => chargerDepuisStorage("incident", INCIDENT_DEFAUT))
  const [taches, setTaches] = useState(() => chargerDepuisStorage("incident_taches", TACHES_DEFAUT))
  const [chronologie, setChronologie] = useState(() => chargerDepuisStorage("incident_chronologie", CHRONOLOGIE_DEFAUT))
  const [showForm, setShowForm] = useState(false)
  const [formTemp, setFormTemp] = useState(incident)
  const [nouvelleTache, setNouvelleTache] = useState("")
  const [nouvelEvenement, setNouvelEvenement] = useState("")

  function enregistrerIncident() {
    setIncident(formTemp)
    localStorage.setItem("incident", JSON.stringify(formTemp))
    setShowForm(false)
  }

  function toggleTache(id) {
    const maj = taches.map(t => t.id === id ? { ...t, fait: !t.fait } : t)
    setTaches(maj)
    localStorage.setItem("incident_taches", JSON.stringify(maj))
  }

  function ajouterTache() {
    if (!nouvelleTache) return
    const maj = [...taches, { id: Date.now().toString(), texte: nouvelleTache, fait: false, responsable: "À assigner" }]
    setTaches(maj)
    localStorage.setItem("incident_taches", JSON.stringify(maj))
    setNouvelleTache("")
  }

  function ajouterEvenement() {
    if (!nouvelEvenement) return
    const now = new Date()
    const heure = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const maj = [...chronologie, { id: Date.now().toString(), heure, texte: nouvelEvenement, type: "action" }]
    setChronologie(maj)
    localStorage.setItem("incident_chronologie", JSON.stringify(maj))
    setNouvelEvenement("")
  }

  const tachesFaites = taches.filter(t => t.fait).length
  const gravite = GRAVITE_STYLE[incident.gravite]

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh", fontFamily: "Arial" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 500, color: "#111" }}>Incident en cours</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>Depuis le {incident.date} à {incident.heure}</div>
        </div>
        <button onClick={() => { setFormTemp(incident); setShowForm(!showForm) }} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>
          ✏️ Modifier l'incident
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "16px" }}>Détails de l'incident</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#374151", display: "block", marginBottom: "4px" }}>Titre</label>
              <input value={formTemp.titre} onChange={e => setFormTemp({ ...formTemp, titre: e.target.value })} style={{ width: "100%", height: "34px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "0 10px", fontSize: "13px" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#374151", display: "block", marginBottom: "4px" }}>Gravité</label>
              <select value={formTemp.gravite} onChange={e => setFormTemp({ ...formTemp, gravite: e.target.value })} style={{ width: "100%", height: "34px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "0 10px", fontSize: "13px" }}>
                <option value="critique">🔴 Critique</option>
                <option value="majeur">🟠 Majeur</option>
                <option value="mineur">🟡 Mineur</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#374151", display: "block", marginBottom: "4px" }}>Date</label>
              <input type="date" value={formTemp.date} onChange={e => setFormTemp({ ...formTemp, date: e.target.value })} style={{ width: "100%", height: "34px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "0 10px", fontSize: "13px" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#374151", display: "block", marginBottom: "4px" }}>Heure</label>
              <input type="time" value={formTemp.heure} onChange={e => setFormTemp({ ...formTemp, heure: e.target.value })} style={{ width: "100%", height: "34px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "0 10px", fontSize: "13px" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#374151", display: "block", marginBottom: "4px" }}>Description</label>
            <textarea value={formTemp.description} onChange={e => setFormTemp({ ...formTemp, description: e.target.value })} style={{ width: "100%", height: "80px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", resize: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={enregistrerIncident} style={{ background: "#1a1f36", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", cursor: "pointer" }}>Enregistrer</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", border: `1px solid ${gravite.text}`, borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 500, color: gravite.text }}>🚨 {incident.titre}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{incident.description}</div>
          </div>
          <span style={{ background: gravite.bg, color: gravite.text, fontSize: "11px", padding: "4px 10px", borderRadius: "20px", fontWeight: 500 }}>
            {gravite.label}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginBottom: "14px" }}>🖥️ Statut des systèmes</div>
          {SYSTEMES.map(s => (
            <div key={s.nom} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid #f3f4f6" }}>
              <div style={{ fontSize: "13px", color: "#111" }}>{s.nom}</div>
              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: 500, background: STATUT_STYLE[s.statut].bg, color: STATUT_STYLE[s.statut].text }}>
                {STATUT_STYLE[s.statut].label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginBottom: "8px" }}>✅ Tâches ({tachesFaites}/{taches.length})</div>
          <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", marginBottom: "14px" }}>
            <div style={{ height: "6px", background: "#16a34a", borderRadius: "3px", width: `${taches.length ? (tachesFaites / taches.length) * 100 : 0}%`, transition: "width 0.3s" }}></div>
          </div>
          {taches.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: "0.5px solid #f3f4f6" }}>
              <input type="checkbox" checked={t.fait} onChange={() => toggleTache(t.id)} style={{ cursor: "pointer" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", color: t.fait ? "#9ca3af" : "#111", textDecoration: t.fait ? "line-through" : "none" }}>{t.texte}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>{t.responsable}</div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <input value={nouvelleTache} onChange={e => setNouvelleTache(e.target.value)} onKeyDown={e => e.key === "Enter" && ajouterTache()} placeholder="Nouvelle tâche..." style={{ flex: 1, height: "32px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "0 10px", fontSize: "12px" }} />
            <button onClick={ajouterTache} style={{ background: "#1a1f36", color: "#fff", border: "none", borderRadius: "8px", padding: "0 12px", fontSize: "12px", cursor: "pointer" }}>+</button>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginBottom: "14px" }}>📋 Chronologie</div>
        {chronologie.map(e => (
          <div key={e.id} style={{ display: "flex", gap: "12px", padding: "8px 0", borderBottom: "0.5px solid #f3f4f6" }}>
            <div style={{ fontSize: "12px", color: "#9ca3af", fontFamily: "monospace", flexShrink: 0, width: "40px" }}>{e.heure}</div>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: e.type === "alerte" ? "#c0392b" : "#4f8ef7", marginTop: "4px", flexShrink: 0 }}></div>
            <div style={{ fontSize: "12px", color: "#111" }}>{e.texte}</div>
          </div>
        ))}
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <input value={nouvelEvenement} onChange={e => setNouvelEvenement(e.target.value)} onKeyDown={e => e.key === "Enter" && ajouterEvenement()} placeholder="Ajouter un événement..." style={{ flex: 1, height: "32px", border: "0.5px solid #d1d5db", borderRadius: "8px", padding: "0 10px", fontSize: "12px" }} />
          <button onClick={ajouterEvenement} style={{ background: "#1a1f36", color: "#fff", border: "none", borderRadius: "8px", padding: "0 12px", fontSize: "12px", cursor: "pointer" }}>+</button>
        </div>
      </div>
    </div>
  )
}
