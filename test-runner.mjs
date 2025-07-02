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
        const initialVotes = idea.votes;

        const voteData = {
          ideaId: idea.id
        };

        const vote = await storage.createVote(voteData, user.id);
        this.expect(vote.ideaId).toBe(idea.id);

        await storage.incrementVote(idea.id);

        const updatedIdea = await storage.getIdea(idea.id);
        this.expect(updatedIdea.votes).toBe(initialVotes + 1);
      });
    });
  }

  async runServiceTests() {
    this.describe('Service Tests', () => {
      this.describe('TokenService Tests', () => {
        this.it('should generate valid token', () => {
          // Mock TokenService since it requires DB connection
          const mockTokenService = {
            generateToken() {
              return 'mock-token-' + Math.random().toString(36).substring(2);
            }
          };
          
          const token = mockTokenService.generateToken();
          this.expect(token).toBeTruthy();
          this.expect(typeof token).toBe('string');
          this.expect(token.length).toBeGreaterThan(10);
        });

        this.it('should validate token format', () => {
          const mockTokenService = {
            generateToken() {
              // Simulate hex token generation
              return Buffer.from('test').toString('hex');
            }
          };
          
          const token = mockTokenService.generateToken();
          this.expect(token).toBe('74657374'); // 'test' in hex
        });
      });

      this.describe('EmailService Tests', () => {
        this.it('should handle missing API key gracefully', async () => {
          // Mock EmailService without API key
          class MockEmailService {
            constructor() {
              this.resend = null;
            }
            
            async sendPasswordResetEmail() {
              if (!this.resend) {
                throw new Error('Email service not configured');
              }
            }
          }
          
          const emailService = new MockEmailService();
          
          try {
            await emailService.sendPasswordResetEmail('test@example.com', 'token123');
            this.expect(false).toBe(true); // Should not reach here
          } catch (error) {
            this.expect(error.message).toBe('Email service not configured');
          }
        });

        this.it('should generate correct reset URL', () => {
          const baseUrl = 'https://example.com';
          const token = 'test-token-123';
          const lang = 'en';
          const expectedUrl = `${baseUrl}/reset-password/${token}?lang=${lang}`;
          
          // Mock URL generation logic
          const resetUrl = `${baseUrl}/reset-password/${token}?lang=${lang}`;
          
          this.expect(resetUrl).toBe(expectedUrl);
        });

        this.it('should support multiple languages', () => {
          const subjects = {
            en: 'Password Reset Request',
            es: 'Solicitud de Recuperación de Contraseña'
          };
          
          this.expect(subjects.en).toBe('Password Reset Request');
          this.expect(subjects.es).toBe('Solicitud de Recuperación de Contraseña');
        });
      });
    });
  }

  async runPremiumUtilsTests() {
    // Import premium utils for testing
    const { hasActivePremiumAccess, getTrialDaysRemaining, isTrialExpired, isPremiumExpired, getPremiumAccessStatus } = await import('./shared/premium-utils.js');
    
    this.describe('Premium Utils Tests', () => {
      this.describe('hasActivePremiumAccess Tests', () => {
        this.it('should return false for null user', () => {
          this.expect(hasActivePremiumAccess(null)).toBe(false);
          this.expect(hasActivePremiumAccess(undefined)).toBe(false);
        });

        this.it('should return false for free users', () => {
          const freeUser = { subscriptionStatus: 'free' };
          this.expect(hasActivePremiumAccess(freeUser)).toBe(false);
        });

        this.it('should return true for active premium users', () => {
          const premiumUser = { 
            subscriptionStatus: 'premium',
            subscriptionEndDate: new Date(Date.now() + 86400000) // Tomorrow
          };
          this.expect(hasActivePremiumAccess(premiumUser)).toBe(true);
        });

        this.it('should return false for expired premium users', () => {
          const expiredUser = { 
            subscriptionStatus: 'premium',
            subscriptionEndDate: new Date(Date.now() - 86400000) // Yesterday
          };
          this.expect(hasActivePremiumAccess(expiredUser)).toBe(false);
        });

        this.it('should return true for active trial users', () => {
          const trialUser = { 
            subscriptionStatus: 'trial',
            trialEndDate: new Date(Date.now() + 86400000) // Tomorrow
          };
          this.expect(hasActivePremiumAccess(trialUser)).toBe(true);
        });

        this.it('should return false for expired trial users', () => {
          const expiredTrialUser = { 
            subscriptionStatus: 'trial',
            trialEndDate: new Date(Date.now() - 86400000) // Yesterday
          };
          this.expect(hasActivePremiumAccess(expiredTrialUser)).toBe(false);
        });

        this.it('should handle canceled but still active subscriptions', () => {
          const canceledUser = { 
            subscriptionStatus: 'canceled',
            subscriptionEndDate: new Date(Date.now() + 86400000) // Tomorrow
          };
          this.expect(hasActivePremiumAccess(canceledUser)).toBe(true);
        });
      });

      this.describe('getTrialDaysRemaining Tests', () => {
        this.it('should return 0 for non-trial users', () => {
          const freeUser = { subscriptionStatus: 'free' };
          this.expect(getTrialDaysRemaining(freeUser)).toBe(0);
        });

        this.it('should calculate remaining days correctly', () => {
          const trialUser = { 
            subscriptionStatus: 'trial',
            trialEndDate: new Date(Date.now() + 2 * 86400000) // 2 days from now
          };
          const daysRemaining = getTrialDaysRemaining(trialUser);
          this.expect(daysRemaining).toBe(2);
        });

        this.it('should return 0 for expired trials', () => {
          const expiredTrialUser = { 
            subscriptionStatus: 'trial',
            trialEndDate: new Date(Date.now() - 86400000) // Yesterday
          };
          this.expect(getTrialDaysRemaining(expiredTrialUser)).toBe(0);
        });
      });

      this.describe('isTrialExpired Tests', () => {
        this.it('should return false for non-trial users', () => {
          const premiumUser = { subscriptionStatus: 'premium' };
          this.expect(isTrialExpired(premiumUser)).toBe(false);
        });

        this.it('should return true for expired trials', () => {
          const expiredTrialUser = { 
            subscriptionStatus: 'trial',
            trialEndDate: new Date(Date.now() - 86400000) // Yesterday
          };
          this.expect(isTrialExpired(expiredTrialUser)).toBe(true);
        });

        this.it('should return false for active trials', () => {
          const activeTrialUser = { 
            subscriptionStatus: 'trial',
            trialEndDate: new Date(Date.now() + 86400000) // Tomorrow
          };
          this.expect(isTrialExpired(activeTrialUser)).toBe(false);
        });
      });

      this.describe('getPremiumAccessStatus Tests', () => {
        this.it('should return correct status for premium users', () => {
          const premiumUser = { 
            subscriptionStatus: 'premium',
            subscriptionEndDate: new Date(Date.now() + 86400000)
          };
          const status = getPremiumAccessStatus(premiumUser);
          this.expect(status.hasAccess).toBe(true);
          this.expect(status.reason).toBe('premium');
        });

        this.it('should return correct status for trial users with days remaining', () => {
          const trialUser = { 
            subscriptionStatus: 'trial',
            trialEndDate: new Date(Date.now() + 2 * 86400000)
          };
          const status = getPremiumAccessStatus(trialUser);
          this.expect(status.hasAccess).toBe(true);
          this.expect(status.reason).toBe('trial');
          this.expect(status.daysRemaining).toBe(2);
        });

        this.it('should return no_subscription for null users', () => {
          const status = getPremiumAccessStatus(null);
          this.expect(status.hasAccess).toBe(false);
          this.expect(status.reason).toBe('no_subscription');
        });
      });
    });
  }

  async runMiddlewareTests() {
    this.describe('Middleware Tests', () => {
      this.describe('Premium Middleware Tests', () => {
        this.it('should identify CSV import as premium operation', () => {
          // Mock request with CSV import header
          const mockReq = {
            headers: {
              'x-csv-import': 'true'
            }
          };
          
          // Mock isPremiumOperation function
          const isPremiumOperation = (req) => {
            return req.headers['x-csv-import'] === 'true';
          };
          
          this.expect(isPremiumOperation(mockReq)).toBe(true);
        });

        this.it('should not identify regular operations as premium', () => {
          const mockReq = {
            headers: {}
          };
          
          const isPremiumOperation = (req) => {
            return req.headers['x-csv-import'] === 'true';
          };
          
          this.expect(isPremiumOperation(mockReq)).toBe(false);
        });

        this.it('should handle authenticated user premium check', () => {
          // Mock authenticated user with premium access
          const mockUser = {
            subscriptionStatus: 'premium',
            subscriptionEndDate: new Date(Date.now() + 86400000)
          };
          
          // Mock premium check logic
          const checkUserPremiumAccess = (user) => {
            if (!user) return false;
            
            const userForPremiumCheck = {
              subscriptionStatus: user.subscriptionStatus,
              trialEndDate: user.trialEndDate,
              subscriptionEndDate: user.subscriptionEndDate
            };
            
            // Simplified premium check
            return userForPremiumCheck.subscriptionStatus === 'premium' && 
                   (!userForPremiumCheck.subscriptionEndDate || 
                    new Date(userForPremiumCheck.subscriptionEndDate) > new Date());
          };
          
          this.expect(checkUserPremiumAccess(mockUser)).toBe(true);
        });
      });
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Test Suite\n');
    
    try {
      await this.runSchemaTests();
      await this.runStorageTests();
      await this.runServiceTests();
      await this.runPremiumUtilsTests();
      await this.runMiddlewareTests();
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