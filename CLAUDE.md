# EdTech Architecture Engine — Project Memory File

> Claude Code reads this file at the start of every session.
> Never delete this file. Update it as the project evolves.

---

## What This Project Is

**Product name:** EdTech Architecture Engine  
**Hackathon:** Google Solution Challenge 2026 — Build with AI (Hack2Skill)  
**Track:** Open Innovation (PS5 — Smart Resource Allocation)  
**Solo developer:** Pranjal  
**Prototype submission deadline:** April 24, 2026  
**Prize pool:** ₹10,00,000  

---

## The Problem We Are Solving

Indian engineering graduates know DSA and can solve LeetCode problems, but cannot write real-world project code. This is not an assumption — it is proven by data:

- Only **9.9% of Indian IT engineering graduates** can write functionally correct and compilable code (Aspiring Minds National Employability Survey)
- Nearly **90% lack the programming and algorithmic skills** required by IT product companies
- Only **3–4% of graduates** are fit for product engineer or startup engineer roles
- India produces **1.5 million engineering graduates annually** — only **10% secure jobs** (TeamLease 2024)
- Only **2.5% of graduates** have skills to work in AI; **4.5%** in data engineering

The root cause: colleges teach theory and DSA. They do not teach students how to design, architect, or build actual systems. There is no platform that trains this skill with real feedback.

---

## What We Are Building

A platform where:
1. A student selects their skill level, language, and domain
2. The AI generates a **real project assignment** (not a quiz, not a LeetCode problem)
3. The student builds the project and submits their code
4. The AI reviews their code **like a senior engineer** — evaluating architecture, design decisions, naming, error handling, and scalability — not just whether the output is correct
5. The student gets actionable feedback and a harder next challenge

**The key differentiator:** This is not LeetCode. LeetCode tests you. This platform *trains* you. One is a driving test. The other is driving school.

---

## Judging Criteria (Know This)

| Criterion | Weight |
|---|---|
| Technical Merit | 40% |
| Cause Alignment (PS alignment) | 25% |
| Innovation & Creativity | 25% |
| User Experience | 10% |

Judges also look for: AI usage justification (is AI genuinely adding value?), scalability, and security/privacy practices.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS |
| Backend | Node.js + Express |
| Database | Firebase Firestore |
| AI / LLM | Gemini API (Google AI Studio — free tier) |
| Code Editor in UI | Monaco Editor (same editor as VS Code) |
| Auth | Firebase Authentication (Google sign-in) |
| Hosting | Firebase Hosting |
| Version Control | GitHub (public repo for submission) |

---

## Project Folder Structure

```
edtech-architecture-engine/
├── CLAUDE.md                  ← you are here
├── .env                       ← API keys (never commit this)
├── .gitignore
├── README.md
│
├── client/                    ← React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SkillSetup.jsx         ← Screen 1: language/level/domain selection
│   │   │   ├── ProjectBrief.jsx       ← Screen 2: AI-generated project assignment
│   │   │   ├── CodeSubmission.jsx     ← Screen 3: Monaco editor + submit
│   │   │   └── ReviewResult.jsx       ← Screen 4: AI review report card
│   │   ├── firebase.js                ← Firebase config and init
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                    ← Node.js + Express backend
│   ├── index.js               ← Entry point, Express server setup
│   ├── routes/
│   │   ├── generate.js        ← POST /api/generate — generate project assignment
│   │   └── review.js          ← POST /api/review — submit code for AI review
│   ├── prompts/
│   │   ├── projectPrompt.js   ← Gemini prompt for generating assignments
│   │   └── reviewPrompt.js    ← Gemini prompt for senior engineer review
│   ├── .env
│   └── package.json
│
└── firebase.json              ← Firebase hosting config
```

---

## The 4 Screens (User Flow)

### Screen 1 — Skill Setup
- 3 dropdowns: **Language** (Python / JavaScript / Java), **Level** (Beginner / Intermediate / Advanced), **Domain** (Web Development / Systems / Data Engineering / APIs)
- One CTA button: "Generate My Project"
- Clean, minimal, nothing distracting

### Screen 2 — Project Brief
- Displays the AI-generated project: title, description, requirements list, constraints
- Shows estimated difficulty badge
- CTA: "Start Building" (navigates to Screen 3)

### Screen 3 — Code Submission
- Monaco Editor with syntax highlighting set to chosen language
- Student pastes or writes their code
- CTA: "Submit for Review"
- Show a loading state while AI processes (3–8 seconds)

### Screen 4 — Review Result
- 5 review cards displayed:
  1. **Architecture Quality** — did they design the system well?
  2. **Naming & Readability** — are variables, functions, classes named meaningfully?
  3. **Error Handling** — are edge cases and failures handled?
  4. **What You Did Well** — shown in a green card at the top, prominently
  5. **One Specific Improvement** — with an example code snippet
