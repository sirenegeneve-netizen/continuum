import { useState } from "react"

const PROCEDURES_DEFAUT = [
  { id: "1", nom: "Continuité activité principale", service: "Production", criticite: "critique", responsable: "Directeur opérations", maj: "12/05/2026", statut: "a_jour", objectif: "Maintenir l'activité principale en mode dégradé", rto: "2h", rpo: "4h", declencheurs: ["Panne informatique", "Absence massive", "Indisponibilité bâtiment", "Cyberattaque"], etapes: [
    { id: "e1", texte: "Évaluer l'impact et activer la procédure", responsable: "Directeur opérations", fait: true, date: "2026-05-12", heure: "08:22" },
    { id: "e2", texte: "Informer la cellule de crise", responsable: "Direction générale", fait: true, date: "2026-05-12", heure: "08:35" },
    { id: "e3", texte: "Activer le mode dégradé", responsable: "Responsable IT", fait: true, date: "2026-05-12", heure: "09:05" },
    { id: "e4", texte: "Déployer les ressources de secours", responsable: "Responsable opérationnel", fait: false, date: null, heure: null },
    { id: "e5", texte: "Assurer le suivi et reporting toutes les 2h", responsable: "Directeur opérations", fait: false, date: null, heure: null },
  ], ressources: { equipe: "Équipe opérationnelle d'urgence", applications: "Système de secours, procédures papier", fournisseurs: "Prestataire de continuité" }, liees: ["Continuité IT", "Communication de crise"] },
  { id: "2", nom: "Continuité systèmes informatiques", service: "Informatique", criticite: "critique", responsable: "DSI", maj: "03/02/2026", statut: "revision", objectif: "Assurer la bascule vers les systèmes de secours", rto: "4h", rpo: "1h", declencheurs: ["Cyberattaque", "Panne matérielle", "Sinistre datacenter"], etapes: [
    { id: "e1", texte: "Identifier les systèmes impactés", responsable: "DSI", fait: false, date: null, heure: null },
    { id: "e2", texte: "Activer le plan de reprise informatique", responsable: "DSI", fait: false, date: null, heure: null },
    { id: "e3", texte: "Basculer vers l'environnement de secours", responsable: "Administrateur système", fait: false, date: null, heure: null },
    { id: "e4", texte: "Valider le fonctionnement des applications critiques", responsable: "DSI", fait: false, date: null, heure: null },
  ], ressources: { equipe: "Équipe IT d'astreinte", applications: "Environnement de secours", fournisseurs: "Hébergeur de secours" }, liees: ["Continuité activité principale", "Communication de crise"] },
  { id: "3", nom: "Gestion absence massive personnel", service: "RH", criticite: "majeur", responsable: "DRH", maj: "18/01/2026", statut: "a_jour", objectif: "Assurer la continuité en cas d'absence de plus de 30% du personnel", rto: "8h", rpo: "24h", declencheurs: ["Épidémie", "Grève", "Événement exceptionnel"], etapes: [
    { id: "e1", texte: "Évaluer le taux d'absence et les impacts", responsable: "DRH", fait: false, date: null, heure: null },
    { id: "e2", texte: "Activer le plan de réaffectation du personnel", responsable: "DRH", fait: false, date: null, heure: null },
    { id: "e3", texte: "Contacter les renforts externes si nécessaire", responsable: "DRH", fait: false, date: null, heure: null },
  ], ressources: { equipe: "RH et managers", applications: "Outil de planification RH", fournisseurs: "Agence d'intérim partenaire" }, liees: ["Communication interne"] },
  { id: "4", nom: "Continuité service client", service: "Commercial", criticite: "majeur", responsable: "Directeur commercial", maj: "04/2025", statut: "obsolete", objectif: "Maintenir la relation client en situation dégradée", rto: "4h", rpo: "8h", declencheurs: ["Panne CRM", "Indisponibilité équipe"], etapes: [
    { id: "e1", texte: "Basculer vers le canal de contact de secours", responsable: "Directeur commercial", fait: false, date: null, heure: null },
    { id: "e2", texte: "Informer les clients des perturbations", responsable: "Chargé communication", fait: false, date: null, heure: null },
  ], ressources: { equipe: "Équipe commerciale", applications: "CRM de secours", fournisseurs: "Prestataire support" }, liees: ["Communication de crise"] },
]

