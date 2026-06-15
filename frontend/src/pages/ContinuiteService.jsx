import { useState, useEffect, useRef } from "react"

const API_URL = "https://psychic-space-guide-r74pjwv5qw4pcxvr6-8000.app.github.dev"

const TYPES_CONNECTEUR = {
  jira:   { label: "Jira",    couleur: "#0052cc", icon: "📋" },
  erp:    { label: "ERP",     couleur: "#f59e0b", icon: "🏭" },
  dpi:    { label: "DPI",     couleur: "#10b981", icon: "🏥" },
  custom: { label: "Personnalisé", couleur: "#8b5cf6", icon: "⚙️" },
}

const CHAMPS_PREDEFINIS = {
  jira:   [
    { id: "reference", label: "Référence", type: "text" },
    { id: "description", label: "Description", type: "textarea" },
    { id: "priorite", label: "Priorité", type: "text" },
    { id: "assignee", label: "Assigné à", type: "text" },
    { id: "statut", label: "Statut", type: "text" },
  ],
  erp:    [
    { id: "reference", label: "Référence", type: "text" },
    { id: "libelle", label: "Libellé", type: "text" },
    { id: "quantite", label: "Quantité", type: "text" },
    { id: "fournisseur", label: "Fournisseur", type: "text" },
    { id: "statut", label: "Statut", type: "text" },
  ],
  dpi:    [
    { id: "id_patient", label: "ID Patient", type: "text" },
    { id: "nom_patient", label: "Nom patient", type: "text" },
    { id: "constantes", label: "Constantes", type: "textarea" },
    { id: "prescriptions", label: "Prescriptions en cours", type: "textarea" },
    { id: "plan_soins", label: "Plan de soins", type: "textarea" },
  ],
  custom: [],
}

function getToken() { return localStorage.getItem("token") || "" }
function getRole()  { return localStorage.getItem("role")  || "" }

const ROLES_ADMIN = ["super_admin", "admin_org", "bcm"]
function estAdmin() { return ROLES_ADMIN.includes(getRole()) }

