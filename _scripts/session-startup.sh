#!/bin/bash

# Session Startup Report Generator
# Run this at the start of a session to provide context efficiently

echo "=========================================="
echo "SESSION STARTUP REPORT"
echo "Generated: $(date)"
echo "=========================================="
echo ""

echo "## GIT STATUS"
echo "----------------------------------------"
git status --short
echo ""
echo "Current branch: $(git branch --show-current)"
echo "Last 5 commits:"
git log -5 --oneline
echo ""

echo "## NETLIFY STATUS"
echo "----------------------------------------"
if command -v netlify &> /dev/null; then
    netlify status 2>&1 || echo "Netlify CLI not authenticated or not configured"
else
    echo "Netlify CLI not installed"
fi
echo ""

echo "## RECENT BUILD STATUS"
echo "----------------------------------------"
if [ -f "build/index.html" ]; then
    echo "Build exists: YES"
    echo "Build timestamp: $(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" build/index.html 2>/dev/null || stat -c "%y" build/index.html 2>/dev/null)"
    echo "Build size: $(du -sh build 2>/dev/null | cut -f1)"
else
    echo "Build exists: NO"
fi
echo ""

echo "## FIREBASE STATUS"
echo "----------------------------------------"
if command -v firebase &> /dev/null; then
    firebase projects:list 2>&1 | head -10 || echo "Firebase CLI not authenticated"
else
    echo "Firebase CLI not installed"
fi
echo ""

echo "## PACKAGE STATUS"
echo "----------------------------------------"
echo "Node version: $(node --version 2>/dev/null || echo 'Not found')"
echo "npm version: $(npm --version 2>/dev/null || echo 'Not found')"
echo "pnpm version: $(pnpm --version 2>/dev/null || echo 'Not found')"
echo ""
if [ -f "package.json" ]; then
    echo "Project dependencies status:"
    if [ -d "node_modules" ]; then
        echo "  node_modules: EXISTS"
    else
        echo "  node_modules: MISSING (run pnpm install)"
    fi
fi
echo ""

echo "## RECENT TEST RESULTS"
echo "----------------------------------------"
echo "Running quick test check..."
pnpm test --run 2>&1 | tail -20 || echo "Tests not available or failed"
echo ""

echo "## ENVIRONMENT FILES"
echo "----------------------------------------"
ls -la .env* 2>/dev/null | grep -v ".example" || echo "No .env files found"
echo ""

echo "## OUTSTANDING TODOS/NOTES"
echo "----------------------------------------"
if [ -d "_notes" ]; then
    echo "Most recent session note: $(ls -t _notes/end-session-*.md 2>/dev/null | head -1)"
fi
if [ -f "TODO.md" ]; then
    echo ""
    echo "TODO.md exists - showing first 20 lines:"
    head -20 TODO.md
fi
echo ""

echo "=========================================="
echo "END OF REPORT"
echo "=========================================="
