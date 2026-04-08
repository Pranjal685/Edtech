import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LANGUAGES = ["JavaScript", "Python", "Java"];
const LEVELS    = ["Beginner", "Intermediate", "Advanced"];
const DOMAINS   = ["Web Development", "Systems", "Data Engineering", "APIs"];
const FOCUS_AREAS = {
  "Web Development":  ["REST APIs", "Authentication", "Database Design", "Caching", "File Uploads"],
  "Systems":          ["File I/O", "Concurrency", "Memory Management", "Networking", "Process Management"],
  "Data Engineering": ["ETL Pipelines", "Data Cleaning", "Query Optimization", "Data Validation", "Streaming"],
  "APIs":             ["Rate Limiting", "OAuth & Auth", "Pagination", "Webhooks", "Error Responses"],
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SkillSetup() {
  const navigate = useNavigate();
  const [language,  setLanguage]  = useState("");
  const [level,     setLevel]     = useState("");
  const [domain,    setDomain]    = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const isReady = language && level && domain && focusArea;

  async function handleGenerate() {
    if (!isReady || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ language, level, domain, focusArea }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Server error ${res.status}`);
      }
      const project = await res.json();
      navigate("/project-brief", { state: { project, language, level, domain, focusArea } });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter" style={st.root}>
      {/* ── Header ── */}
      <div style={st.header}>
        <div style={st.logoRow}>
          <span style={st.logoText}>Forge</span>
          <span style={st.betaBadge}>BETA</span>
        </div>
        <p style={st.tagline}>Build real projects. Think like a senior engineer.</p>
      </div>

      {/* ── Card ── */}
      <div className="card-static" style={st.card}>
        {/* 2×2 grid */}
        <div style={st.grid}>
          <div>
            <label htmlFor="sel-language" className="field-label">Language</label>
            <select id="sel-language" className="select" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="">Select</option>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sel-level" className="field-label">Skill Level</label>
            <select id="sel-level" className="select" value={level} onChange={e => setLevel(e.target.value)}>
              <option value="">Select</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sel-domain" className="field-label">Domain</label>
            <select id="sel-domain" className="select" value={domain}
              onChange={e => { setDomain(e.target.value); setFocusArea(""); }}>
              <option value="">Select</option>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sel-focus" className="field-label">
              Focus Area {!domain && <span style={{ color: "var(--text-3)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— pick domain first</span>}
            </label>
            <select id="sel-focus" className="select" value={focusArea}
              onChange={e => setFocusArea(e.target.value)}
              disabled={!domain}>
              <option value="">{domain ? "Select" : "—"}</option>
              {domain && FOCUS_AREAS[domain]?.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="divider" style={{ margin: "20px 0" }} />

        {error && (
          <div style={st.errorBox}>
            <svg width="14" height="14" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <button id="generate-btn" className="btn btn-primary" style={st.cta}
          disabled={!isReady || loading} onClick={handleGenerate}>
          {loading
            ? <><span className="spinner" /> Generating project…</>
            : <>Generate My Project</>
          }
        </button>
      </div>

      {/* ── Footer ── */}
      <p className="dimmed" style={{ fontSize: 11, textAlign: "center", letterSpacing: "0.03em" }}>
        Forge · Google Solution Challenge 2026
      </p>
    </div>
  );
}

const st = {
  root: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    gap: "28px",
  },
  header: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoText: {
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "var(--text-1)",
  },
  betaBadge: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "var(--accent)",
    border: "1px solid var(--border-focus)",
    borderRadius: 4,
    padding: "1px 6px",
    lineHeight: "16px",
  },
  tagline: {
    fontSize: "13px",
    color: "var(--text-3)",
  },
  card: {
    width: "100%",
    maxWidth: "640px",
    padding: "28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 13px",
    background: "var(--red-dim)",
    border: "1px solid rgba(239,68,68,0.15)",
    borderRadius: "var(--r-md)",
    color: "var(--red)",
    fontSize: "13px",
    marginBottom: "16px",
  },
  cta: {
    width: "100%",
    padding: "11px",
    fontSize: "14px",
    fontWeight: 600,
  },
};
