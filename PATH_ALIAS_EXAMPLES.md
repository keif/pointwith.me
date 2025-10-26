# Path Alias Examples

The TypeScript migration includes a `@` path alias that makes imports cleaner and more maintainable.

## Configuration

### Vite Config (`vite.config.js`)
```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Vitest Config (`vitest.config.js`)
```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### TypeScript Config (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Before & After Examples

### Test Files

#### Before (Relative Paths)
```typescript
// src/components/Dashboard/index.test.tsx
import * as pokerTablesApi from '../../api/pokerTables';
import { Dashboard } from './index';

jest.mock('../../containers/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../firebase', () => ({
  auth: { /* ... */ }
}));

jest.mock('../../api/pokerTables', () => ({
  createClient: jest.fn()
}));
```

#### After (Path Aliases)
```typescript
// src/components/Dashboard/index.test.tsx
import * as pokerTablesApi from '@/api/pokerTables';
import { Dashboard } from './index';

jest.mock('@/containers/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('@/firebase', () => ({
  auth: { /* ... */ }
}));

jest.mock('@/api/pokerTables', () => ({
  createClient: jest.fn()
}));
```

### Component Files

#### Before
```typescript
// src/components/Issue/index.tsx
import { auth } from '../../firebase';
import * as db from '../../firebase/db';
import { calculateAverage } from '../../utils/voteCalculations';
```

#### After
```typescript
// src/components/Issue/index.tsx
import { auth } from '@/firebase';
import * as db from '@/firebase/db';
import { calculateAverage } from '@/utils/voteCalculations';
```

### API Files

#### Before
```typescript
// src/api/issues.test.ts
import * as db from '../firebase/db';
import { remove as firebaseRemove } from 'firebase/database';

jest.mock('../firebase/db', () => ({
  pokerTableIssue: jest.fn()
}));
```

#### After
```typescript
// src/api/issues.test.ts
import * as db from '@/firebase/db';
import { remove as firebaseRemove } from 'firebase/database';

jest.mock('@/firebase/db', () => ({
  pokerTableIssue: jest.fn()
}));
```

## Benefits

### 1. **Cleaner Imports**
- No more counting `../../../` levels
- Immediately clear where the module is located
- Consistent across all files

### 2. **Easier Refactoring**
- Moving files doesn't break imports
- No need to update relative paths when restructuring
- IDE refactoring tools work better

### 3. **Better Readability**
```typescript
// Hard to read
import { foo } from '../../../../../../../utils/foo';

// Easy to read
import { foo } from '@/utils/foo';
```

### 4. **Consistent Patterns**
- All cross-module imports use `@/`
- Local imports (same directory) use `./`
- Clear distinction between local and global modules

## Usage Guidelines

### When to Use `@` Alias

✅ **Use for:**
- Cross-module imports (different directories)
- Test file mocks
- Importing from shared utilities
- Importing from Firebase/API layers

```typescript
import { auth } from '@/firebase';
import { calculateAverage } from '@/utils/voteCalculations';
import { Dashboard } from '@/components/Dashboard';
```

### When to Use Relative Paths

✅ **Use for:**
- Importing from same directory
- Importing closely related files

```typescript
import { Dashboard } from './index';
import { PokerTableNameForm } from './PokerTableNameForm';
```

## IDE Support

Most modern IDEs support path aliases out of the box:

- **VS Code**: Automatically recognizes `tsconfig.json` paths
- **WebStorm**: Automatically recognizes webpack/vite aliases
- **Vim/Neovim**: Works with LSP (TypeScript language server)

### VS Code IntelliSense

The path alias works with:
- Auto-completion (Ctrl+Space)
- Go to Definition (F12)
- Find All References (Shift+F12)
- Auto-import suggestions

## Migration Stats

**Files Updated with Path Aliases:**
- 13 test files (`.test.ts` and `.test.tsx`)
- All using `@/` prefix for cleaner imports
- 100% of cross-module test imports converted

**Import Count Reduced:**
- Estimated ~150 import statements updated
- Average path length reduced by ~50%
- Improved readability across entire test suite
