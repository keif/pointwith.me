# Database Rules Tests

## Overview

This directory contains integration tests for Firebase Realtime Database security rules. These tests help catch permission issues and schema validation errors before deploying to production.

## Prerequisites

### Java Runtime Environment (JRE)

The Firebase emulators require Java to run. Install Java if you haven't already:

**macOS:**
```bash
brew install openjdk@11
```

**Ubuntu/Debian:**
```bash
sudo apt-get install openjdk-11-jre
```

**Windows:**
Download and install from [java.com](https://www.java.com)

### Verify Java Installation

```bash
java -version
```

You should see output like:
```
openjdk version "11.0.x" ...
```

## Running Tests

### Run Rules Tests Only
```bash
pnpm test:rules
```

This command:
1. Starts the Firebase Database emulator
2. Loads `database.rules.json`
3. Runs all rules tests in `tests/database.rules.test.ts`
4. Shuts down the emulator

### Run All Tests (Unit + Rules)
```bash
pnpm test:all
```

### Start Emulator Manually
```bash
pnpm emulators
```

Then in another terminal:
```bash
pnpm test tests/database.rules.test.ts
```

The emulator UI will be available at: http://localhost:4000

## What These Tests Catch

The database rules tests verify:

✅ **Permission Errors** - Catches `PERMISSION_DENIED` errors before deployment
✅ **Schema Validation** - Ensures required fields exist and have correct types
✅ **Field Constraints** - Validates string lengths, number ranges, enum values
✅ **Authentication** - Tests authenticated vs. unauthenticated access
✅ **Ownership** - Verifies users can only modify their own data

## Test Coverage

Current test coverage includes:

- **Table Rules**
  - Creation and updates
  - `lastActivity` field (catches the permission issue we just encountered)
  - `timerSettings` validation (enabled, duration, onExpire)
  - `votingScale` validation (type, customValues)

- **Issue Rules**
  - Required fields (title, created)
  - Field validation (title length, types)
  - Timer state (isActive, startedAt, remainingSeconds)

- **Vote Rules**
  - User can only vote as themselves
  - Abstain value (-1) is allowed
  - Vote range validation (>= -1 or null)

- **Participant Rules**
  - Users can add themselves
  - Users cannot add others
  - Role validation (voter/spectator)

## Adding New Tests

When adding new fields to `database.rules.json`, add corresponding tests:

```typescript
test('new field validates correctly', async () => {
  const db = testEnv.authenticatedContext(userId).database();
  const ref = ref(db, 'path/to/data');

  // Test valid data
  await assertSucceeds(
    set(ref, { newField: 'valid value' })
  );

  // Test invalid data
  await assertFails(
    set(ref, { newField: 'invalid value' })
  );
});
```

## Continuous Integration

Add to your CI pipeline:

```yaml
- name: Install Java
  uses: actions/setup-java@v3
  with:
    distribution: 'temurin'
    java-version: '11'

- name: Run Database Rules Tests
  run: pnpm test:rules
```

## Troubleshooting

### "Java not found" error
- Install Java (see Prerequisites above)
- Ensure Java is in your PATH: `echo $PATH | grep java`

### "Port already in use"
- Stop other Firebase emulator instances
- Change ports in `firebase.json` emulators config

### Tests failing after rules changes
- Review the test output to see which assertions failed
- Update rules or tests as needed
- Deploy rules: `firebase deploy --only database`

## Benefits

These tests prevented the exact issue we encountered:
- Missing `lastActivity` field in rules caused `PERMISSION_DENIED` errors
- Tests caught it before users reported the bug
- Saved debugging time and improved reliability
