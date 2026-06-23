import { useState } from "react";

export default function CommunicationCrise() {
  const [view, setView] = useState("list"); // list | create | detail
  const [selectedMessage, setSelectedMessage] = useState(null);

  return (
    <div style={{ fontFamily: "Arial", padding: "20px", maxWidth: "800px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 500 }}>Communication de crise</h2>
      <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>
        Messages internes de la cellule de crise et diffusion vers les équipes terrain.
      </p>

      {/* Navigation interne */}
      {view === "list" && (
        <>
          <button
            onClick={() => setView("create")}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              marginBottom: "15px"
            }}
          >
            + Nouveau message
          </button>

          <MessageList
            onSelect={(msg) => {
              setSelectedMessage(msg);
              setView("detail");
            }}
          />
        </>
      )}

      {view === "create" && (
        <MessageForm
          onCancel={() => setView("list")}
          onSubmit={(data) => {
            console.log("Message créé :", data);
            setView("list");
          }}
        />
      )}

      {view === "detail" && (
        <MessageDetail message={selectedMessage} onBack={() => setView("list")} />
      )}
    </div>
  );
}

/* -----------------------------
   LISTE DES MESSAGES
-------------------------------- */
function MessageList({ onSelect }) {
  const fakeMessages = [
    {
      id: 1,
      titre: "Activation du mode dégradé",
      type: "instruction",
      auteur: "Directeur des opérations",
      date: "12/05/2026 09:15"
    },
    {
      id: 2,
      titre: "Point de situation - 10h",
      type: "point_situation",
      auteur: "Cellule de crise",
      date: "12/05/2026 10:00"
    }
  ];

  return (
    <div>
      <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Messages récents</h3>

      {fakeMessages.length === 0 && (
        <p style={{ color: "#6b7280" }}>Aucun message pour le moment.</p>
      )}

      {fakeMessages.map((msg) => (
        <div
          key={msg.id}
          onClick={() => onSelect(msg)}
          style={{
            padding: "12px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            marginBottom: "10px",
            cursor: "pointer"
          }}
        >
          <strong>{msg.titre}</strong>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {msg.type} • {msg.auteur} • {msg.date}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -----------------------------
   FORMULAIRE DE CRÉATION
-------------------------------- */
function MessageForm({ onCancel, onSubmit }) {
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("instruction");
  const [contenu, setContenu] = useState("");
  const [resume, setResume] = useState("");
  const [destinataires, setDestinataires] = useState([]);

  const toggleDest = (d) => {
    setDestinataires((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Nouveau message</h3>

      <label>Titre</label>
      <input
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <label>Résumé court (optionnel)</label>
      <input
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <label>Type de message</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      >
        <option value="instruction">Instruction</option>
        <option value="decision">Décision</option>
        <option value="point_situation">Point de situation</option>
        <option value="alerte">Alerte</option>
        <option value="info_terrain">Information terrain</option>
      </select>

      <label>Destinataires</label>
      <div style={{ marginBottom: "10px" }}>
        {["cellule_crise", "direction", "terrain", "astreintes"].map((d) => (
          <label key={d} style={{ marginRight: "10px" }}>
            <input
              type="checkbox"
              checked={destinataires.includes(d)}
              onChange={() => toggleDest(d)}
            />
            {" " + d}
          </label>
        ))}
      </div>

      <label>Contenu</label>
      <textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        style={{ width: "100%", height: "120px", padding: "8px" }}
      />

      <div style={{ marginTop: "15px" }}>
        <button
          onClick={() =>
            onSubmit({ titre, resume, type, contenu, destinataires })
          }
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          Envoyer
        </button>

      <button
        onClick={onCancel}
        style={{
          backgroundColor: "#e5e7eb",
          padding: "8px 12px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer"
        }}
      >
        Annuler
      </button>
    </div>
  </div>
);
}

/* -----------------------------
   DÉTAIL D’UN MESSAGE
-------------------------------- */
function MessageDetail({ message, onBack }) {
if (!message) return null;

return (
  <div style={{ maxWidth: "600px" }}>
    <button
      onClick={onBack}
      style={{
        marginBottom: "15px",
        backgroundColor: "#e5e7eb",
        padding: "6px 10px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer"
      }}
    >
      ← Retour
    </button>

    <h3>{message.titre}</h3>
    <p style={{ color: "#6b7280", fontSize: "13px" }}>
      {message.type} • {message.auteur} • {message.date}
    </p>

    <p style={{ marginTop: "15px" }}>
      (Contenu du message à afficher ici)
    </p>
  </div>
);
}
