import { useLocation, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function ProjectBrief() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  // Guard: redirect to home if no project data
  if (!state?.project) return <Navigate to="/" replace />;

  const { project, language, level, domain } = state;

  const difficultyColor = {
    Beginner: "var(--accent-emerald)",
    Intermediate: "var(--accent-amber)",
    Advanced: "var(--accent-rose)",
  }[project.difficulty] || "var(--accent-indigo)";

  function handleStart() {
    navigate("/submit", { state: { project, language, level, domain } });
  }

  return (
    <>
      <div className="bg-scene" aria-hidden="true" />

      <div className="relative z-10 min-h-dvh flex flex-col p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto pt-8 pb-16 flex flex-col items-center">

          {/* Back link */}
          <button onClick={() => navigate("/")}
            className="self-start inline-flex items-center gap-1.5 text-sm font-medium mb-10 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: "var(--text-secondary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Back to setup
          </button>

          {/* Difficulty badge + title */}
          <div className="fade-in w-full text-center">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{ background: `color-mix(in srgb, ${difficultyColor} 15%, transparent)`, color: difficultyColor, border: `1px solid color-mix(in srgb, ${difficultyColor} 25%, transparent)` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: difficultyColor }} />
                {project.difficulty}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                {language} · {domain}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6"
              style={{ color: "var(--text-primary)" }}>
              {project.title}
            </h1>

            <div className="max-w-2xl mx-auto mb-12 markdown-prose text-center text-lg sm:text-xl">
              <ReactMarkdown>
                {project.description}
              </ReactMarkdown>
            </div>
          </div>

          {/* Combined Requirements + Constraints Card */}
          <div className="glass-card w-full mb-10 fade-in fade-in-delay-1 overflow-hidden text-left">
            
            {/* Requirements Section */}
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest"
                  style={{ color: "var(--accent-indigo)" }}>
                  Project Requirements
                </h2>
                <div className="h-px flex-1 ml-6 bg-gradient-to-r from-[rgba(99,102,241,0.2)] to-transparent" />
              </div>
              
              <ul className="space-y-5">
                {project.requirements.map((req, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 mt-1 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shadow-sm"
                      style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--accent-indigo)", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 mt-0.5 markdown-prose">
                      <ReactMarkdown>{req}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: "var(--border-subtle)" }} />

            {/* Constraints Section */}
            <div className="p-8 sm:p-10" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest"
                  style={{ color: "var(--accent-rose)" }}>
                  Technical Constraints
                </h2>
                <div className="h-px flex-1 ml-6 bg-gradient-to-r from-[rgba(251,113,133,0.2)] to-transparent" />
              </div>

              <ul className="space-y-4">
                {project.constraints.map((con, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 mt-1 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-rose)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                    </span>
                    <div className="flex-1 mt-0.5 markdown-prose">
                      <ReactMarkdown>{con}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="self-end fade-in fade-in-delay-3">
            <button
              id="start-building-btn"
              className="btn-glow pl-8 pr-6 py-4 shadow-xl"
              onClick={handleStart}
            >
              Start Building
              <svg className="ml-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