const STATUT = {
  a_jour: { label: "À jour", bg: "#eaf3de", tc: "#3b6d11" },
  revision: { label: "Révision requise", bg: "#fef3cd", tc: "#856404" },
  obsolete: { label: "Obsolète", bg: "#fcebeb", tc: "#a32d2d" },
}

const CRITICITE = {
  critique: { label: "Critique", bg: "#fcebeb", tc: "#a32d2d" },
  majeur: { label: "Majeur", bg: "#faeeda", tc: "#854f0b" },
  mineur: { label: "Mineur", bg: "#fef9c3", tc: "#854d0e" },
}

function formatDateHeure(dateStr, heure) {
  if (!dateStr) return "En attente"
  const d = new Date(dateStr)
  const jourMois = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
  return `${jourMois} à ${heure}`
}

function nouvelleProcedureVierge(id) {
  return {
    id, nom: "Nouvelle procédure", service: "À définir", criticite: "majeur", responsable: "À définir",
    maj: new Date().toLocaleDateString("fr-FR"), statut: "revision",
    objectif: "À compléter", rto: "—", rpo: "—", declencheurs: [],
    etapes: [{ id: "e1", texte: "Première étape à définir", responsable: "À définir", fait: false, date: null, heure: null }],
    ressources: { equipe: "—", applications: "—", fournisseurs: "—" }, liees: []
  }
}

