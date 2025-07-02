import assert from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple test framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.currentSuite = null;
    this.stats = { passed: 0, failed: 0, total: 0 };
  }

  describe(name, fn) {
    this.currentSuite = name;
    console.log(`\n📋 ${name}`);
    fn();
    this.currentSuite = null;
  }

  it(name, fn) {
    this.stats.total++;
    try {
      fn();
      this.stats.passed++;
      console.log(`  ✅ ${name}`);
    } catch (error) {
      this.stats.failed++;
      console.log(`  ❌ ${name}`);
      console.log(`     Error: ${error.message}`);
    }
  }

  expect(actual) {
    return {
      toBe: (expected) => assert.strictEqual(actual, expected),
      toEqual: (expected) => assert.deepStrictEqual(actual, expected),
      toContain: (expected) => assert(actual.includes(expected)),
      toBeNull: () => assert.strictEqual(actual, null),
      toBeUndefined: () => assert.strictEqual(actual, undefined),
      toBeTruthy: () => assert(actual),
      toBeFalsy: () => assert(!actual),
      toThrow: () => {
        assert.throws(actual);
      }
    };
  }

  async runSchemaTests() {
    // Import the schemas
    const { 
      insertUserSchema, 
      userResponseSchema,
      insertIdeaSchema,
      suggestIdeaSchema,
      insertVoteSchema
    } = await import('./shared/schema.js');

    this.describe('Schema Validation Tests', () => {
      this.describe('User Schema Tests', () => {
        this.it('should validate valid user data', () => {
          const validUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            userRole: 'creator'
          };
          const result = insertUserSchema.safeParse(validUser);
          this.expect(result.success).toBe(true);
        });

        this.it('should reject invalid email', () => {
          const invalidUser = {
            username: 'testuser',
            email: 'invalid-email',
            password: 'password123',
            userRole: 'creator'
          };
          const result = insertUserSchema.safeParse(invalidUser);
          this.expect(result.success).toBe(false);
        });

        this.it('should reject short password', () => {
          const invalidUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: '123',
            userRole: 'creator'
          };
          const result = insertUserSchema.safeParse(invalidUser);
          this.expect(result.success).toBe(false);
        });
      });

      this.describe('Idea Schema Tests', () => {
        this.it('should validate valid idea data', () => {
          const validIdea = {
            title: 'Test Idea',
            description: 'This is a test idea description'
          };
          const result = insertIdeaSchema.safeParse(validIdea);
          this.expect(result.success).toBe(true);
        });

        this.it('should reject empty title', () => {
          const invalidIdea = {
            title: '',
            description: 'This is a test idea description'
          };
          const result = insertIdeaSchema.safeParse(invalidIdea);
          this.expect(result.success).toBe(false);
        });

        this.it('should reject very long title', () => {
          const invalidIdea = {
            title: 'x'.repeat(201),
            description: 'This is a test idea description'
          };
          const result = insertIdeaSchema.safeParse(invalidIdea);
          this.expect(result.success).toBe(false);
        });
      });

      this.describe('Vote Schema Tests', () => {
        this.it('should validate valid vote data', () => {
          const validVote = {
            ideaId: 1
          };
          const result = insertVoteSchema.safeParse(validVote);
          this.expect(result.success).toBe(true);
        });

        this.it('should require ideaId to be present', () => {
          const invalidVote = {};
          const result = insertVoteSchema.safeParse(invalidVote);
          this.expect(result.success).toBe(false);
        });
      });

      this.describe('Suggestion Schema Tests', () => {
        this.it('should validate valid suggestion data', () => {
          const validSuggestion = {
            title: 'Test Suggestion',
            description: 'This is a test suggestion',
            creatorId: 1
          };
          const result = suggestIdeaSchema.safeParse(validSuggestion);
          this.expect(result.success).toBe(true);
        });

        this.it('should reject invalid creatorId', () => {
          const invalidSuggestion = {
            title: 'Test Suggestion',
            description: 'This is a test suggestion',
            creatorId: 'invalid'
          };
          const result = suggestIdeaSchema.safeParse(invalidSuggestion);
          this.expect(result.success).toBe(false);
        });
      });
    });
  }

  async runStorageTests() {
    // Mock storage implementation for testing
    const { MemStorage } = await import('./server/storage.js');
    
    this.describe('Storage Tests', () => {
      let storage;

      this.it('should create storage instance', () => {
        storage = new MemStorage();
        this.expect(storage).toBeTruthy();
      });

      this.it('should create and retrieve user', async () => {
        const userData = {
          username: 'testuser',
          email: 'test@example.com',
          hashedPassword: 'hashedpassword123',
          userRole: 'creator'
        };

        const user = await storage.createUser(userData);
        this.expect(user.username).toBe('testuser');
        this.expect(user.email).toBe('test@example.com');

        const retrievedUser = await storage.getUser(user.id);
        this.expect(retrievedUser.username).toBe('testuser');
      });

      this.it('should create and retrieve idea', async () => {
        const userData = {
          username: 'creator',
          email: 'creator@example.com',
          hashedPassword: 'hashedpassword123',
          userRole: 'creator'
        };

        const user = await storage.createUser(userData);
        
        const ideaData = {
          title: 'Test Idea',
          description: 'This is a test idea'
        };

        const idea = await storage.createIdea(ideaData, user.id);
        this.expect(idea.title).toBe('Test Idea');
        this.expect(idea.creatorId).toBe(user.id);

        const retrievedIdea = await storage.getIdea(idea.id);
        this.expect(retrievedIdea.title).toBe('Test Idea');
      });

      this.it('should handle voting system', async () => {
        const userData = {
          username: 'voter',
          email: 'voter@example.com',
          hashedPassword: 'hashedpassword123',
          userRole: 'audience'
        };

        const user = await storage.createUser(userData);
        
        const ideaData = {
          title: 'Voteable Idea',
          description: 'This idea can be voted on'
        };

        const idea = await storage.createIdea(ideaData, user.id);
        this.expect(idea.votes).toBe(0); // New ideas start with 0 votes

        const voteData = {
          ideaId: idea.id
        };

        await storage.createVote(voteData, user.id);
        await storage.incrementVote(idea.id);

        const updatedIdea = await storage.getIdea(idea.id);
        this.expect(updatedIdea.votes).toBe(1); // Should be 1 after voting
      });
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Test Suite\n');
    
    try {
      await this.runSchemaTests();
      await this.runStorageTests();
    } catch (error) {
      console.error('Test execution failed:', error);
      this.stats.failed++;
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.stats.total}`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    
    const percentage = this.stats.total > 0 ? ((this.stats.passed / this.stats.total) * 100).toFixed(2) : 0;
    console.log(`📈 Success Rate: ${percentage}%`);

    if (this.stats.failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the output above.');
    }
  }
}

// Create global test functions
const runner = new TestRunner();
global.describe = runner.describe.bind(runner);
global.it = runner.it.bind(runner);
global.expect = runner.expect.bind(runner);

// Export runner for direct usage
export { TestRunner };

// Auto-run if this file is executed directly
if (process.argv[1] === __filename) {
  runner.runAllTests();
}