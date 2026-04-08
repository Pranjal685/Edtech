import { useState, useEffect } from "react";

export default function ProgressTracker() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem("edtech_progress");
      if (data) {
        const p = JSON.parse(data);
        if (p.sessions && Array.isArray(p.sessions)) setSessions(p.sessions);
      }
    } catch (e) {
      console.error("Failed to load progress", e);
    }
  }, []);

  if (sessions.length === 0) {
    return (
      <div className="card-2-static" style={s.root}>
        <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)", marginBottom: 4 }}>
          Learning Journey
        </p>
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>
          Complete your first project to see progress here.
        </p>
      </div>
    );
  }

  const total   = sessions.length;
  const avg     = Math.round(sessions.reduce((a, s) => a + s.overallScore, 0) / total);
  const archAvg = (sessions.reduce((a, s) => a + (s.architectureScore || 0), 0) / total).toFixed(1);
  const nameAvg = (sessions.reduce((a, s) => a + (s.namingScore || 0), 0) / total).toFixed(1);
  const errAvg  = (sessions.reduce((a, s) => a + (s.errorHandlingScore || 0), 0) / total).toFixed(1);

  const cats = [
    { name: "Architecture", score: parseFloat(archAvg) },
    { name: "Naming",       score: parseFloat(nameAvg) },
    { name: "Error Handling", score: parseFloat(errAvg) },
  ].sort((a, b) => b.score - a.score);

  const recent = [...sessions].reverse().slice(0, 3);

  return (
    <div className="card-2-static" style={s.root}>
      <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)", marginBottom: 16 }}>
        Learning Journey
      </p>

      {/* Stats row — horizontal */}
      <div style={s.statsRow}>
        <Stat label="Projects" value={total} color="var(--text-1)" />
        <Stat label="Avg Score" value={avg} color={avg >= 70 ? "var(--green)" : avg >= 40 ? "var(--amber)" : "var(--red)"} />
        <Stat label="Strongest" value={cats[0].name} color="var(--accent)" small />
        <Stat label="Focus Next" value={cats[cats.length - 1].name} color="var(--amber)" small />
      </div>

      {/* Recent sessions */}
      {recent.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10 }}>
            Recent
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recent.map((session, i) => (
              <div key={i} style={s.sessionRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.projectTitle}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                    {new Date(session.date).toLocaleDateString()} · {session.language} · {session.domain}
                  </p>
                </div>
                <span className="tabular-nums" style={{
                  fontSize: 15, fontWeight: 800,
                  color: session.overallScore >= 70 ? "var(--green)" : session.overallScore >= 40 ? "var(--amber)" : "var(--red)",
                  flexShrink: 0,
                }}>
                  {session.overallScore}
                  <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-3)" }}>/100</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color, small }) {
  return (
    <div style={s.stat}>
      <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
      <p className="tabular-nums" style={{ fontSize: small ? 12 : 17, fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
    </div>
  );
}

const s = {
  root: {
    padding: "18px 20px",
  },
  statsRow: {
    display: "flex",
    gap: 0,
    borderRadius: "var(--r-md)",
    overflow: "hidden",
    border: "1px solid var(--border)",
  },
  stat: {
    flex: 1,
    padding: "12px 14px",
    borderRight: "1px solid var(--border)",
    background: "var(--surface-3)",
  },
  sessionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 10px",
    background: "var(--surface-3)",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--border)",
  },
};
