#!/bin/bash

# Test Cleanup Function Locally
# This script helps you test the cleanup function without deploying

echo "🧹 Table Cleanup Function - Local Test"
echo "========================================"
echo ""

# Check if FIREBASE_SERVICE_ACCOUNT is set
if [ -z "$FIREBASE_SERVICE_ACCOUNT" ]; then
    echo "❌ ERROR: FIREBASE_SERVICE_ACCOUNT environment variable not set"
    echo ""
    echo "To test locally, you need to:"
    echo "1. Get your Firebase service account JSON from Firebase Console"
    echo "2. Set it as an environment variable:"
    echo ""
    echo "   export FIREBASE_SERVICE_ACCOUNT='<paste-json-here>'"
    echo ""
    echo "3. Run this script again"
    echo ""
    echo "See netlify/functions/CLEANUP_SETUP.md for detailed instructions"
    exit 1
fi

echo "✅ FIREBASE_SERVICE_ACCOUNT found"
echo ""

# Check if Netlify CLI is running
echo "📡 Checking if Netlify Dev is running..."
if ! curl -s http://localhost:8888 > /dev/null 2>&1; then
    echo "❌ Netlify Dev is not running"
    echo ""
    echo "Start it with: pnpm dev"
    echo "Then run this script in another terminal"
    exit 1
fi

echo "✅ Netlify Dev is running"
echo ""

# Trigger the function
echo "🚀 Triggering cleanup function..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8888/.netlify/functions/cleanup-old-tables)

echo "📊 Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q "Cleanup completed successfully"; then
    echo "✅ Cleanup function executed successfully!"

    DELETED=$(echo "$RESPONSE" | jq -r '.deleted' 2>/dev/null)
    if [ "$DELETED" != "null" ] && [ -n "$DELETED" ]; then
        echo "   Deleted $DELETED table(s)"
    fi
else
    echo "⚠️  Check the response above for errors"
fi

echo ""
echo "💡 Tip: Check your Firebase Console to verify tables were deleted"
