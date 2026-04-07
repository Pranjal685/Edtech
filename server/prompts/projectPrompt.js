function buildProjectPrompt(language, level, domain) {
  return `You are a senior software engineer at a top tech company. Your job is to create real-world project assignments for engineering students learning to build production-quality software.

Create a project assignment for a student with the following profile:
- Programming language: ${language}
- Skill level: ${level}
- Domain: ${domain}

The project must be:
- A realistic, buildable project (not a toy example or quiz)
- Appropriately scoped for the skill level
- Focused on architecture and design decisions, not just correctness
- Something that teaches real engineering skills (error handling, separation of concerns, naming, etc.)

Respond ONLY with valid JSON. No markdown, no backticks, no explanation. Just raw JSON with this exact structure:
{
  "title": "<short, descriptive project title>",
  "description": "<2-3 sentence description of what the student will build and why it matters>",
  "requirements": ["<requirement 1>", "<requirement 2>", "<requirement 3>", "<requirement 4>"],
  "constraints": ["<constraint 1>", "<constraint 2>"],
  "difficulty": "${level}"
}`;
}

module.exports = { buildProjectPrompt };
