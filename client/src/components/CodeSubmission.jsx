import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const LANG_MAP = { JavaScript: "javascript", Python: "python", Java: "java" };

export default function CodeSubmission() {
  const location = useLocation();
  const navigate = useNavigate();
  const state    = location.state;

  if (!state?.project) return <Navigate to="/" replace />;

  const { project, language, level, domain, focusArea } = state;
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const meaningful = code.trim().split("\n").filter(l => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith("#") && !t.startsWith("//");
  });
  const tooShort = meaningful.length < 3;

  async function handleSubmit() {
    if (loading || tooShort) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/review`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: code,
          projectSpec: `${project.title}\n${project.description}\nRequirements: ${project.requirements.join("; ")}`,
          language,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Server error ${res.status}`);
      }
      const review = await res.json();
      navigate("/review", { state: { review, project, language, level, domain, focusArea, code } });
    } catch (err) {
      setError(err.message || "Review failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter" style={st.root}>
      {/* ── Top bar ── */}
      <header style={st.topBar}>
        <div style={st.topLeft}>
          <button className="btn btn-ghost" style={{ padding: "5px 11px", fontSize: 13 }}
            onClick={() => navigate("/project-brief", { state })}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
            Brief
          </button>
          <div style={st.topDivider} />
          <span className="mono" style={st.langTag}>{language}</span>
          <span style={st.projTitle}>{project.title}</span>
        </div>
      </header>

      {/* ── Main ── */}
      <div style={st.main}>
        {/* Sidebar */}
        <aside style={st.sidebar}>
          <Section label="Requirements" color="var(--text-3)">
            {project.requirements.map((req, i) => (
              <SideItem key={i} num={i + 1} color="var(--accent)" dimColor="var(--accent-dim)" borderColor="rgba(59,130,246,0.12)">
                <div className="prose"><ReactMarkdown>{req}</ReactMarkdown></div>
              </SideItem>
            ))}
          </Section>

          {project.constraints?.length > 0 && (
            <Section label="Constraints" color="var(--red)" style={{ marginTop: 24 }}>
              {project.constraints.map((con, i) => (
                <SideItem key={i} num={null} color="var(--red)" dimColor="var(--red-dim)" borderColor="rgba(239,68,68,0.12)">
                  <div className="prose"><ReactMarkdown>{con}</ReactMarkdown></div>
                </SideItem>
              ))}
            </Section>
          )}
        </aside>

        {/* Editor column */}
        <div style={st.editorCol}>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Editor
              height="100%"
              language={LANG_MAP[language] || "javascript"}
              theme="vs-dark"
              value={code}
              onChange={v => setCode(v || "")}
              options={{
                fontSize: 14,
                fontFamily: "JetBrains Mono, Menlo, Monaco, monospace",
                lineHeight: 1.6,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                minimap: { enabled: false },
                renderLineHighlight: "gutter",
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                  verticalScrollbarSize: 5,
                  horizontalScrollbarSize: 5,
                  useShadows: false,
                },
              }}
            />
          </div>

          {/* Error strip */}
          {error && (
            <div style={st.errorStrip}>
              <svg width="13" height="13" fill="none" stroke="var(--red)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Bottom bar */}
          <div style={st.bottomBar}>
            <div style={st.statusRow}>
              <span style={st.statusDot} />
              <span style={{ color: "var(--text-3)", fontSize: 12 }}>Editor ready</span>
              <span style={st.lineCount}>{code.split("\n").length} lines</span>
              {tooShort && (
                <span style={{ color: "var(--text-3)", fontSize: 12 }}>
                  · {3 - meaningful.length} more line{3 - meaningful.length !== 1 ? "s" : ""} needed
                </span>
              )}
            </div>
            <button id="submit-review-btn" className="btn btn-primary"
              style={{ padding: "8px 18px", fontSize: 13.5 }}
              disabled={tooShort || loading}
              onClick={handleSubmit}>
              {loading
                ? <><span className="spinner" /> Reviewing…</>
                : <>Submit for Review <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/></svg></>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={st.overlay}>
          <div className="pulse-row">
            <div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" />
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <p style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 4 }}>
              Reviewing your code…
            </p>
            <p style={{ color: "var(--text-3)", fontSize: 12 }}>
              Analyzing architecture, naming, and error handling (3–8s)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, color, children, style }) {
  return (
    <div style={style}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color, marginBottom: 12 }}>
        {label}
      </p>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </ul>
    </div>
  );
}

function SideItem({ num, color, dimColor, borderColor, children }) {
  return (
    <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{
        flexShrink: 0, width: 20, height: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 5, fontSize: 10, fontWeight: 700,
        background: dimColor, color, border: `1px solid ${borderColor}`,
        marginTop: 1,
      }}>
        {num !== null ? num : (
          <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
          </svg>
        )}
      </span>
      {children}
    </li>
  );
}

const st = {
  root: {
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    height: "44px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
    gap: 12,
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  topDivider: {
    width: 1,
    height: 16,
    background: "var(--border)",
  },
  langTag: {
    fontSize: 11,
    padding: "2px 8px",
    background: "var(--surface-3)",
    border: "1px solid var(--border)",
    borderRadius: 5,
    color: "var(--text-3)",
  },
  projTitle: {
    fontSize: 13,
    color: "var(--text-2)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  main: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    height: "calc(100vh - 44px)",
  },
  sidebar: {
    width: "320px",
    flexShrink: 0,
    borderRight: "1px solid var(--border)",
    background: "var(--surface)",
    padding: "24px 20px",
    overflowY: "auto",
    height: "100%",
  },
  editorCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  bottomBar: {
    height: "44px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface)",
  },
  errorStrip: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 18px",
    background: "var(--red-dim)",
    borderBottom: "1px solid rgba(239,68,68,0.12)",
    color: "var(--red)",
    fontSize: 12,
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--green)",
  },
  lineCount: {
    fontSize: 11,
    padding: "2px 7px",
    background: "var(--surface-3)",
    borderRadius: 4,
    border: "1px solid var(--border)",
    color: "var(--text-3)",
    fontFamily: "var(--mono)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(10,10,11,0.92)",
    backdropFilter: "blur(8px)",
  },
};