export default function PcaProcedures() {
  const [procedures, setProcedures] = useState(PROCEDURES_DEFAUT)
  const [selectionId, setSelectionId] = useState(PROCEDURES_DEFAUT[0].id)
  const [filtreRapide, setFiltreRapide] = useState("toutes")
  const [recherche, setRecherche] = useState("")
  const [modeCrise, setModeCrise] = useState(false)
  const [debutCrise, setDebutCrise] = useState(null)

  const filtrees = procedures.filter(p => {
    if (filtreRapide === "a_traiter" && p.statut === "a_jour") return false
    if (recherche && !p.nom.toLowerCase().includes(recherche.toLowerCase())) return false
    return true
  })

  const selection = procedures.find(p => p.id === selectionId) || filtrees[0]

  function toggleEtape(procId, etapeId) {
    const maintenant = new Date()
    setProcedures(procedures.map(p => p.id !== procId ? p : {
      ...p, etapes: p.etapes.map(e => e.id !== etapeId ? e : {
        ...e, fait: !e.fait,
        date: !e.fait ? maintenant.toISOString().slice(0, 10) : null,
        heure: !e.fait ? maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null
      })
    }))
  }

  function nouvelleProcedure() {
    const id = Date.now().toString()
    const proc = nouvelleProcedureVierge(id)
    setProcedures([proc, ...procedures])
    setSelectionId(id)
  }

  function demarrerModeCrise() {
    setDebutCrise(new Date())
    setModeCrise(true)
  }

  const badge = (bg, tc, label) => (
    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 500, background: bg, color: tc, whiteSpace: "nowrap" }}>{label}</span>
  )

  const select = { fontSize: "12px", padding: "5px 10px", borderRadius: "8px", border: "0.5px solid #d1d5db", background: "#fff", color: "#374151" }

  if (modeCrise && selection) {
    const faites = selection.etapes.filter(e => e.fait).length
    const progression = Math.round((faites / selection.etapes.length) * 100)
    const minutesEcoulees = debutCrise ? Math.floor((new Date() - debutCrise) / 60000) : 0
    const heuresEcoulees = Math.floor(minutesEcoulees / 60)
    const minRestantes = minutesEcoulees % 60
    const rtoHeures = parseInt(selection.rto) || null
    const enDepassement = rtoHeures && heuresEcoulees >= rtoHeures

    return (
      <div style={{ padding: "24px", background: "#1a1f36", minHeight: "100vh", fontFamily: "Arial" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <span style={{ background: "#c0392b", color: "#fff", fontSize: "11px", fontWeight: 500, padding: "4px 10px", borderRadius: "20px" }}>● MODE CRISE ACTIF</span>
            <div style={{ fontSize: "18px", fontWeight: 500, color: "#fff", marginTop: "10px" }}>{selection.nom}</div>
          </div>
          <button onClick={() => setModeCrise(false)} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>
            Quitter le mode crise
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>Temps écoulé</div>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#fff", fontFamily: "monospace" }}>{String(heuresEcoulees).padStart(2, "0")}h{String(minRestantes).padStart(2, "0")}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>RTO cible</div>
            <div style={{ fontSize: "22px", fontWeight: 500, color: enDepassement ? "#f87171" : "#4ade80" }}>{selection.rto}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>Statut</div>
            <div style={{ fontSize: "16px", fontWeight: 500, color: enDepassement ? "#f87171" : "#4ade80" }}>{enDepassement ? "RTO dépassé" : "Dans les délais"}</div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "#111" }}>Checklist — {faites}/{selection.etapes.length} étapes ({progression}%)</div>
          </div>
          <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", marginBottom: "16px" }}>
            <div style={{ height: "6px", background: enDepassement ? "#dc2626" : "#16a34a", borderRadius: "3px", width: `${progression}%`, transition: "width 0.3s" }}></div>
          </div>
          {selection.etapes.map(e => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "0.5px solid #f3f4f6" }}>
              <input type="checkbox" checked={e.fait} onChange={() => toggleEtape(selection.id, e.id)} style={{ cursor: "pointer", width: "20px", height: "20px" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", color: e.fait ? "#9ca3af" : "#111", textDecoration: e.fait ? "line-through" : "none" }}>{e.texte}</div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>{e.responsable} · {formatDateHeure(e.date, e.heure)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 500, color: "#111" }}>Procédures de continuité</div>
          <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
            {procedures.filter(p => p.statut === "revision").length > 0 && (
              <span style={{ fontSize: "12px", color: "#856404" }}>● {procedures.filter(p => p.statut === "revision").length} révision requise</span>
            )}
            {procedures.filter(p => p.statut === "obsolete").length > 0 && (
              <span style={{ fontSize: "12px", color: "#a32d2d" }}>● {procedures.filter(p => p.statut === "obsolete").length} obsolète{procedures.filter(p => p.statut === "obsolete").length > 1 ? "s" : ""}</span>
            )}
            {procedures.filter(p => p.statut === "a_jour").length > 0 && (
              <span style={{ fontSize: "12px", color: "#3b6d11" }}>● {procedures.filter(p => p.statut === "a_jour").length} à jour</span>
            )}
          </div>
        </div>
        <button onClick={nouvelleProcedure} style={{ background: "#1a1f36", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}>+ Nouvelle procédure</button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <select style={select} value={filtreRapide} onChange={e => setFiltreRapide(e.target.value)}>
          <option value="toutes">Toutes les procédures</option>
          <option value="a_traiter">À traiter (révision + obsolète)</option>
        </select>
        <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher une procédure..." style={{ ...select, flex: 1 }} />
      </div>

      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

        <div style={{ width: "260px", flexShrink: 0, background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
          {filtrees.length === 0 && (
            <div style={{ padding: "20px", fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>Aucune procédure</div>
          )}
          {filtrees.map((p, idx) => {
            const estSelection = selection?.id === p.id
            return (
              <div key={p.id} onClick={() => setSelectionId(p.id)} style={{
                padding: "12px 14px", cursor: "pointer",
                borderTop: idx === 0 ? "none" : "0.5px solid #f3f4f6",
                borderLeft: estSelection ? "3px solid #1a1f36" : "3px solid transparent",
                background: estSelection ? "#eff6ff" : "#fff"
              }}>
                <div style={{ fontSize: "12px", fontWeight: estSelection ? 500 : 400, color: "#111", marginBottom: "6px" }}>{p.nom}</div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {badge(CRITICITE[p.criticite].bg, CRITICITE[p.criticite].tc, CRITICITE[p.criticite].label)}
                  {badge(STATUT[p.statut].bg, STATUT[p.statut].tc, STATUT[p.statut].label)}
                </div>
              </div>
            )
          })}
        </div>

        {selection && (
          <div style={{ flex: 1, minWidth: 0, background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 500, color: "#111" }}>{selection.nom}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{selection.service} · Responsable : {selection.responsable} · MAJ {selection.maj}</div>
              </div>
              <button onClick={demarrerModeCrise} style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
                ▶ Mode crise
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "18px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Objectif</div>
                <div style={{ fontSize: "13px", color: "#111" }}>{selection.objectif}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>RTO / RPO</div>
                <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: "20px", marginRight: "6px" }}>RTO {selection.rto}</span>
                <span style={{ fontSize: "12px", background: "#f3e8ff", color: "#7e22ce", padding: "3px 10px", borderRadius: "20px" }}>RPO {selection.rpo}</span>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Déclencheurs</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {selection.declencheurs.length === 0 && <span style={{ fontSize: "12px", color: "#9ca3af" }}>—</span>}
                  {selection.declencheurs.map(d => <span key={d} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#f3f4f6", color: "#374151" }}>{d}</span>)}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px", paddingTop: "14px", borderTop: "0.5px solid #f3f4f6" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Ressources</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>Équipe <span style={{ color: "#111" }}>{selection.ressources.equipe}</span></div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>Applications <span style={{ color: "#111" }}>{selection.ressources.applications}</span></div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Fournisseurs <span style={{ color: "#111" }}>{selection.ressources.fournisseurs}</span></div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Procédures liées</div>
                {selection.liees.length === 0 && <span style={{ fontSize: "12px", color: "#9ca3af" }}>—</span>}
                {selection.liees.map(l => <div key={l} style={{ fontSize: "12px", color: "#1d4ed8", marginBottom: "4px", cursor: "pointer" }}>↳ {l}</div>)}
              </div>
            </div>

            <div style={{ paddingTop: "14px", borderTop: "0.5px solid #f3f4f6" }}>
              {(() => {
                const faites = selection.etapes.filter(e => e.fait).length
                const progression = Math.round((faites / selection.etapes.length) * 100)
                return (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Playbook — {faites}/{selection.etapes.length} étapes ({progression}%)</div>
                      <span style={{ fontSize: "11px", color: progression === 100 ? "#3b6d11" : progression > 0 ? "#854f0b" : "#9ca3af", fontWeight: 500 }}>
                        {progression === 100 ? "Terminé" : progression > 0 ? "En cours" : "Non démarré"}
                      </span>
                    </div>
                    <div style={{ height: "4px", background: "#e5e7eb", borderRadius: "2px", marginBottom: "10px" }}>
                      <div style={{ height: "4px", background: "#3b6d11", borderRadius: "2px", width: `${progression}%`, transition: "width 0.3s" }}></div>
                    </div>
                    {selection.etapes.map(e => (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "0.5px solid #f3f4f6" }}>
                        <input type="checkbox" checked={e.fait} onChange={() => toggleEtape(selection.id, e.id)} style={{ cursor: "pointer", width: "15px", height: "15px" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", color: e.fait ? "#9ca3af" : "#111", textDecoration: e.fait ? "line-through" : "none" }}>{e.texte}</div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>{e.responsable} · {formatDateHeure(e.date, e.heure)}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