export default function ContinuiteService() {
  const [connecteurs, setConnecteurs]       = useState([])
  const [services, setServices]             = useState([])
  const [connecteurActif, setConnecteurActif] = useState(null)
  const [enregistrements, setEnregistrements] = useState([])
  const [vue, setVue]                       = useState("liste") // liste | detail | connecteur-form
  const [ligneOuverte, setLigneOuverte]     = useState(null)
  const [historique, setHistorique]         = useState([])
  const [commentaires, setCommentaires]     = useState([])
  const [nouveauCommentaire, setNouveauCommentaire] = useState("")
  const [champEnEdition, setChampEnEdition] = useState(null)
  const [valeurEdition, setValeurEdition]   = useState("")
  const [ongletDetail, setOngletDetail]     = useState("donnees")
  const [loading, setLoading]               = useState(false)
  const [message, setMessage]               = useState("")
  const fichierRef = useRef()

  // Formulaire connecteur
  const [formConn, setFormConn] = useState({ nom:"", type:"jira", description:"", service_id:"", champs:[], mode_import:"fichier" })
  const [editConnId, setEditConnId] = useState(null)
  const [errConn, setErrConn] = useState("")

  useEffect(() => { chargerConnecteurs(); chargerServices() }, [])

  async function api(path, opts={}) {
    const res = await fetch(`${API_URL}/api${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json", ...(opts.headers||{}) }
    })
    if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Erreur") }
    return res.json()
  }

  async function chargerConnecteurs() {
    try { setConnecteurs(await api("/connecteurs")) } catch {}
  }

  async function chargerServices() {
    try { setServices(await api("/services")) } catch {}
  }

  async function ouvrirConnecteur(c) {
    setConnecteurActif(c)
    setLigneOuverte(null)
    setLoading(true)
    try {
      const data = await api(`/connecteurs/${c.id}/enregistrements`)
      setEnregistrements(data)
    } catch {}
    setLoading(false)
    setVue("detail")
  }

  async function ouvrirLigne(e) {
    setLigneOuverte(e)
    setOngletDetail("donnees")
    setChampEnEdition(null)
    const [hist, comms] = await Promise.all([
      api(`/enregistrements/${e.id}/historique`),
      api(`/enregistrements/${e.id}/commentaires`)
    ])
    setHistorique(hist)
    setCommentaires(comms)
  }

  async function sauvegarderChamp(enrId, champId) {
    try {
      await api(`/enregistrements/${enrId}/champ`, {
        method: "PUT",
        body: JSON.stringify({ champ: champId, valeur: valeurEdition })
      })
      setEnregistrements(enregistrements.map(e =>
        e.id === enrId ? { ...e, donnees: { ...e.donnees, [champId]: valeurEdition } } : e
      ))
      if (ligneOuverte?.id === enrId) {
        setLigneOuverte({ ...ligneOuverte, donnees: { ...ligneOuverte.donnees, [champId]: valeurEdition } })
        const hist = await api(`/enregistrements/${enrId}/historique`)
        setHistorique(hist)
      }
      setChampEnEdition(null)
      afficherMessage("✓ Modification enregistrée")
    } catch(e) { afficherMessage("Erreur : " + e.message) }
  }

  async function ajouterCommentaire(enrId) {
    if (!nouveauCommentaire.trim()) return
    try {
      await api(`/enregistrements/${enrId}/commentaires`, {
        method: "POST",
        body: JSON.stringify({ texte: nouveauCommentaire })
      })
      const comms = await api(`/enregistrements/${enrId}/commentaires`)
      setCommentaires(comms)
      setNouveauCommentaire("")
    } catch(e) { afficherMessage("Erreur : " + e.message) }
  }

  async function importerFichier(fichier) {
    const formData = new FormData()
    formData.append("fichier", fichier)
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/connecteurs/${connecteurActif.id}/importer-fichier`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.detail)
      afficherMessage("✓ " + d.message)
      const data = await api(`/connecteurs/${connecteurActif.id}/enregistrements`)
      setEnregistrements(data)
    } catch(e) { afficherMessage("Erreur : " + e.message) }
    setLoading(false)
  }

  async function exporterConnecteur() {
    try {
      const data = await api(`/connecteurs/${connecteurActif.id}/exporter`)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a"); a.href = url
      a.download = `export_${connecteurActif.nom}_${new Date().toISOString().slice(0,10)}.json`
      a.click()
    } catch(e) { afficherMessage("Erreur export : " + e.message) }
  }

  async function sauvegarderConnecteur() {
    setErrConn("")
    if (!formConn.nom) { setErrConn("Le nom est obligatoire"); return }
    if (!formConn.champs.length) { setErrConn("Ajoutez au moins un champ"); return }
    const body = {
      ...formConn,
      service_id: formConn.service_id ? parseInt(formConn.service_id) : null,
      champs: formConn.champs
    }
    try {
      if (editConnId) await api(`/connecteurs/${editConnId}`, { method: "PUT", body: JSON.stringify(body) })
      else await api("/connecteurs", { method: "POST", body: JSON.stringify(body) })
      await chargerConnecteurs()
      setVue("liste")
      setEditConnId(null)
    } catch(e) { setErrConn(e.message) }
  }

  async function supprimerConnecteur(id) {
    if (!confirm("Supprimer ce connecteur et toutes ses données ?")) return
    try { await api(`/connecteurs/${id}`, { method: "DELETE" }); chargerConnecteurs() }
    catch(e) { afficherMessage("Erreur : " + e.message) }
  }

  function ouvrirFormulaireConnecteur(c=null) {
    setEditConnId(c?.id || null)
    setErrConn("")
    if (c) {
      setFormConn({ nom:c.nom, type:c.type, description:c.description||"", service_id:c.service_id||"", champs:c.champs||[], mode_import:c.mode_import||"fichier" })
    } else {
      setFormConn({ nom:"", type:"jira", description:"", service_id:"", champs: CHAMPS_PREDEFINIS["jira"], mode_import:"fichier" })
    }
    setVue("connecteur-form")
  }

  function changerTypeConnecteur(type) {
    setFormConn({ ...formConn, type, champs: CHAMPS_PREDEFINIS[type] || [] })
  }

  function ajouterChamp() {
    setFormConn({ ...formConn, champs: [...formConn.champs, { id: `champ_${Date.now()}`, label: "", type: "text" }] })
  }

  function modifierChampForm(idx, key, val) {
    const champs = [...formConn.champs]
    champs[idx] = { ...champs[idx], [key]: val }
    setFormConn({ ...formConn, champs })
  }

  function supprimerChampForm(idx) {
    setFormConn({ ...formConn, champs: formConn.champs.filter((_,i) => i !== idx) })
  }

  function afficherMessage(msg) {
    setMessage(msg)
    setTimeout(() => setMessage(""), 3000)
  }

  function formatDate(d) {
    if (!d) return ""
    return new Date(d).toLocaleString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })
  }

  const s = {
    page:     { padding:"24px", background:"#f9fafb", minHeight:"100vh", fontFamily:"Arial, sans-serif" },
    topbar:   { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" },
    title:    { fontSize:"18px", fontWeight:500 },
    sub:      { fontSize:"12px", color:"#6b7280", marginTop:"2px" },
    btnPri:   { background:"#1a1f36", color:"#fff", border:"none", borderRadius:"8px", padding:"8px 16px", cursor:"pointer", fontSize:"13px" },
    btnSec:   { background:"#fff", color:"#374151", border:"1px solid #d1d5db", borderRadius:"8px", padding:"7px 14px", cursor:"pointer", fontSize:"13px" },
    btnSm:    { background:"#fff", border:"1px solid #e5e7eb", borderRadius:"6px", padding:"4px 10px", cursor:"pointer", fontSize:"12px" },
    btnDanger:{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:"6px", padding:"4px 10px", cursor:"pointer", fontSize:"12px", color:"#dc2626" },
    btnGhost: { background:"none", border:"none", cursor:"pointer", fontSize:"13px", color:"#6b7280", padding:"4px 8px" },
    card:     { background:"#fff", border:"1px solid #e5e7eb", borderRadius:"12px", overflow:"hidden", marginBottom:"12px" },
    grid:     { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:"16px", marginBottom:"20px" },
    connCard: (actif) => ({ background:"#fff", border:`1.5px solid ${actif?"#1a1f36":"#e5e7eb"}`, borderRadius:"12px", padding:"16px", cursor:"pointer", transition:"box-shadow .15s" }),
    badge:    (bg,txt) => ({ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:"20px", fontSize:"11px", fontWeight:500, background:bg, color:txt }),
    tab:      (a) => ({ padding:"8px 16px", fontSize:"13px", cursor:"pointer", border:"none", background:"none", color:a?"#111":"#6b7280", fontWeight:a?600:400, borderBottom:a?"2px solid #111":"2px solid transparent" }),
    formPanel:{ background:"#fff", border:"1px solid #d1d5db", borderRadius:"12px", padding:"24px", maxWidth:"680px" },
    formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" },
    formGrp:  { display:"flex", flexDirection:"column", gap:"4px" },
    formLbl:  { fontSize:"12px", fontWeight:500, color:"#6b7280" },
    formInp:  { fontSize:"13px", padding:"8px 10px", borderRadius:"8px", border:"1px solid #d1d5db", fontFamily:"Arial" },
    error:    { color:"#dc2626", fontSize:"12px", padding:"8px 12px", background:"#fef2f2", borderRadius:"8px", marginBottom:"12px" },
    toast:    { position:"fixed", bottom:"24px", right:"24px", background:"#1a1f36", color:"#fff", padding:"10px 18px", borderRadius:"8px", fontSize:"13px", zIndex:999 },
    trow:     { display:"grid", gap:"8px", padding:"10px 16px", borderBottom:"1px solid #f3f4f6", fontSize:"13px", alignItems:"center", cursor:"pointer" },
    thead:    { display:"grid", gap:"8px", padding:"10px 16px", fontSize:"11px", fontWeight:600, color:"#6b7280", textTransform:"uppercase", borderBottom:"1px solid #e5e7eb", background:"#f9fafb" },
    panelRight:{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:"12px", padding:"20px", marginTop:"16px" },
    histRow:  { padding:"10px 0", borderBottom:"1px solid #f3f4f6", fontSize:"12px" },
    commRow:  { padding:"10px 0", borderBottom:"1px solid #f3f4f6" },
  }

  const champsActifs = connecteurActif ? (connecteurActif.champs || []) : []
  const colTemplate = `repeat(${Math.min(champsActifs.length, 4)}, 1fr) 80px`

  return (
    <div style={s.page}>
      {message && <div style={s.toast}>{message}</div>}

      {/* ── LISTE DES CONNECTEURS ── */}
      {vue === "liste" && (
        <>
          <div style={s.topbar}>
            <div>
              <div style={s.title}>Continuité de service</div>
              <div style={s.sub}>{connecteurs.length} connecteur(s) configuré(s)</div>
            </div>
            {estAdmin() && <button style={s.btnPri} onClick={() => ouvrirFormulaireConnecteur()}>+ Nouveau connecteur</button>}
          </div>

          {connecteurs.length === 0
            ? <div style={{ ...s.card, padding:"48px", textAlign:"center", color:"#6b7280" }}>
                <div style={{ fontSize:"32px", marginBottom:"12px" }}>🔌</div>
                <div style={{ fontWeight:500, marginBottom:"6px" }}>Aucun connecteur configuré</div>
                <div style={{ fontSize:"13px" }}>
                  {estAdmin() ? 'Cliquez sur "+ Nouveau connecteur" pour commencer' : "Contactez un administrateur"}
                </div>
              </div>
            : <div style={s.grid}>
                {connecteurs.map(c => {
                  const type = TYPES_CONNECTEUR[c.type] || TYPES_CONNECTEUR.custom
                  const svc = services.find(s => s.id === c.service_id)
                  return (
                    <div key={c.id} style={s.connCard(false)} onClick={() => ouvrirConnecteur(c)}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <span style={{ fontSize:"20px" }}>{type.icon}</span>
                          <div>
                            <div style={{ fontWeight:500, fontSize:"14px" }}>{c.nom}</div>
                            <span style={s.badge(type.couleur+"18", type.couleur)}>{type.label}</span>
                          </div>
                        </div>
                        {estAdmin() && (
                          <div style={{ display:"flex", gap:"4px" }} onClick={e => e.stopPropagation()}>
                            <button style={s.btnSm} onClick={() => ouvrirFormulaireConnecteur(c)}>✏️</button>
                            <button style={s.btnDanger} onClick={() => supprimerConnecteur(c.id)}>🗑</button>
                          </div>
                        )}
                      </div>
                      {c.description && <div style={{ fontSize:"12px", color:"#6b7280", marginBottom:"8px" }}>{c.description}</div>}
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"11px", color:"#9ca3af", marginTop:"8px" }}>
                        <span>{c.nb_enregistrements} enregistrement(s)</span>
                        <span>{svc ? `🏷 ${svc.nom}` : "🌐 Global"}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
          }
        </>
      )}

      {/* ── DETAIL CONNECTEUR ── */}
      {vue === "detail" && connecteurActif && (
        <>
          <div style={s.topbar}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <button style={s.btnGhost} onClick={() => { setVue("liste"); setLigneOuverte(null) }}>← Retour</button>
              <div>
                <div style={s.title}>{TYPES_CONNECTEUR[connecteurActif.type]?.icon} {connecteurActif.nom}</div>
                <div style={s.sub}>{enregistrements.length} enregistrement(s)</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              {estAdmin() && (
                <>
                  <button style={s.btnSec} onClick={() => fichierRef.current.click()}>⬆ Importer fichier</button>
                  <input ref={fichierRef} type="file" accept=".csv,.json" style={{ display:"none" }} onChange={e => { if(e.target.files[0]) importerFichier(e.target.files[0]) }} />
                </>
              )}
              <button style={s.btnSec} onClick={exporterConnecteur}>⬇ Exporter JSON</button>
            </div>
          </div>

          {loading && <div style={{ textAlign:"center", padding:"20px", color:"#6b7280" }}>Chargement...</div>}

          {!loading && enregistrements.length === 0 && (
            <div style={{ ...s.card, padding:"40px", textAlign:"center", color:"#6b7280" }}>
              <div style={{ fontSize:"28px", marginBottom:"8px" }}>📭</div>
              <div>Aucun enregistrement — importez un fichier CSV/JSON ou ajoutez manuellement</div>
            </div>
          )}

          {!loading && enregistrements.length > 0 && (
            <div style={s.card}>
              <div style={{ ...s.thead, gridTemplateColumns: colTemplate }}>
                {champsActifs.slice(0,4).map(ch => <span key={ch.id}>{ch.label}</span>)}
                <span>Actions</span>
              </div>
              {enregistrements.map(e => (
                <div key={e.id} style={{ ...s.trow, gridTemplateColumns: colTemplate, background: ligneOuverte?.id===e.id?"#f0f9ff":"#fff" }}
                  onClick={() => ligneOuverte?.id===e.id ? setLigneOuverte(null) : ouvrirLigne(e)}>
                  {champsActifs.slice(0,4).map(ch => (
                    <span key={ch.id} style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"#374151" }}>
                      {(e.donnees||{})[ch.id] || <span style={{ color:"#d1d5db" }}>—</span>}
                    </span>
                  ))}
                  <div style={{ display:"flex", gap:"4px" }}>
                    <span style={{ fontSize:"11px", color:"#6b7280" }}>
                      {e.nb_modifications > 0 && `✏️${e.nb_modifications}`}
                      {e.nb_commentaires > 0 && ` 💬${e.nb_commentaires}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PANNEAU LIGNE OUVERTE */}
          {ligneOuverte && (
            <div style={s.panelRight}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
                <span style={{ fontWeight:500 }}>Détail de l'enregistrement #{ligneOuverte.id}</span>
                <button style={s.btnGhost} onClick={() => setLigneOuverte(null)}>✕</button>
              </div>

              <div style={{ display:"flex", gap:"4px", borderBottom:"1px solid #e5e7eb", marginBottom:"16px" }}>
                {["donnees","historique","commentaires"].map(t => (
                  <button key={t} style={s.tab(ongletDetail===t)} onClick={() => setOngletDetail(t)}>
                    {t==="donnees"?"📝 Données":t==="historique"?"🕐 Historique":"💬 Commentaires"}
                    {t==="historique" && historique.length>0 && ` (${historique.length})`}
                    {t==="commentaires" && commentaires.length>0 && ` (${commentaires.length})`}
                  </button>
                ))}
              </div>

              {/* DONNÉES */}
              {ongletDetail === "donnees" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {champsActifs.map(ch => {
                    const enEdition = champEnEdition === `${ligneOuverte.id}_${ch.id}`
                    const valeur = (ligneOuverte.donnees||{})[ch.id] || ""
                    return (
                      <div key={ch.id} style={{ borderBottom:"1px solid #f3f4f6", paddingBottom:"12px" }}>
                        <div style={{ fontSize:"11px", fontWeight:500, color:"#6b7280", marginBottom:"4px", textTransform:"uppercase" }}>{ch.label}</div>
                        {enEdition ? (
                          <div>
                            {ch.type === "textarea"
                              ? <textarea style={{ ...s.formInp, width:"100%", minHeight:"80px", resize:"vertical" }} value={valeurEdition} onChange={e => setValeurEdition(e.target.value)} />
                              : <input style={{ ...s.formInp, width:"100%" }} value={valeurEdition} onChange={e => setValeurEdition(e.target.value)} />
                            }
                            <div style={{ display:"flex", gap:"6px", marginTop:"6px" }}>
                              <button style={s.btnPri} onClick={() => sauvegarderChamp(ligneOuverte.id, ch.id)}>Enregistrer</button>
                              <button style={s.btnSec} onClick={() => setChampEnEdition(null)}>Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
                            <span style={{ fontSize:"13px", color: valeur?"#111":"#d1d5db", whiteSpace:"pre-wrap" }}>{valeur || "—"}</span>
                            <button style={s.btnSm} onClick={() => { setChampEnEdition(`${ligneOuverte.id}_${ch.id}`); setValeurEdition(valeur) }}>✏️</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"4px" }}>
                    Importé le {formatDate(ligneOuverte.date_import)} par {ligneOuverte.importe_par || "—"}
                  </div>
                </div>
              )}

              {/* HISTORIQUE */}
              {ongletDetail === "historique" && (
                <div>
                  {historique.length === 0
                    ? <div style={{ color:"#6b7280", fontSize:"13px", textAlign:"center", padding:"20px" }}>Aucune modification enregistrée</div>
                    : historique.map(m => (
                      <div key={m.id} style={s.histRow}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                          <span style={{ fontWeight:500, fontSize:"12px" }}>{m.modifie_par_nom}</span>
                          <span style={{ color:"#9ca3af", fontSize:"11px" }}>{formatDate(m.date)}</span>
                        </div>
                        <div style={{ fontSize:"12px", color:"#6b7280" }}>
                          Champ <strong>{champsActifs.find(c=>c.id===m.champ)?.label || m.champ}</strong>
                        </div>
                        <div style={{ display:"flex", gap:"8px", marginTop:"4px", fontSize:"12px" }}>
                          <span style={{ background:"#fef2f2", color:"#dc2626", padding:"2px 8px", borderRadius:"4px", textDecoration:"line-through" }}>{m.valeur_avant || "—"}</span>
                          <span>→</span>
                          <span style={{ background:"#f0fdf4", color:"#166534", padding:"2px 8px", borderRadius:"4px" }}>{m.valeur_apres}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* COMMENTAIRES */}
              {ongletDetail === "commentaires" && (
                <div>
                  <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
                    <input
                      style={{ ...s.formInp, flex:1 }}
                      placeholder="Ajouter un commentaire..."
                      value={nouveauCommentaire}
                      onChange={e => setNouveauCommentaire(e.target.value)}
                      onKeyDown={e => e.key==="Enter" && ajouterCommentaire(ligneOuverte.id)}
                    />
                    <button style={s.btnPri} onClick={() => ajouterCommentaire(ligneOuverte.id)}>Envoyer</button>
                  </div>
                  {commentaires.length === 0
                    ? <div style={{ color:"#6b7280", fontSize:"13px", textAlign:"center", padding:"20px" }}>Aucun commentaire</div>
                    : commentaires.map(c => (
                      <div key={c.id} style={s.commRow}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                          <span style={{ fontWeight:500, fontSize:"12px" }}>{c.auteur_nom}</span>
                          <span style={{ color:"#9ca3af", fontSize:"11px" }}>{formatDate(c.date)}</span>
                        </div>
                        <div style={{ fontSize:"13px", color:"#374151" }}>{c.texte}</div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── FORMULAIRE CONNECTEUR ── */}
      {vue === "connecteur-form" && (
        <>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
            <button style={s.btnGhost} onClick={() => setVue("liste")}>← Retour</button>
            <div style={s.title}>{editConnId ? "Modifier le connecteur" : "Nouveau connecteur"}</div>
          </div>

          <div style={s.formPanel}>
            {errConn && <div style={s.error}>{errConn}</div>}
            <div style={s.formGrid}>
              <div style={s.formGrp}>
                <label style={s.formLbl}>Nom du connecteur</label>
                <input style={s.formInp} value={formConn.nom} onChange={e => setFormConn({...formConn, nom:e.target.value})} placeholder="Ex. Jira Équipe Dev" />
              </div>
              <div style={s.formGrp}>
                <label style={s.formLbl}>Type</label>
                <select style={s.formInp} value={formConn.type} onChange={e => changerTypeConnecteur(e.target.value)}>
                  {Object.keys(TYPES_CONNECTEUR).map(t => <option key={t} value={t}>{TYPES_CONNECTEUR[t].icon} {TYPES_CONNECTEUR[t].label}</option>)}
                </select>
              </div>
              <div style={{ ...s.formGrp, gridColumn:"1/-1" }}>
                <label style={s.formLbl}>Description</label>
                <input style={s.formInp} value={formConn.description} onChange={e => setFormConn({...formConn, description:e.target.value})} placeholder="Description courte" />
              </div>
              <div style={s.formGrp}>
                <label style={s.formLbl}>Service associé</label>
                <select style={s.formInp} value={formConn.service_id} onChange={e => setFormConn({...formConn, service_id:e.target.value})}>
                  <option value="">🌐 Global (tous les services)</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
              <div style={s.formGrp}>
                <label style={s.formLbl}>Mode d'import</label>
                <select style={s.formInp} value={formConn.mode_import} onChange={e => setFormConn({...formConn, mode_import:e.target.value})}>
                  <option value="fichier">📁 Fichier (CSV/JSON)</option>
                  <option value="api">🔗 API (prochainement)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom:"16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                <label style={s.formLbl}>Champs de données</label>
                <button style={s.btnSm} onClick={ajouterChamp}>+ Ajouter un champ</button>
              </div>
              {formConn.champs.map((ch, idx) => (
                <div key={idx} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px 32px", gap:"8px", marginBottom:"8px", alignItems:"center" }}>
                  <input style={s.formInp} placeholder="Identifiant (ex: id_patient)" value={ch.id} onChange={e => modifierChampForm(idx,"id",e.target.value)} />
                  <input style={s.formInp} placeholder="Label affiché" value={ch.label} onChange={e => modifierChampForm(idx,"label",e.target.value)} />
                  <select style={s.formInp} value={ch.type} onChange={e => modifierChampForm(idx,"type",e.target.value)}>
                    <option value="text">Texte</option>
                    <option value="textarea">Texte long</option>
                    <option value="number">Nombre</option>
                  </select>
                  <button style={s.btnDanger} onClick={() => supprimerChampForm(idx)}>✕</button>
                </div>
              ))}
              {formConn.champs.length === 0 && <div style={{ fontSize:"13px", color:"#9ca3af" }}>Aucun champ — ajoutez-en au moins un</div>}
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end", gap:"8px", paddingTop:"16px", borderTop:"1px solid #f3f4f6" }}>
              <button style={s.btnSec} onClick={() => setVue("liste")}>Annuler</button>
              <button style={s.btnPri} onClick={sauvegarderConnecteur}>{editConnId ? "Enregistrer" : "Créer le connecteur"}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
