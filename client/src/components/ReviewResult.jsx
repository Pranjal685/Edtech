import { useLocation, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

/* ── Circular Score Ring ───────────────────────────────────── */
function ScoreRing({ score, max = 100, size = 190, stroke = 12 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / max) * circumference;

  let color = "var(--accent-emerald)";
  if (score < 40) color = "var(--accent-rose)";
  else if (score < 70) color = "var(--accent-amber)";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* SVG ring — rotated so arc starts at 12 o'clock */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle cx={cx} cy={cy} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        {/* Filled arc */}
        <circle cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>

      {/* Score label — precisely centered */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        gap: "4px",
      }}>
        <span style={{
          color,
          fontSize: "2.75rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          textShadow: `0 0 20px color-mix(in srgb, ${color} 40%, transparent)`,
        }}>
          {score}
        </span>
        <span style={{
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}>
          / 100
        </span>
      </div>
    </div>
  );
}


/* ── Mini Score Card ───────────────────────────────────────── */
function ScoreCard({ title, score, feedback, icon, accentColor }) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 h-full hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
            style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${accentColor} 20%, transparent)` }}>
            {icon}
          </span>
          <h3 className="text-[15px] font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>{title}</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold" style={{ color: accentColor }}>
            {score}
          </span>
          <span className="text-xs font-medium ml-0.5" style={{ color: "var(--text-muted)" }}>/10</span>
        </div>
      </div>
      {/* Score bar */}
      <div className="h-1.5 rounded-full w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${(score / 10) * 100}%`, background: accentColor, boxShadow: `0 0 10px ${accentColor}` }} />
      </div>
      <div className="text-sm leading-relaxed mt-2 markdown-prose" style={{ color: "var(--text-secondary)" }}>
        <ReactMarkdown>{feedback}</ReactMarkdown>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function ReviewResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state?.review) return <Navigate to="/" replace />;

  const { review, project, language, level, domain } = state;

  function handleNextChallenge() {
    navigate("/", { replace: true });
  }

  return (
    <>
      <div className="bg-scene" aria-hidden="true" />

      <div className="relative z-10 min-h-dvh p-4 sm:p-8 flex flex-col">
        <div className="w-full max-w-5xl mx-auto pt-6 pb-16">

          {/* Back */}
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-12 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: "var(--text-secondary)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Back to editor
          </button>

          <div className="flex flex-col lg:flex-row gap-12 mb-12">
            {/* Header & Score */}
            <div className="flex-1 flex flex-col items-center justify-center lg:items-start text-center lg:text-left fade-in">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ background: "rgba(129, 140, 248, 0.1)", color: "var(--accent-indigo)", border: "1px solid rgba(129, 140, 248, 0.2)" }}>
                Code Review Complete
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
                style={{ color: "var(--text-primary)" }}>
                {project.title}
              </h1>
              <div className="flex items-center gap-3">
                 <span className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                  {language}
                </span>
                <span className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                  {domain}
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end fade-in fade-in-delay-1">
              <ScoreRing score={review.overallScore} />
            </div>
          </div>

          {/* Strengths card */}
          <div className="glass-card mb-8 fade-in fade-in-delay-2 p-1" style={{ background: "linear-gradient(to right, rgba(52,211,153,0.05), transparent)", borderColor: "rgba(52,211,153,0.15)" }}>
            <div className="rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <span className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
              </span>
              <div>
                <h2 className="text-base font-bold tracking-wide mb-2" style={{ color: "var(--accent-emerald)", textShadow: "0 0 20px rgba(52,211,153,0.4)" }}>
                  What You Did Well
                </h2>
                <div className="text-sm sm:text-base leading-relaxed markdown-prose" style={{ color: "var(--text-primary)" }}>
                   <ReactMarkdown>{review.strengths}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Score cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 fade-in fade-in-delay-3">
            <ScoreCard
              title="Architecture"
              score={review.architectureQuality.score}
              feedback={review.architectureQuality.feedback}
              accentColor="var(--accent-indigo)"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-indigo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>}
            />
            <ScoreCard
              title="Naming Convention"
              score={review.naming.score}
              feedback={review.naming.feedback}
              accentColor="var(--accent-cyan)"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>}
            />
            <ScoreCard
              title="Error Handling"
              score={review.errorHandling.score}
              feedback={review.errorHandling.feedback}
              accentColor="var(--accent-amber)"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>}
            />
          </div>

          {/* Improvement card */}
          <div className="glass-card mb-12 fade-in fade-in-delay-4 overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-indigo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  </span>
                  <h2 className="text-lg font-bold tracking-wide" style={{ color: "var(--accent-indigo)" }}>
                    One Area To Improve
                  </h2>
                </div>
                <div className="text-[15px] leading-relaxed mb-6 markdown-prose" style={{ color: "var(--text-secondary)" }}>
                  <ReactMarkdown>{review.improvement.description}</ReactMarkdown>
                </div>
              </div>

              {review.improvement.codeExample && (
                <div className="flex-1 w-full md:max-w-md rounded-xl overflow-hidden shadow-2xl"
                  style={{ background: "#1e1e1e", border: "1px solid var(--border-subtle)" }}>
                  <div className="px-4 py-3 flex items-center gap-2"
                    style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="w-3 h-3 rounded-full" style={{ background: "var(--accent-rose)" }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: "var(--accent-amber)" }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: "var(--accent-emerald)" }} />
                    <span className="text-[11px] ml-2 font-mono uppercase tracking-widest font-bold" style={{ color: "var(--text-muted)" }}>Suggested Fix</span>
                  </div>
                  <pre className="p-5 text-sm leading-relaxed overflow-x-auto"
                    style={{ fontFamily: "var(--font-mono)", color: "#d4d4d4" }}>
                    <code>{review.improvement.codeExample}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center fade-in fade-in-delay-5 mb-10">
            <button
              id="next-challenge-btn"
              className="btn-glow px-10 py-4 shadow-[0_0_40px_rgba(99,102,241,0.25)] text-lg"
              onClick={handleNextChallenge}
            >
              Start Next Challenge
              <svg className="ml-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
