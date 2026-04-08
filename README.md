# Forge
The driving school for software engineers.

I built Forge because I realized there's a massive gap between knowing how to code and knowing how to build systems. It's an architecture engine that generates real project requirements, gives you a professional code editor to write your solution, and then reviews your code exactly like a senior engineer would. It doesn't just check if your code runs—it actually teaches you how to think about structuring software.

## The Problem

India produces 1.5 million engineering graduates annually, but the reality behind that number is staggering. According to the Aspiring Minds National Employability Survey, only 9.9% of Indian IT engineering graduates can actually write functionally correct and compilable code. Nearly 90% of them completely lack the programming and algorithmic skills required by IT product companies, leaving only 10% set to secure jobs this year. The root cause is simple: colleges teach theory and algorithms to pass generic tests, but they completely ignore how to design, architect, or build actual shipable products.

## How It Works

1. You choose your language, experience level, domain, and focus area to set your baseline.
2. Forge instantly generates a realistic project brief with specific technical constraints and requirements.
3. You write your solution directly in the browser using the integrated Monaco code editor.
4. The AI reviews your submission and provides a detailed breakdown of your architecture, naming conventions, and error handling.

## Why the Review Feels Different

Our code review evaluates your architecture, variable naming, and error handling rather than just checking if the output matches expected test cases. LeetCode and traditional platforms test you like a driving test, determining if you pass or fail. Forge acts as a driving school, giving you actionable feedback on how to design better systems so you can genuinely improve.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| AI Model | Gemini 1.5 Flash (via Google AI Studio) |
| Code Editor | Monaco Editor |
| Frontend Hosting | Firebase Hosting |
| Backend Hosting | Railway |

## Running Locally

**Prerequisites:**
- Node.js 18+
- Gemini API key (free at aistudio.google.com)

```bash
git clone https://github.com/Pranjal685/Edtech.git
cd Edtech
cd client && npm install
cd ../server && npm install
cp .env.example .env
# add GEMINI_API_KEY
node index.js &
cd ../client
npm run dev
```

Open http://localhost:5173

## Hackathon Submission

Google Solution Challenge 2026 — Build with AI
GDG on Campus India × Hack2Skill
Open Innovation track — PS5 alignment: Smart Resource Allocation

Forge fits the hackathon judging criteria by using AI as the core evaluation engine that scales high-quality mentorship to millions of students. It aligns with the Smart Resource Allocation problem statement by providing personalized, automated educational resources to upskill the massive surplus of unemployable engineering graduates, directly tackling the critical skill gap in the country.

## Sources

https://iem.edu.in/news-events/real-reason-95-indian-engineers-cant-code/
Real reason why 95% of Indian Engineers can't code.

https://www.business-standard.com/finance/personal-finance/only-10-of-india-s-1-5-mn-engineering-graduates-set-to-secure-jobs-this-yr-1240916001
Only 10% of India's 1.5 million engineering graduates are set to secure jobs this year.

## Live Demo

https://edtech-architecture-engine.web.app

Select Python, Intermediate, APIs, Rate Limiting and go through the full flow.

*The future belongs to those who build, and Forge is here to make sure you know how.*
