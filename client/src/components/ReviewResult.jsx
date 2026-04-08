import { useLocation, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import ProgressTracker from "./ProgressTracker";

/* ── Score Ring ── */
function ScoreRing({ score, size = 120, stroke = 9, arcOffset }) {
  const cx = size / 2;
  const r  = 45;

  let color = "#22c55e";
  if (score < 50) color = "#ef4444";
  else if (score < 80) color = "#eab308";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={283}
          strokeDashoffset={arcOffset !== undefined ? arcOffset : 283}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        lineHeight: 1, gap: 2,
      }}>
        <span className="tabular-nums" style={{ fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.04em", color, fontVariantNumeric: "tabular-nums" }}>{score}</span>
        <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500, letterSpacing: "0.06em" }}>/100</span>
      </div>
    </div>
  );
}

/* ── Score Card ── */
function ScoreCard({ title, score, feedback, icon, accent, barsVisible }) {
  const scorePercent = (score / 10) * 100;

  return (
    <div className="card-2" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: `${accent}12`, border: `1px solid ${accent}20`,
          }}>
            {icon}
          </span>
          <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-1)" }}>{title}</span>
        </div>
        <span className="tabular-nums" style={{ fontWeight: 800, fontSize: 18, color: accent }}>
          {score}<span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-3)" }}>/10</span>
        </span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{
          width: barsVisible ? `${scorePercent}%` : "0%",
          background: accent,
          transition: "width 0.6s ease-out",
        }} />
      </div>
      <div className="prose" style={{ fontSize: 12.5 }}>
        <ReactMarkdown>{feedback}</ReactMarkdown>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function ReviewResult() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const state     = location.state;
  const savedRef  = useRef(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [arcOffset, setArcOffset] = useState(283);
  const [barsVisible, setBarsVisible] = useState(false);

  if (!state?.review) return <Navigate to="/" replace />;

  const { review, project, language, level, domain, focusArea } = state;

  // Score color
  const scoreColor = review.overallScore >= 80 ? "#22c55e"
                   : review.overallScore >= 50 ? "#eab308"
                   : "#ef4444";

  useEffect(() => {
    if (!review?.overallScore) return;

    const target = review.overallScore;
    const duration = 800;
    const steps = 50;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayScore(Math.round(target));
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, interval);

    const circumference = 2 * Math.PI * 45;
    const finalOffset = circumference - (target / 100) * circumference;
    setTimeout(() => setArcOffset(finalOffset), 50);
    setTimeout(() => setBarsVisible(true), 100);

    return () => clearInterval(timer);
  }, [review]);

  // Save progress
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    try {
      const raw = localStorage.getItem("edtech_progress");
      const data = raw ? JSON.parse(raw) : { sessions: [] };
      data.sessions.push({
        date: new Date().toISOString(),
        projectTitle: project.title, language, domain, focusArea,
        overallScore: review.overallScore,
        architectureScore: review.architectureQuality.score,
        namingScore: review.naming.score,
        errorHandlingScore: review.errorHandling.score,
      });
      localStorage.setItem("edtech_progress", JSON.stringify(data));
    } catch (e) { console.error("Failed to save progress", e); }
  }, []);

  return (
    <div className="page-enter" style={st.root}>
      {/* ── Top bar ── */}
      <header style={st.topBar}>
        <button className="btn btn-ghost" style={{ padding: "5px 11px", fontSize: 13 }}
          onClick={() => navigate(-1)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          Editor
        </button>
        <div style={st.headerBadge}>
          <svg width="12" height="12" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Code Review Complete
        </div>
      </header>

      {/* ── Scroll container ── */}
      <div style={st.scroll}>
        <div style={st.inner}>

          {/* Row 1 — Title + Score circle */}
          <div style={st.row1}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={st.title}>{project.title}</h1>
              <div style={st.pills}>
                <span style={st.pill}>{language}</span>
                <span style={st.pill}>{domain}</span>
              </div>
            </div>
            <div style={st.ringWrap}>
              <ScoreRing score={displayScore} arcOffset={arcOffset} />
            </div>
          </div>

          {/* Row 2 — Strengths: compact */}
          <div style={st.strengthCard}>
            <div style={st.strengthLeft}>
              <span style={st.thumbIcon}>
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
              </span>
              <span style={{ fontWeight: 600, fontSize: 13, color: "var(--green)" }}>What You Did Well</span>
            </div>
            <div className="prose" style={{ flex: 1, fontSize: 13 }}>
              <ReactMarkdown>{review.strengths}</ReactMarkdown>
            </div>
          </div>

          {/* Row 3 — 3 Score cards */}
          <div style={st.cards3}>
            <ScoreCard
              title="Architecture" score={review.architectureQuality.score}
              feedback={review.architectureQuality.feedback} accent="#3b82f6" barsVisible={barsVisible}
              icon={<svg width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>}
            />
            <ScoreCard
              title="Naming" score={review.naming.score}
              feedback={review.naming.feedback} accent="#22c55e" barsVisible={barsVisible}
              icon={<svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>}
            />
            <ScoreCard
              title="Error Handling" score={review.errorHandling.score}
              feedback={review.errorHandling.feedback} accent="#eab308" barsVisible={barsVisible}
              icon={<svg width="16" height="16" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>}
            />
          </div>

          {/* Row 4 — Improvement: two columns */}
          {review.improvement && (
            <div className="card-2-static" style={st.improveCard}>
              <div style={st.improveLeft}>
                <div style={st.improveHeader}>
                  <svg width="14" height="14" fill="none" stroke="var(--text-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)" }}>One Area To Improve</span>
                </div>
                <div className="prose" style={{ fontSize: 13 }}>
                  <ReactMarkdown>{review.improvement.description}</ReactMarkdown>
                </div>
              </div>
              {review.improvement.codeExample && (
                <div style={st.codeBox}>
                  <div style={st.codeHeader}>
                    <span style={st.codeLabel}>suggested fix</span>
                  </div>
                  <pre style={st.codePre}>
                    <code>{review.improvement.codeExample}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Row 5 — Progress tracker */}
          <ProgressTracker />

          {/* Row 6 — CTA */}
          <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
            <button id="next-challenge-btn" className="btn btn-primary"
              style={{ padding: "11px 28px", fontSize: 14, fontWeight: 600 }}
              onClick={() => navigate("/", { replace: true })}>
              Start Next Challenge
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const trafficDot = (bg) => ({ width: 10, height: 10, borderRadius: "50%", background: bg, flexShrink: 0 });

const st = {
  root: {
    height: "100dvh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 24px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
    flexShrink: 0,
  },
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "var(--text-2)",
    background: "var(--green-dim)",
    border: "1px solid rgba(34,197,94,0.12)",
    borderRadius: 999,
    padding: "3px 11px",
    fontWeight: 500,
  },
  scroll: {
    flex: 1,
    overflowY: "auto",
  },
  inner: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  row1: {
    display: "flex",
    alignItems: "flex-start",
    gap: 24,
  },
  title: {
    fontSize: "clamp(18px, 2.2vw, 26px)",
    fontWeight: 700,
    letterSpacing: "-0.025em",
    color: "var(--text-1)",
    lineHeight: 1.25,
    marginBottom: 10,
  },
  pills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    fontSize: 11,
    padding: "3px 10px",
    background: "var(--surface-3)",
    border: "1px solid var(--border)",
    borderRadius: 999,
    color: "var(--text-3)",
  },
  ringWrap: {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  strengthCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    padding: "16px 20px",
    background: "var(--green-dim)",
    border: "1px solid rgba(34,197,94,0.12)",
    borderRadius: "var(--r-lg)",
  },
  strengthLeft: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    flexShrink: 0,
  },
  thumbIcon: {
    width: 32, height: 32,
    background: "#22c55e",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cards3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
  },
  improveCard: {
    display: "flex",
    gap: 20,
    padding: "20px",
    overflow: "hidden",
  },
  improveLeft: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  improveHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  codeBox: {
    width: "46%",
    minWidth: 200,
    flexShrink: 0,
    background: "#0a0a0b",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  codeHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderBottom: "1px solid var(--border)",
    background: "rgba(0,0,0,0.3)",
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-3)",
    fontFamily: "var(--mono)",
  },
  codePre: {
    flex: 1,
    overflowX: "auto",
    overflowY: "auto",
    padding: "14px",
    margin: 0,
    fontFamily: "var(--mono)",
    fontSize: 12,
    lineHeight: 1.6,
    color: "#d4d4d4",
    whiteSpace: "pre",
    maxHeight: 220,
  },
  trafficDot: trafficDot,
};
