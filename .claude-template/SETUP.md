# Claude Code Setup for pointwith.me

## Quick Start

This is a template directory for Claude Code configuration. Your global gitignore likely excludes `.claude/`, so we provide this template instead.

### Installation

1. **Copy the template to .claude:**
   ```bash
   cp -r .claude-template .claude
   ```

2. **Install hook dependencies:**
   ```bash
   cd .claude/hooks
   npm install
   ```

3. **Start using Claude Code:**
   ```bash
   claude
   ```

### What's Included

- ✅ Frontend development guidelines skill (React/TypeScript/Firebase patterns)
- ✅ Specialized agents (error fixer, refactoring, documentation)
- ✅ Custom commands for planning and documentation
- ✅ Automated hooks for skill activation

### First Steps

After setup, try these commands:

```bash
# Get help with React components
"Create a new component for the game board"

# Fix build errors automatically
"Fix the TypeScript errors in the build"

# Create development documentation
/dev-docs implement user presence indicators
```

See the full README.md in this directory for detailed documentation.

---

*Part of the [Claude Code Infrastructure Showcase](https://github.com/keif/claude-code-infrastructure-showcase)*
