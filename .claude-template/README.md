# Claude Code Configuration for pointwith.me

This directory contains Claude Code infrastructure for the pointwith.me project - a collaborative story pointing application for remote teams.

## 🏗️ Structure

```
.claude/
├── agents/           # Specialized AI agents for complex tasks
├── commands/         # Slash commands for common operations
├── hooks/            # Event-driven automation hooks
├── skills/           # Domain-specific knowledge bases
├── settings.json     # Project-wide Claude Code settings
└── README.md         # This file
```

## 🤖 Agents

Specialized agents that handle complex, multi-step tasks:

- **frontend-error-fixer** - Diagnoses and fixes frontend build/runtime errors
- **web-research-specialist** - Researches solutions across GitHub, Stack Overflow, etc.
- **code-refactor-master** - Handles comprehensive code refactoring
- **documentation-architect** - Creates/updates project documentation
- **refactor-planner** - Analyzes and plans refactoring strategies
- **plan-reviewer** - Reviews development plans before implementation

## 📚 Skills

Domain-specific guidelines that activate contextually:

### frontend-dev-guidelines
**Type:** Guardrail (blocks non-compliant edits)
**Triggers:** When editing React/TypeScript components in `src/**/*.tsx`

Enforces best practices for:
- React component patterns (hooks, Suspense, lazy loading)
- TypeScript usage
- File organization
- Performance optimization
- Styling patterns

### skill-developer
**Type:** Domain skill
**Triggers:** Keywords like "skill system", "create skill", "hook system"

Meta-skill for creating and managing Claude Code skills and hooks.

## ⚙️ Hooks

Automated checks that run during development:

### skill-activation-prompt
**Event:** `UserPromptSubmit`
Analyzes user prompts and suggests relevant skills based on skill-rules.json

### post-tool-use-tracker
**Event:** `PostToolUse` (Edit/Write operations)
Tracks code changes and enforces skill guidelines when editing frontend code.

## 🔧 Commands

Custom slash commands for common tasks:

- `/dev-docs [description]` - Create comprehensive planning documentation
- `/dev-docs-update [context]` - Update existing development documentation

## 🚀 Setup

### Prerequisites
- Claude Code CLI installed
- Node.js 18+ for hook execution

### Installation

1. **Install hook dependencies:**
   ```bash
   cd .claude/hooks
   npm install
   ```

2. **Verify settings:**
   - Check `settings.json` for project permissions
   - Create `settings.local.json` for personal overrides (gitignored)

3. **Test the setup:**
   - Start Claude Code in the project
   - Try editing a file in `src/` - the frontend-dev-guidelines skill should activate

## 📖 Usage Examples

### Using Skills
```
# Trigger frontend guidelines
claude: "Create a new React component for user authentication"

# Get help with skill development
claude: "How do I create a custom skill?"
```

### Using Agents
```
# Fix frontend errors
claude: "I'm getting a build error in my React app"
→ frontend-error-fixer agent launches automatically

# Research solutions
claude: "Find best practices for Firebase Realtime Database with React"
→ web-research-specialist can be invoked
```

### Using Commands
```
# Create development plan
/dev-docs implement real-time presence tracking

# Update documentation
/dev-docs-update focus on authentication flow
```

## 🎯 Customization

### Modify Skill Triggers
Edit `.claude/skills/skill-rules.json` to customize when skills activate:

```json
{
  "frontend-dev-guidelines": {
    "fileTriggers": {
      "pathPatterns": [
        "src/**/*.tsx",  // Add your paths here
        "src/**/*.ts"
      ]
    }
  }
}
```

### Add New Skills
Create a new skill directory:
```bash
mkdir -p .claude/skills/my-skill
touch .claude/skills/my-skill/SKILL.md
```

See the `skill-developer` skill for detailed instructions.

## 🔍 Troubleshooting

### Hooks not running
1. Check hook permissions in `settings.json`
2. Verify npm packages installed in `.claude/hooks/`
3. Check hook file permissions (should be executable)

### Skills not activating
1. Review `.claude/skills/skill-rules.json` trigger patterns
2. Check file paths match your project structure
3. Verify skill SKILL.md files exist

### Permission errors
Add specific permissions to `settings.local.json`:
```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm test:*)",
      "Read(//path/to/specific/files/**)"
    ]
  }
}
```

## 📚 Learn More

- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Infrastructure Showcase](https://github.com/keif/claude-code-infrastructure-showcase)
- [Skill Development Guide](.claude/skills/skill-developer/SKILL.md)

## 🤝 Contributing

This configuration is part of the Claude Code infrastructure showcase. Improvements and additions are welcome!

---

*Integrated from [claude-code-infrastructure-showcase](https://github.com/keif/claude-code-infrastructure-showcase)*
