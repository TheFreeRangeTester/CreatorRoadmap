import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MemStorage } from '../storage';
import type { InsertUser, InsertIdea, InsertVote, SuggestIdea, UpdateProfile, UpdateSubscription } from '../../shared/schema';

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('User Operations', () => {
    const testUser: InsertUser = {
      username: 'testuser',
      password: 'hashedpassword',
      email: 'test@example.com',
      userRole: 'creator',
    };

    it('should create a user', async () => {
      const user = await storage.createUser(testUser);
      
      expect(user.id).toBe(1);
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.userRole).toBe('creator');
      expect(user.subscriptionStatus).toBe('free');
      expect(user.hasUsedTrial).toBe(false);
    });

    it('should get user by id', async () => {
      const createdUser = await storage.createUser(testUser);
      const user = await storage.getUser(createdUser.id);
      
      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
    });

    it('should get user by username', async () => {
      await storage.createUser(testUser);
      const user = await storage.getUserByUsername('testuser');
      
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should get user by email', async () => {
      await storage.createUser(testUser);
      const user = await storage.getUserByEmail('test@example.com');
      
      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
    });

    it('should return undefined for non-existent user', async () => {
      const user = await storage.getUser(999);
      expect(user).toBeUndefined();
    });

    it('should update user profile', async () => {
      const createdUser = await storage.createUser(testUser);
      const profileUpdate: UpdateProfile = {
        profileDescription: 'Updated description',
        logoUrl: 'https://example.com/logo.png',
        twitterUrl: 'https://twitter.com/testuser',
      };

      const updatedUser = await storage.updateUserProfile(createdUser.id, profileUpdate);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.profileDescription).toBe('Updated description');
      expect(updatedUser?.logoUrl).toBe('https://example.com/logo.png');
      expect(updatedUser?.twitterUrl).toBe('https://twitter.com/testuser');
    });

    it('should update user password', async () => {
      const createdUser = await storage.createUser(testUser);
      const newHashedPassword = 'newhashedpassword';

      const updatedUser = await storage.updateUserPassword(createdUser.id, newHashedPassword);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.password).toBe(newHashedPassword);
    });

    it('should update user subscription', async () => {
      const createdUser = await storage.createUser(testUser);
      const subscriptionUpdate: UpdateSubscription = {
        subscriptionStatus: 'premium',
        subscriptionPlan: 'monthly',
        stripeCustomerId: 'cus_test123',
      };

      const updatedUser = await storage.updateUserSubscription(createdUser.id, subscriptionUpdate);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.subscriptionStatus).toBe('premium');
      expect(updatedUser?.subscriptionPlan).toBe('monthly');
      expect(updatedUser?.stripeCustomerId).toBe('cus_test123');
    });

    it('should start user trial', async () => {
      const createdUser = await storage.createUser(testUser);
      const updatedUser = await storage.startUserTrial(createdUser.id);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.subscriptionStatus).toBe('trial');
      expect(updatedUser?.hasUsedTrial).toBe(true);
      expect(updatedUser?.trialStartDate).toBeInstanceOf(Date);
      expect(updatedUser?.trialEndDate).toBeInstanceOf(Date);
    });

    it('should get user by stripe customer id', async () => {
      const createdUser = await storage.createUser(testUser);
      await storage.updateUserSubscription(createdUser.id, { stripeCustomerId: 'cus_test123' });
      
      const user = await storage.getUserByStripeCustomerId('cus_test123');
      
      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
    });
  });

  describe('Idea Operations', () => {
    let userId: number;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'creator',
        password: 'password',
        email: 'creator@example.com',
        userRole: 'creator',
      });
      userId = user.id;
    });

    const testIdea: InsertIdea = {
      title: 'Test Idea',
      description: 'This is a test idea',
    };

    it('should create an idea', async () => {
      const idea = await storage.createIdea(testIdea, userId);
      
      expect(idea.id).toBe(1);
      expect(idea.title).toBe('Test Idea');
      expect(idea.description).toBe('This is a test idea');
      expect(idea.votes).toBe(0);
      expect(idea.creatorId).toBe(userId);
      expect(idea.status).toBe('approved');
    });

    it('should get all ideas', async () => {
      await storage.createIdea(testIdea, userId);
      await storage.createIdea({ ...testIdea, title: 'Second Idea' }, userId);
      
      const ideas = await storage.getIdeas();
      
      expect(ideas).toHaveLength(2);
      expect(ideas[0].title).toBe('Test Idea');
      expect(ideas[1].title).toBe('Second Idea');
    });

    it('should get idea by id', async () => {
      const createdIdea = await storage.createIdea(testIdea, userId);
      const idea = await storage.getIdea(createdIdea.id);
      
      expect(idea).toBeDefined();
      expect(idea?.title).toBe('Test Idea');
    });

    it('should update an idea', async () => {
      const createdIdea = await storage.createIdea(testIdea, userId);
      const updateData = {
        title: 'Updated Idea',
        description: 'Updated description',
      };

      const updatedIdea = await storage.updateIdea(createdIdea.id, updateData);
      
      expect(updatedIdea).toBeDefined();
      expect(updatedIdea?.title).toBe('Updated Idea');
      expect(updatedIdea?.description).toBe('Updated description');
    });

    it('should delete an idea', async () => {
      const createdIdea = await storage.createIdea(testIdea, userId);
      
      await storage.deleteIdea(createdIdea.id);
      
      const deletedIdea = await storage.getIdea(createdIdea.id);
      expect(deletedIdea).toBeUndefined();
    });

    it('should suggest an idea', async () => {
      const suggestion: SuggestIdea = {
        title: 'Suggested Idea',
        description: 'This is a suggested idea',
        creatorId: userId,
      };

      const audienceUser = await storage.createUser({
        username: 'audience',
        password: 'password',
        email: 'audience@example.com',
        userRole: 'audience',
      });

      const suggestedIdea = await storage.suggestIdea(suggestion, audienceUser.id);
      
      expect(suggestedIdea.title).toBe('Suggested Idea');
      expect(suggestedIdea.status).toBe('pending');
      expect(suggestedIdea.suggestedBy).toBe(audienceUser.id);
      expect(suggestedIdea.creatorId).toBe(userId);
    });

    it('should approve an idea', async () => {
      const suggestion: SuggestIdea = {
        title: 'Pending Idea',
        description: 'This idea needs approval',
        creatorId: userId,
      };

      const audienceUser = await storage.createUser({
        username: 'audience',
        password: 'password',
        email: 'audience@example.com',
        userRole: 'audience',
      });

      const suggestedIdea = await storage.suggestIdea(suggestion, audienceUser.id);
      const approvedIdea = await storage.approveIdea(suggestedIdea.id);
      
      expect(approvedIdea).toBeDefined();
      expect(approvedIdea?.status).toBe('approved');
    });

    it('should get pending ideas for creator', async () => {
      const suggestion: SuggestIdea = {
        title: 'Pending Idea',
        description: 'This idea needs approval',
        creatorId: userId,
      };

      const audienceUser = await storage.createUser({
        username: 'audience',
        password: 'password',
        email: 'audience@example.com',
        userRole: 'audience',
      });

      await storage.suggestIdea(suggestion, audienceUser.id);
      const pendingIdeas = await storage.getPendingIdeas(userId);
      
      expect(pendingIdeas).toHaveLength(1);
      expect(pendingIdeas[0].status).toBe('pending');
    });
  });

  describe('Vote Operations', () => {
    let userId: number;
    let ideaId: number;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'voter',
        password: 'password',
        email: 'voter@example.com',
        userRole: 'audience',
      });
      userId = user.id;

      const creator = await storage.createUser({
        username: 'creator',
        password: 'password',
        email: 'creator@example.com',
        userRole: 'creator',
      });

      const idea = await storage.createIdea({
        title: 'Test Idea',
        description: 'Vote for this',
      }, creator.id);
      ideaId = idea.id;
    });

    it('should create a vote', async () => {
      const voteData: InsertVote = {
        ideaId,
      };

      const vote = await storage.createVote(voteData, userId);
      
      expect(vote.ideaId).toBe(ideaId);
      expect(vote.userId).toBe(userId);
      expect(vote.votedAt).toBeInstanceOf(Date);
    });

    it('should create a vote with session id', async () => {
      const voteData: InsertVote = {
        ideaId,
      };

      const vote = await storage.createVote(voteData, undefined, 'session123');
      
      expect(vote.ideaId).toBe(ideaId);
      expect(vote.sessionId).toBe('session123');
      expect(vote.userId).toBeNull();
    });

    it('should get vote by user', async () => {
      const voteData: InsertVote = {
        ideaId,
      };

      await storage.createVote(voteData, userId);
      const existingVote = await storage.getVoteByUserOrSession(ideaId, userId);
      
      expect(existingVote).toBeDefined();
      expect(existingVote?.userId).toBe(userId);
    });

    it('should get vote by session', async () => {
      const voteData: InsertVote = {
        ideaId,
      };

      await storage.createVote(voteData, undefined, 'session123');
      const existingVote = await storage.getVoteByUserOrSession(ideaId, undefined, 'session123');
      
      expect(existingVote).toBeDefined();
      expect(existingVote?.sessionId).toBe('session123');
    });

    it('should increment vote count', async () => {
      const ideaBefore = await storage.getIdea(ideaId);
      expect(ideaBefore?.votes).toBe(0);

      await storage.incrementVote(ideaId);
      
      const ideaAfter = await storage.getIdea(ideaId);
      expect(ideaAfter?.votes).toBe(1);
    });
  });

  describe('Public Link Operations', () => {
    let userId: number;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'creator',
        password: 'password',
        email: 'creator@example.com',
        userRole: 'creator',
      });
      userId = user.id;
    });

    it('should create a public link', async () => {
      const publicLink = await storage.createPublicLink(userId);
      
      expect(publicLink.id).toBe(1);
      expect(publicLink.creatorId).toBe(userId);
      expect(publicLink.token).toBeDefined();
      expect(publicLink.isActive).toBe(true);
      expect(publicLink.url).toContain(publicLink.token);
    });

    it('should create a public link with expiration', async () => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const publicLink = await storage.createPublicLink(userId, { expiresAt });
      
      expect(publicLink.expiresAt).toEqual(expiresAt);
    });

    it('should get public link by token', async () => {
      const createdLink = await storage.createPublicLink(userId);
      const foundLink = await storage.getPublicLinkByToken(createdLink.token);
      
      expect(foundLink).toBeDefined();
      expect(foundLink?.creatorId).toBe(userId);
    });

    it('should get user public links', async () => {
      await storage.createPublicLink(userId);
      await storage.createPublicLink(userId);
      
      const userLinks = await storage.getUserPublicLinks(userId);
      
      expect(userLinks).toHaveLength(2);
      expect(userLinks[0].creatorId).toBe(userId);
    });

    it('should toggle public link status', async () => {
      const createdLink = await storage.createPublicLink(userId);
      
      const deactivatedLink = await storage.togglePublicLinkStatus(createdLink.id, false);
      expect(deactivatedLink?.isActive).toBe(false);
      
      const reactivatedLink = await storage.togglePublicLinkStatus(createdLink.id, true);
      expect(reactivatedLink?.isActive).toBe(true);
    });

    it('should delete public link', async () => {
      const createdLink = await storage.createPublicLink(userId);
      
      await storage.deletePublicLink(createdLink.id);
      
      const deletedLink = await storage.getPublicLinkByToken(createdLink.token);
      expect(deletedLink).toBeUndefined();
    });
  });

  describe('Statistics Operations', () => {
    let creatorId: number;
    let audienceId: number;

    beforeEach(async () => {
      const creator = await storage.createUser({
        username: 'creator',
        password: 'password',
        email: 'creator@example.com',
        userRole: 'creator',
      });
      creatorId = creator.id;

      const audience = await storage.createUser({
        username: 'audience',
        password: 'password',
        email: 'audience@example.com',
        userRole: 'audience',
      });
      audienceId = audience.id;
    });

    it('should get audience stats', async () => {
      // Create ideas and votes to test stats
      const idea1 = await storage.createIdea({
        title: 'Idea 1',
        description: 'Description 1',
      }, creatorId);

      const idea2 = await storage.createIdea({
        title: 'Idea 2',
        description: 'Description 2',
      }, creatorId);

      // Suggest ideas
      await storage.suggestIdea({
        title: 'Suggested 1',
        description: 'Suggested description',
        creatorId,
      }, audienceId);

      // Approve the suggestion
      const suggestion = await storage.suggestIdea({
        title: 'Suggested 2',
        description: 'Suggested description 2',
        creatorId,
      }, audienceId);
      await storage.approveIdea(suggestion.id);

      // Vote on ideas
      await storage.createVote({ ideaId: idea1.id }, audienceId);
      await storage.createVote({ ideaId: idea2.id }, audienceId);

      const stats = await storage.getUserAudienceStats(audienceId);
      
      expect(stats.votesGiven).toBe(2);
      expect(stats.ideasSuggested).toBe(2);
      expect(stats.ideasApproved).toBe(1);
    });

    it('should get user idea quota', async () => {
      // Create some ideas for the user
      await storage.createIdea({
        title: 'Idea 1',
        description: 'Description 1',
      }, creatorId);

      await storage.createIdea({
        title: 'Idea 2',
        description: 'Description 2',
      }, creatorId);

      const quota = await storage.getUserIdeaQuota(creatorId);
      
      expect(quota.count).toBe(2);
      expect(quota.limit).toBe(5); // Default limit for free users
      expect(quota.hasReachedLimit).toBe(false);
    });

    it('should check if user has reached idea limit', async () => {
      // Create 5 ideas (the free limit)
      for (let i = 1; i <= 5; i++) {
        await storage.createIdea({
          title: `Idea ${i}`,
          description: `Description ${i}`,
        }, creatorId);
      }

      const quota = await storage.getUserIdeaQuota(creatorId);
      
      expect(quota.count).toBe(5);
      expect(quota.limit).toBe(5);
      expect(quota.hasReachedLimit).toBe(true);
    });
  });

  describe('Position Operations', () => {
    let creatorId: number;

    beforeEach(async () => {
      const creator = await storage.createUser({
        username: 'creator',
        password: 'password',
        email: 'creator@example.com',
        userRole: 'creator',
      });
      creatorId = creator.id;
    });

    it('should update positions based on votes', async () => {
      // Create ideas with different vote counts
      const idea1 = await storage.createIdea({
        title: 'Idea 1',
        description: 'Description 1',
      }, creatorId);

      const idea2 = await storage.createIdea({
        title: 'Idea 2',
        description: 'Description 2',
      }, creatorId);

      // Add votes to make idea2 rank higher
      await storage.incrementVote(idea2.id);
      await storage.incrementVote(idea2.id);
      await storage.incrementVote(idea1.id);

      await storage.updatePositions();

      const ideasWithPositions = await storage.getIdeasWithPositions();
      
      // Ideas should be sorted by votes descending
      expect(ideasWithPositions[0].id).toBe(idea2.id);
      expect(ideasWithPositions[0].position.current).toBe(1);
      expect(ideasWithPositions[1].id).toBe(idea1.id);
      expect(ideasWithPositions[1].position.current).toBe(2);
    });
  });
});