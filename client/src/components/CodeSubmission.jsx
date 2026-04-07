import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const LANG_MAP = {
  JavaScript: "javascript",
  Python: "python",
  Java: "java",
};

const STARTER_CODE = {
  JavaScript: '// Write your solution here\nfunction main() {\n  \n}\n\nmain();\n',
  Python: '# Write your solution here\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()\n',
  Java: '// Write your solution here\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n',
};

export default function CodeSubmission() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state?.project) return <Navigate to="/" replace />;

  const { project, language, level, domain } = state;
  const [code, setCode] = useState(STARTER_CODE[language] || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: code,
          projectSpec: `${project.title}\n${project.description}\nRequirements: ${project.requirements.join("; ")}`,
          language,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const review = await res.json();
      navigate("/review", {
        state: { review, project, language, level, domain, code },
      });
    } catch (err) {
      setError(err.message || "Code review failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-scene" aria-hidden="true" />

      <div className="relative z-10 min-h-dvh flex flex-col">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b"
          style={{ borderColor: "var(--border-subtle)", background: "rgba(10, 10, 15, 0.8)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/project-brief", { state })}
              className="inline-flex items-center gap-1.5 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: "var(--text-secondary)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              <span>Brief</span>
            </button>
            <div className="h-4 w-px" style={{ background: "var(--border-subtle)" }} />
            <span className="text-xs px-2.5 py-1 rounded-md font-mono"
              style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
              {language}
            </span>
            <h2 className="text-sm font-semibold truncate max-w-xs sm:max-w-md hidden sm:block"
              style={{ color: "var(--text-primary)" }}>
              {project.title}
            </h2>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Sidebar — project info */}
          <aside className="w-full lg:w-[450px] p-6 lg:p-8 overflow-y-auto border-b lg:border-b-0 lg:border-r custom-scrollbar"
            style={{ 
              borderColor: "var(--border-subtle)", 
              background: "rgba(10, 10, 15, 0.4)",
              backdropFilter: "blur(16px)"
            }}>
            <div className="fade-in max-w-sm mx-auto lg:mx-0">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2"
                style={{ color: "var(--accent-indigo)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-indigo)" }} />
                Requirements
              </h3>
              <ul className="space-y-4 mb-10">
                {project.requirements.map((req, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--accent-indigo)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 mt-0.5 markdown-prose" style={{ fontSize: "0.85rem" }}>
                      <ReactMarkdown>{req}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>

              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2"
                style={{ color: "var(--accent-rose)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-rose)" }} />
                Constraints
              </h3>
              <ul className="space-y-4">
                {project.constraints.map((con, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 mt-1" style={{ color: "var(--accent-rose)" }}>
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                    </span>
                    <div className="flex-1 mt-0.5 markdown-prose" style={{ fontSize: "0.85rem" }}>
                      <ReactMarkdown>{con}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Editor area */}
          <div className="flex-1 flex flex-col min-h-[500px]">
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={LANG_MAP[language] || "javascript"}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  padding: { top: 24, bottom: 24 },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderLineHighlight: "gutter",
                  bracketPairColorization: { enabled: true },
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                }}
              />
            </div>

            {/* Bottom bar */}
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t shadow-2xl"
              style={{ borderColor: "var(--border-subtle)", background: "rgba(10, 10, 15, 0.9)", backdropFilter: "blur(20px)" }}>

              {error && (
                <div className="w-full p-3 rounded-xl text-sm font-medium mb-1"
                  style={{ background: "rgba(251, 113, 133, 0.1)", color: "var(--accent-rose)", border: "1px solid rgba(251, 113, 133, 0.2)" }}>
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-emerald)] shadow-[0_0_8px_var(--accent-emerald)]" />
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Editor Ready
                </span>
                <span className="text-xs font-mono ml-4 px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
                  {code.split("\n").length} lines
                </span>
              </div>

              <button
                id="submit-review-btn"
                className="btn-glow px-6 py-2.5 shadow-lg"
                disabled={!code.trim() || loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Reviewing…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4z" /></svg>
                    Submit for Code Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
            style={{ background: "rgba(10, 10, 15, 0.9)", backdropFilter: "blur(12px)" }}>
            <div className="flex gap-3">
              <span className="pulse-dot w-3 h-3" />
              <span className="pulse-dot w-3 h-3" />
              <span className="pulse-dot w-3 h-3" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Senior Engineer is reviewing your code...
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Analyzing architecture, naming, and error handling (3–8s)
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
