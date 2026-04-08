import { useLocation, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function ProjectBrief() {
  const location = useLocation();
  const navigate = useNavigate();
  const state    = location.state;

  if (!state?.project) return <Navigate to="/" replace />;

  const { project, language, level, domain, focusArea } = state;

  const diffConfig = {
    Beginner:     { color: "var(--green)",  bg: "var(--green-dim)",  border: "rgba(34,197,94,0.15)" },
    Intermediate: { color: "var(--amber)",  bg: "var(--amber-dim)",  border: "rgba(234,179,8,0.15)" },
    Advanced:     { color: "var(--red)",    bg: "var(--red-dim)",    border: "rgba(239,68,68,0.15)" },
  }[project.difficulty] || { color: "var(--accent)", bg: "var(--accent-dim)", border: "rgba(59,130,246,0.15)" };

  function handleStart() {
    navigate("/submit", { state: { project, language, level, domain, focusArea } });
  }

  return (
    <div className="page-enter" style={st.root}>
      {/* ── Top bar ── */}
      <header style={st.topBar}>
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 13 }}
          onClick={() => navigate("/")}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <div style={st.topBarMeta}>
          <span className="badge" style={{ background: diffConfig.bg, color: diffConfig.color, border: `1px solid ${diffConfig.border}` }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: diffConfig.color, display: "inline-block" }} />
            {project.difficulty}
          </span>
          <span style={st.langPill}>{language} · {domain}</span>
        </div>
      </header>

      {/* ── Two column layout ── */}
      <div style={st.body}>
        {/* Left — title + description + CTA */}
        <div style={st.left}>
          <h1 style={st.title}>{project.title}</h1>
          <div className="prose" style={{ flexGrow: 1, marginTop: 16, overflow: "auto" }}>
            <ReactMarkdown>{project.description}</ReactMarkdown>
          </div>
          <button id="start-building-btn" className="btn btn-primary" style={st.startBtn}
            onClick={handleStart}>
            Start Building
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>

        {/* Right — requirements + constraints scrollable */}
        <div style={st.right}>
          <div>
            <p style={st.sectionLabel}>Requirements</p>
            <ul style={st.reqList}>
              {project.requirements.map((req, i) => (
                <li key={i} style={st.reqItem}>
                  <span style={st.reqNum}>{i + 1}</span>
                  <div className="prose"><ReactMarkdown>{req}</ReactMarkdown></div>
                </li>
              ))}
            </ul>
          </div>

          {project.constraints?.length > 0 && (
            <div>
              <p style={{ ...st.sectionLabel, color: "var(--red)" }}>Constraints</p>
              <ul style={st.reqList}>
                {project.constraints.map((con, i) => (
                  <li key={i} style={st.reqItem}>
                    <span style={{ ...st.reqNum, background: "var(--red-dim)", color: "var(--red)", borderColor: "rgba(239,68,68,0.12)" }}>
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" viewBox="0 0 24 24"><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    </span>
                    <div className="prose"><ReactMarkdown>{con}</ReactMarkdown></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const st = {
  root: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 28px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
    flexShrink: 0,
  },
  topBarMeta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  langPill: {
    fontSize: 12,
    color: "var(--text-3)",
    padding: "3px 10px",
    background: "var(--surface-3)",
    borderRadius: 999,
    border: "1px solid var(--border)",
  },
  body: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    minHeight: 0,
  },
  left: {
    width: "40%",
    minWidth: 280,
    padding: "36px 32px 32px",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid var(--border)",
    overflow: "auto",
  },
  title: {
    fontSize: "clamp(20px, 2.2vw, 28px)",
    fontWeight: 700,
    letterSpacing: "-0.025em",
    lineHeight: 1.25,
    color: "var(--text-1)",
  },
  startBtn: {
    marginTop: "28px",
    padding: "11px 20px",
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
    width: "100%",
  },
  right: {
    flex: 1,
    overflow: "auto",
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-3)",
    marginBottom: "14px",
  },
  reqList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    listStyle: "none",
    padding: 0,
  },
  reqItem: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  reqNum: {
    flexShrink: 0,
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    fontSize: 10,
    fontWeight: 700,
    background: "var(--accent-dim)",
    color: "var(--accent)",
    border: "1px solid rgba(59,130,246,0.12)",
    marginTop: 1,
  },
};