- Overall score badge
- CTA: "Next Challenge" (generates a harder project, same domain)

---

## The Two Most Important API Endpoints

### POST /api/generate
**Input:**
```json
{
  "language": "JavaScript",
  "level": "Intermediate",
  "domain": "Web Development"
}
```
**Output:**
```json
{
  "title": "Build a URL Shortener with Rate Limiting",
  "description": "...",
  "requirements": ["...", "..."],
  "constraints": ["No external libraries for the core logic", "..."],
  "difficulty": "Intermediate"
}
```

### POST /api/review
**Input:**
```json
{
  "studentCode": "...",
  "projectSpec": "...",
  "language": "JavaScript"
}
```
**Output:**
```json
{
  "architectureQuality": { "score": 7, "feedback": "..." },
  "naming": { "score": 8, "feedback": "..." },
  "errorHandling": { "score": 5, "feedback": "..." },
  "strengths": "Your rate-limiting logic is clean and the separation of concerns is clear.",
  "improvement": { "description": "...", "codeExample": "..." },
  "overallScore": 68
}
```

---

## The Gemini Review Prompt (Most Critical Part)

The `/api/review` endpoint must use this prompt structure. This is the soul of the product — do not make it generic:

```
You are a senior software engineer at a top Indian product company (think Razorpay, Zepto, or CRED). 
A fresher has submitted their code for a project assignment. 

Project they were given:
{projectSpec}

Language: {language}

Their code:
{studentCode}

Review their code as a senior engineer doing a real code review. 
Do NOT just check if the output is correct. Evaluate:
1. Architecture: Did they think about how to structure this properly?
2. Naming: Are variables, functions, and classes named like a professional would name them?
3. Error Handling: What happens when things go wrong? Are edge cases handled?
4. One specific strength: What did they do genuinely well?
5. One specific improvement: Give one concrete suggestion with an example code snippet.

Be honest but encouraging. This is a learning platform, not a rejection letter.
Respond ONLY in valid JSON with this exact structure:
{
  "architectureQuality": { "score": <1-10>, "feedback": "<2-3 sentences>" },
  "naming": { "score": <1-10>, "feedback": "<2-3 sentences>" },
  "errorHandling": { "score": <1-10>, "feedback": "<2-3 sentences>" },
  "strengths": "<1-2 sentences on what they did well>",
  "improvement": { 
    "description": "<what to improve and why>", 
    "codeExample": "<short code snippet showing the improvement>" 
  },
  "overallScore": <weighted average of the three scores>
}
```

---

## Environment Variables Needed

```
# server/.env
GEMINI_API_KEY=your_key_here
PORT=5000

# client/.env (Vite format)
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_BACKEND_URL=http://localhost:5000
```

---

## Build Priority Order

Always build in this order. Do not skip ahead:

1. **Backend first** — `/api/generate` working with Gemini
2. **Backend second** — `/api/review` working with Gemini, returning structured JSON
3. **Frontend screens** — connect to backend APIs
4. **Monaco Editor** — replace basic textarea with Monaco
5. **Firebase** — auth + Firestore session storage
6. **Polish** — loading states, error states, mobile responsiveness
7. **Deploy** — Firebase Hosting

---

## Known Constraints

- Solo developer, ~20 days until deadline
- Using Claude Code only (no Antigravity) for this build
- Free tier APIs only: Gemini AI Studio free tier, Firebase Spark plan
- Demo city / demo scope: works for any language and domain (no geographic restrictions, unlike NeighborScore)
- The Gemini API key comes from Google AI Studio (aistudio.google.com) — free, no credit card required

---

## What NOT to Build (Scope Control)

- No user authentication for the MVP (nice to have, not required for demo)
- No persistent user history for MVP
- No leaderboard or social features
- No multi-language simultaneous comparison
- No mobile app — web only

---

## Hackathon Submission Checklist

- [ ] Live prototype URL (Firebase Hosting)
- [ ] GitHub repo (public)
- [ ] README with problem statement + tech stack + screenshots
- [ ] Project deck (slides)
- [ ] Demo video (max 2 minutes)
- [ ] Problem statement document

---

## Key Stats to Use in Pitch / README

- 9.9% of Indian engineering graduates can write compilable code (Aspiring Minds)
- 90% lack skills required by IT product companies
- 1.5 million engineering graduates produced annually in India
- Only 10% secure jobs (TeamLease 2024)
- Source: https://iem.edu.in/news-events/real-reason-95-indian-engineers-cant-code/
- Source: https://www.business-standard.com/finance/personal-finance/only-10-of-india-s-1-5-mn-engineering-graduates-set-to-secure-jobs-this-yr-1240916001

---

*Last updated: April 2026 — Start of build phase*
