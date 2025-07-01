import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  simulateSuccessfulPayment,
  simulateSubscriptionCancellation,
  generateTestUrls,
  isTestMode,
  simulateWebhookEvent,
  createTestEventData,
  type TestPaymentData,
} from '../stripe-test-helpers';
import { MemStorage } from '../storage';

// Mock storage
let mockStorage: MemStorage;

jest.mock('../storage', () => {
  return {
    storage: mockStorage,
  };
});

describe('Stripe Test Helpers', () => {
  beforeEach(() => {
    mockStorage = new MemStorage();
    // Reset environment
    delete process.env.NODE_ENV;
    delete process.env.STRIPE_TEST_MODE;
  });

  describe('isTestMode', () => {
    it('should return true in development environment', () => {
      process.env.NODE_ENV = 'development';
      expect(isTestMode()).toBe(true);
    });

    it('should return true when STRIPE_TEST_MODE is set', () => {
      process.env.STRIPE_TEST_MODE = 'true';
      expect(isTestMode()).toBe(true);
    });

    it('should return false in production without test mode', () => {
      process.env.NODE_ENV = 'production';
      process.env.STRIPE_TEST_MODE = 'false';
      expect(isTestMode()).toBe(false);
    });

    it('should return false when neither condition is met', () => {
      process.env.NODE_ENV = 'production';
      expect(isTestMode()).toBe(false);
    });
  });

  describe('generateTestUrls', () => {
    it('should generate correct test URLs', () => {
      const baseUrl = 'https://example.com';
      const urls = generateTestUrls(baseUrl);

      expect(urls.success).toBe('https://example.com/payment/success?test=true');
      expect(urls.cancel).toBe('https://example.com/payment/cancel?test=true');
      expect(urls.failure).toBe('https://example.com/payment/failure?test=true');
    });

    it('should handle base URL with trailing slash', () => {
      const baseUrl = 'https://example.com/';
      const urls = generateTestUrls(baseUrl);

      expect(urls.success).toBe('https://example.com//payment/success?test=true');
    });

    it('should handle base URL without protocol', () => {
      const baseUrl = 'localhost:3000';
      const urls = generateTestUrls(baseUrl);

      expect(urls.success).toBe('localhost:3000/payment/success?test=true');
    });
  });

  describe('simulateWebhookEvent', () => {
    it('should create a valid webhook event structure', () => {
      const eventType = 'customer.subscription.created';
      const data = {
        id: 'sub_test123',
        customer: 'cus_test123',
        status: 'active',
      };

      const event = simulateWebhookEvent(eventType, data);

      expect(event.id).toMatch(/^evt_test_\d+$/);
      expect(event.object).toBe('event');
      expect(event.type).toBe(eventType);
      expect(event.data.object).toEqual(data);
      expect(event.livemode).toBe(false);
      expect(event.created).toBeInstanceOf(Number);
      expect(event.api_version).toBe('2023-10-16');
    });

    it('should create unique event IDs', () => {
      const event1 = simulateWebhookEvent('test.event', {});
      const event2 = simulateWebhookEvent('test.event', {});

      expect(event1.id).not.toBe(event2.id);
    });

    it('should include proper timestamp', () => {
      const beforeTime = Math.floor(Date.now() / 1000);
      const event = simulateWebhookEvent('test.event', {});
      const afterTime = Math.floor(Date.now() / 1000);

      expect(event.created).toBeGreaterThanOrEqual(beforeTime);
      expect(event.created).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('createTestEventData', () => {
    it('should create test data for monthly plan', () => {
      const userId = 123;
      const plan = 'monthly';

      const eventData = createTestEventData(userId, plan);

      expect(eventData.customer).toBe(`test_customer_${userId}`);
      expect(eventData.subscription).toMatch(/^test_sub_123_\d+$/);
      expect(eventData.plan).toBe('monthly');
      expect(eventData.amount).toBe(999); // $9.99 in cents
      expect(eventData.currency).toBe('usd');
      expect(eventData.interval).toBe('month');
    });

    it('should create test data for yearly plan', () => {
      const userId = 456;
      const plan = 'yearly';

      const eventData = createTestEventData(userId, plan);

      expect(eventData.customer).toBe(`test_customer_${userId}`);
      expect(eventData.subscription).toMatch(/^test_sub_456_\d+$/);
      expect(eventData.plan).toBe('yearly');
      expect(eventData.amount).toBe(9999); // $99.99 in cents
      expect(eventData.currency).toBe('usd');
      expect(eventData.interval).toBe('year');
    });

    it('should create unique subscription IDs', () => {
      const data1 = createTestEventData(1, 'monthly');
      const data2 = createTestEventData(1, 'monthly');

      expect(data1.subscription).not.toBe(data2.subscription);
    });

    it('should include proper period end calculation', () => {
      const beforeTime = Math.floor(Date.now() / 1000);
      
      const monthlyData = createTestEventData(1, 'monthly');
      const yearlyData = createTestEventData(1, 'yearly');

      // Monthly should be ~30 days from now
      const monthlyExpected = beforeTime + 2592000; // 30 days in seconds
      expect(monthlyData.current_period_end).toBeGreaterThanOrEqual(monthlyExpected - 10);
      expect(monthlyData.current_period_end).toBeLessThanOrEqual(monthlyExpected + 10);

      // Yearly should be ~365 days from now
      const yearlyExpected = beforeTime + 31536000; // 365 days in seconds
      expect(yearlyData.current_period_end).toBeGreaterThanOrEqual(yearlyExpected - 10);
      expect(yearlyData.current_period_end).toBeLessThanOrEqual(yearlyExpected + 10);
    });
  });

  describe('simulateSuccessfulPayment', () => {
    beforeEach(async () => {
      // Create a test user in storage
      await mockStorage.createUser({
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
        userRole: 'creator',
      });
    });

    it('should simulate successful monthly payment', async () => {
      const paymentData: TestPaymentData = {
        userId: 1,
        plan: 'monthly',
        scenario: 'success',
      };

      const result = await simulateSuccessfulPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('exitoso');
      expect(result.subscriptionData).toBeDefined();
      expect(result.subscriptionData?.plan).toBe('monthly');
      expect(result.subscriptionData?.status).toBe('active');

      // Verify user was updated in storage
      const user = await mockStorage.getUser(1);
      expect(user?.subscriptionStatus).toBe('premium');
      expect(user?.subscriptionPlan).toBe('monthly');
      expect(user?.stripeCustomerId).toMatch(/^test_customer_1$/);
    });

    it('should simulate successful yearly payment', async () => {
      const paymentData: TestPaymentData = {
        userId: 1,
        plan: 'yearly',
        scenario: 'success',
      };

      const result = await simulateSuccessfulPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.subscriptionData?.plan).toBe('yearly');
      
      const user = await mockStorage.getUser(1);
      expect(user?.subscriptionPlan).toBe('yearly');
    });

    it('should handle non-existent user', async () => {
      const paymentData: TestPaymentData = {
        userId: 999,
        plan: 'monthly',
        scenario: 'success',
      };

      const result = await simulateSuccessfulPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Usuario no encontrado');
    });

    it('should simulate failed payment', async () => {
      const paymentData: TestPaymentData = {
        userId: 1,
        plan: 'monthly',
        scenario: 'fail',
      };

      const result = await simulateSuccessfulPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('falló');
      
      // User should not be updated
      const user = await mockStorage.getUser(1);
      expect(user?.subscriptionStatus).toBe('free');
    });

    it('should simulate canceled payment', async () => {
      const paymentData: TestPaymentData = {
        userId: 1,
        plan: 'monthly',
        scenario: 'cancel',
      };

      const result = await simulateSuccessfulPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cancelado');
      
      // User should not be updated
      const user = await mockStorage.getUser(1);
      expect(user?.subscriptionStatus).toBe('free');
    });
  });

  describe('simulateSubscriptionCancellation', () => {
    beforeEach(async () => {
      // Create a test user with active subscription
      const user = await mockStorage.createUser({
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
        userRole: 'creator',
      });

      // Update user to have premium subscription
      await mockStorage.updateUserSubscription(user.id, {
        subscriptionStatus: 'premium',
        subscriptionPlan: 'monthly',
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
      });
    });

    it('should cancel active subscription', async () => {
      const result = await simulateSubscriptionCancellation(1);

      expect(result.success).toBe(true);
      expect(result.message).toContain('cancelada exitosamente');

      const user = await mockStorage.getUser(1);
      expect(user?.subscriptionStatus).toBe('canceled');
      expect(user?.subscriptionCanceledAt).toBeInstanceOf(Date);
    });

    it('should handle non-existent user', async () => {
      const result = await simulateSubscriptionCancellation(999);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Usuario no encontrado');
    });

    it('should handle user without subscription', async () => {
      // Create user without subscription
      const freeUser = await mockStorage.createUser({
        username: 'freeuser',
        password: 'password',
        email: 'free@example.com',
        userRole: 'audience',
      });

      const result = await simulateSubscriptionCancellation(freeUser.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('no tiene una suscripción activa');
    });
  });

  describe('Integration Tests', () => {
    it('should create consistent webhook events for payment flow', async () => {
      const userId = 1;
      const plan = 'monthly';

      // Create test event data
      const eventData = createTestEventData(userId, plan);
      
      // Create webhook event
      const webhookEvent = simulateWebhookEvent('customer.subscription.created', eventData);

      expect(webhookEvent.data.object.customer).toBe(`test_customer_${userId}`);
      expect(webhookEvent.data.object.plan).toBe(plan);
      expect(webhookEvent.type).toBe('customer.subscription.created');
    });

    it('should handle complete payment simulation flow', async () => {
      // Create user
      await mockStorage.createUser({
        username: 'flowuser',
        password: 'password',
        email: 'flow@example.com',
        userRole: 'creator',
      });

      // Simulate payment
      const paymentResult = await simulateSuccessfulPayment({
        userId: 1,
        plan: 'yearly',
        scenario: 'success',
      });

      expect(paymentResult.success).toBe(true);

      // Verify user is premium
      const user = await mockStorage.getUser(1);
      expect(user?.subscriptionStatus).toBe('premium');

      // Simulate cancellation
      const cancelResult = await simulateSubscriptionCancellation(1);
      expect(cancelResult.success).toBe(true);

      // Verify user is canceled
      const canceledUser = await mockStorage.getUser(1);
      expect(canceledUser?.subscriptionStatus).toBe('canceled');
    });
  });
});