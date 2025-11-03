import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { get, ref, set, update } from 'firebase/database';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Load the database rules from the rules file
  const rules = readFileSync('database.rules.json', 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    database: {
      host: '127.0.0.1',
      port: 9000,
      rules,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearDatabase();
});

describe('Database Rules Tests', () => {
  const userId = 'test-user-123';
  const otherUserId = 'other-user-456';
  const tableId = 'table-123';

  describe('Poker Table Rules', () => {
    describe('Table Creation and Updates', () => {
      test('authenticated user can create a table', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);

        await assertSucceeds(
          update(tableRef, {
            created: new Date().toISOString(),
            tableName: 'Test Table',
            ownerId: userId,
            ownerName: 'Test User',
            lastActivity: new Date().toISOString(),
          })
        );
      });

      test('unauthenticated user cannot create a table', async () => {
        const db = testEnv.unauthenticatedContext().database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);

        await assertFails(
          update(tableRef, {
            created: new Date().toISOString(),
            tableName: 'Test Table',
            ownerId: userId,
            ownerName: 'Test User',
          })
        );
      });

      test('user can update lastActivity field on their table', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);

        // First create the table
        await update(tableRef, {
          created: new Date().toISOString(),
          tableName: 'Test Table',
          ownerId: userId,
          ownerName: 'Test User',
          lastActivity: new Date().toISOString(),
        });

        // Then update lastActivity
        await assertSucceeds(
          update(tableRef, {
            lastActivity: new Date().toISOString(),
          })
        );
      });

      test('user can add timerSettings to table', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);

        await update(tableRef, {
          created: new Date().toISOString(),
          tableName: 'Test Table',
          ownerId: userId,
          ownerName: 'Test User',
          lastActivity: new Date().toISOString(),
        });

        await assertSucceeds(
          update(tableRef, {
            timerSettings: {
              enabled: true,
              duration: 60,
              onExpire: 'justStop',
            },
          })
        );
      });

      test('timerSettings validates duration range (10-600)', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);

        await update(tableRef, {
          created: new Date().toISOString(),
          tableName: 'Test Table',
          ownerId: userId,
          ownerName: 'Test User',
          lastActivity: new Date().toISOString(),
        });

        // Should fail with duration < 10
        await assertFails(
          update(tableRef, {
            timerSettings: {
              enabled: true,
              duration: 5,
              onExpire: 'justStop',
            },
          })
        );

        // Should fail with duration > 600
        await assertFails(
          update(tableRef, {
            timerSettings: {
              enabled: true,
              duration: 700,
              onExpire: 'justStop',
            },
          })
        );
      });

      test('timerSettings validates onExpire options', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);

        await update(tableRef, {
          created: new Date().toISOString(),
          tableName: 'Test Table',
          ownerId: userId,
          ownerName: 'Test User',
          lastActivity: new Date().toISOString(),
        });

        // Valid options should succeed
        for (const option of ['justStop', 'lockVoting', 'autoReveal']) {
          await assertSucceeds(
            update(tableRef, {
              timerSettings: {
                enabled: true,
                duration: 60,
                onExpire: option,
              },
            })
          );
        }

        // Invalid option should fail
        await assertFails(
          update(tableRef, {
            timerSettings: {
              enabled: true,
              duration: 60,
              onExpire: 'invalidOption',
            },
          })
        );
      });

      test('user can add votingScale to table', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);

        await update(tableRef, {
          created: new Date().toISOString(),
          tableName: 'Test Table',
          ownerId: userId,
          ownerName: 'Test User',
          lastActivity: new Date().toISOString(),
        });

        await assertSucceeds(
          update(tableRef, {
            votingScale: {
              type: 'fibonacci',
              customValues: '',
            },
          })
        );
      });

      test('votingScale validates type options', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);

        await update(tableRef, {
          created: new Date().toISOString(),
          tableName: 'Test Table',
          ownerId: userId,
          ownerName: 'Test User',
          lastActivity: new Date().toISOString(),
        });

        // Valid types should succeed
        for (const type of ['fibonacci', 'tshirt', 'powers-of-2', 'linear', 'custom']) {
          await assertSucceeds(
            update(tableRef, {
              votingScale: {
                type,
                customValues: '',
              },
            })
          );
        }

        // Invalid type should fail
        await assertFails(
          update(tableRef, {
            votingScale: {
              type: 'invalidType',
              customValues: '',
            },
          })
        );
      });
    });

    describe('Issue Rules', () => {
      beforeEach(async () => {
        // Create a table first
        const db = testEnv.authenticatedContext(userId).database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);
        await update(tableRef, {
          created: new Date().toISOString(),
          tableName: 'Test Table',
          ownerId: userId,
          ownerName: 'Test User',
          lastActivity: new Date().toISOString(),
        });
      });

      test('user can create an issue', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const issueRef = ref(db, `pokerTables/${userId}/${tableId}/issues/issue-1`);

        await assertSucceeds(
          set(issueRef, {
            title: 'Test Issue',
            created: new Date().toISOString(),
            isLocked: false,
            showVotes: false,
            finalScore: null,
          })
        );
      });

      test('issue requires title and created fields', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const issueRef = ref(db, `pokerTables/${userId}/${tableId}/issues/issue-1`);

        // Missing title should fail
        await assertFails(
          set(issueRef, {
            created: new Date().toISOString(),
          })
        );

        // Missing created should fail
        await assertFails(
          set(issueRef, {
            title: 'Test Issue',
          })
        );
      });

      test('issue title length validation', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const issueRef = ref(db, `pokerTables/${userId}/${tableId}/issues/issue-1`);

        // Title > 200 characters should fail
        const longTitle = 'a'.repeat(201);
        await assertFails(
          set(issueRef, {
            title: longTitle,
            created: new Date().toISOString(),
          })
        );

        // Title = 200 characters should succeed
        const maxTitle = 'a'.repeat(200);
        await assertSucceeds(
          set(issueRef, {
            title: maxTitle,
            created: new Date().toISOString(),
          })
        );
      });

      test('user can add timer state to issue', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const issueRef = ref(db, `pokerTables/${userId}/${tableId}/issues/issue-1`);

        await set(issueRef, {
          title: 'Test Issue',
          created: new Date().toISOString(),
        });

        await assertSucceeds(
          update(issueRef, {
            timer: {
              isActive: true,
              startedAt: new Date().toISOString(),
              remainingSeconds: 60,
            },
          })
        );
      });

      test('timer state validates field types', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const issueRef = ref(db, `pokerTables/${userId}/${tableId}/issues/issue-1`);

        await set(issueRef, {
          title: 'Test Issue',
          created: new Date().toISOString(),
        });

        // isActive must be boolean
        await assertFails(
          update(issueRef, {
            timer: {
              isActive: 'true', // string instead of boolean
              startedAt: new Date().toISOString(),
              remainingSeconds: 60,
            },
          })
        );

        // remainingSeconds must be number or null
        await assertFails(
          update(issueRef, {
            timer: {
              isActive: true,
              startedAt: new Date().toISOString(),
              remainingSeconds: '60', // string instead of number
            },
          })
        );
      });
    });

    describe('Vote Rules', () => {
      test('authenticated user can vote', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const voteRef = ref(db, `votes/issue-1/${userId}`);

        await assertSucceeds(
          set(voteRef, {
            vote: 5,
          })
        );
      });

      test('user can only update their own vote', async () => {
        const db = testEnv.authenticatedContext(otherUserId).database();
        const voteRef = ref(db, `votes/issue-1/${userId}`);

        await assertFails(
          set(voteRef, {
            vote: 5,
          })
        );
      });

      test('vote allows abstain value (-1)', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const voteRef = ref(db, `votes/issue-1/${userId}`);

        await assertSucceeds(
          set(voteRef, {
            vote: -1,
          })
        );
      });

      test('vote must be >= -1 or null', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const voteRef = ref(db, `votes/issue-1/${userId}`);

        // Valid votes
        await assertSucceeds(set(voteRef, { vote: null }));
        await assertSucceeds(set(voteRef, { vote: -1 }));
        await assertSucceeds(set(voteRef, { vote: 0 }));
        await assertSucceeds(set(voteRef, { vote: 5 }));

        // Invalid vote < -1
        await assertFails(
          set(voteRef, {
            vote: -2,
          })
        );
      });

      test('unauthenticated user cannot vote', async () => {
        const db = testEnv.unauthenticatedContext().database();
        const voteRef = ref(db, `votes/issue-1/${userId}`);

        await assertFails(
          set(voteRef, {
            vote: 5,
          })
        );
      });
    });

    describe('Participant Rules', () => {
      beforeEach(async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const tableRef = ref(db, `pokerTables/${userId}/${tableId}`);
        await update(tableRef, {
          created: new Date().toISOString(),
          tableName: 'Test Table',
          ownerId: userId,
          ownerName: 'Test User',
          lastActivity: new Date().toISOString(),
        });
      });

      test('user can add themselves as participant', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const participantRef = ref(db, `pokerTables/${userId}/${tableId}/participants/${userId}`);

        await assertSucceeds(
          set(participantRef, {
            uid: userId,
            displayName: 'Test User',
            joinedAt: new Date().toISOString(),
            isHost: true,
            role: 'voter',
          })
        );
      });

      test('user cannot add other users as participants', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const participantRef = ref(db, `pokerTables/${userId}/${tableId}/participants/${otherUserId}`);

        await assertFails(
          set(participantRef, {
            uid: otherUserId,
            displayName: 'Other User',
            joinedAt: new Date().toISOString(),
            isHost: false,
            role: 'voter',
          })
        );
      });

      test('participant role must be voter or spectator', async () => {
        const db = testEnv.authenticatedContext(userId).database();
        const participantRef = ref(db, `pokerTables/${userId}/${tableId}/participants/${userId}`);

        // Valid roles
        await assertSucceeds(
          set(participantRef, {
            uid: userId,
            displayName: 'Test User',
            joinedAt: new Date().toISOString(),
            isHost: true,
            role: 'voter',
          })
        );

        await assertSucceeds(
          set(participantRef, {
            uid: userId,
            displayName: 'Test User',
            joinedAt: new Date().toISOString(),
            isHost: true,
            role: 'spectator',
          })
        );

        // Invalid role
        await assertFails(
          set(participantRef, {
            uid: userId,
            displayName: 'Test User',
            joinedAt: new Date().toISOString(),
            isHost: true,
            role: 'admin',
          })
        );
      });
    });
  });
});
