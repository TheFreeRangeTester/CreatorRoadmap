import { describe, it, expect } from '@jest/globals';
import {
    hasActivePremiumAccess,
    getTrialDaysRemaining,
    isTrialExpired,
    isPremiumExpired,
    getPremiumAccessStatus,
} from '../premium-utils';

describe('Premium Utils - Critical Business Logic', () => {
    const now = new Date();

    describe('hasActivePremiumAccess', () => {
        it('should return true for premium users without expiration', () => {
            const user = {
                subscriptionStatus: 'premium' as const,
            };

            expect(hasActivePremiumAccess(user)).toBe(true);
        });

        it('should return true for premium users with future expiration', () => {
            const user = {
                subscriptionStatus: 'premium' as const,
                subscriptionEndDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            };

            expect(hasActivePremiumAccess(user)).toBe(true);
        });

        it('should return false for free users', () => {
            const user = {
                subscriptionStatus: 'free' as const,
            };

            expect(hasActivePremiumAccess(user)).toBe(false);
        });

        it('should return false for expired premium', () => {
            const user = {
                subscriptionStatus: 'premium' as const,
                subscriptionEndDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            };

            expect(hasActivePremiumAccess(user)).toBe(false);
        });

        it('should return true for active trial', () => {
            const user = {
                subscriptionStatus: 'trial' as const,
                trialEndDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
            };

            expect(hasActivePremiumAccess(user)).toBe(true);
        });

        it('should return false for expired trial', () => {
            const user = {
                subscriptionStatus: 'trial' as const,
                trialEndDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            };

            expect(hasActivePremiumAccess(user)).toBe(false);
        });

        it('should return true for canceled subscription still active', () => {
            const user = {
                subscriptionStatus: 'canceled' as const,
                subscriptionEndDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            };

            expect(hasActivePremiumAccess(user)).toBe(true);
        });

        it('should return false for null user', () => {
            expect(hasActivePremiumAccess(null)).toBe(false);
        });
    });

    describe('getTrialDaysRemaining', () => {
        it('should return correct days remaining', () => {
            const user = {
                subscriptionStatus: 'trial' as const,
                trialEndDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            };

            const days = getTrialDaysRemaining(user);
            expect(days).toBeGreaterThanOrEqual(9);
            expect(days).toBeLessThanOrEqual(10);
        });

        it('should return 0 for expired trial', () => {
            const user = {
                subscriptionStatus: 'trial' as const,
                trialEndDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            };

            expect(getTrialDaysRemaining(user)).toBe(0);
        });

        it('should return 0 for non-trial users', () => {
            const user = {
                subscriptionStatus: 'free' as const,
            };

            expect(getTrialDaysRemaining(user)).toBe(0);
        });

        it('should return 0 for null user', () => {
            expect(getTrialDaysRemaining(null)).toBe(0);
        });
    });

    describe('isTrialExpired', () => {
        it('should return true for expired trial', () => {
            const user = {
                subscriptionStatus: 'trial' as const,
                trialEndDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            };

            expect(isTrialExpired(user)).toBe(true);
        });

        it('should return false for active trial', () => {
            const user = {
                subscriptionStatus: 'trial' as const,
                trialEndDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
            };

            expect(isTrialExpired(user)).toBe(false);
        });

        it('should return false for non-trial users', () => {
            const user = {
                subscriptionStatus: 'free' as const,
            };

            expect(isTrialExpired(user)).toBe(false);
        });
    });

    describe('isPremiumExpired', () => {
        it('should return true for expired premium', () => {
            const user = {
                subscriptionStatus: 'premium' as const,
                subscriptionEndDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            };

            expect(isPremiumExpired(user)).toBe(true);
        });

        it('should return false for active premium', () => {
            const user = {
                subscriptionStatus: 'premium' as const,
                subscriptionEndDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            };

            expect(isPremiumExpired(user)).toBe(false);
        });

        it('should return false for premium without expiration date', () => {
            const user = {
                subscriptionStatus: 'premium' as const,
            };

            expect(isPremiumExpired(user)).toBe(false);
        });
    });

    describe('getPremiumAccessStatus', () => {
        it('should return correct status for premium users', () => {
            const user = {
                subscriptionStatus: 'premium' as const,
            };

            const status = getPremiumAccessStatus(user);
            expect(status.hasAccess).toBe(true);
            expect(status.reason).toBe('premium');
        });

        it('should return correct status for active trial', () => {
            const user = {
                subscriptionStatus: 'trial' as const,
                trialEndDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            };

            const status = getPremiumAccessStatus(user);
            expect(status.hasAccess).toBe(true);
            expect(status.reason).toBe('trial');
            expect(status.daysRemaining).toBeGreaterThan(0);
        });

        it('should return correct status for expired trial', () => {
            const user = {
                subscriptionStatus: 'trial' as const,
                trialEndDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            };

            const status = getPremiumAccessStatus(user);
            expect(status.hasAccess).toBe(false);
            expect(status.reason).toBe('trial_expired');
        });

        it('should return correct status for canceled but still active subscription', () => {
            const user = {
                subscriptionStatus: 'canceled' as const,
                subscriptionEndDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            };

            const status = getPremiumAccessStatus(user);
            expect(status.hasAccess).toBe(true);
            expect(status.reason).toBe('premium_canceled');
        });

        it('should return correct status for free users', () => {
            const user = {
                subscriptionStatus: 'free' as const,
            };

            const status = getPremiumAccessStatus(user);
            expect(status.hasAccess).toBe(false);
            expect(status.reason).toBe('no_subscription');
        });

        it('should return no_subscription for null user', () => {
            const status = getPremiumAccessStatus(null);
            expect(status.hasAccess).toBe(false);
            expect(status.reason).toBe('no_subscription');
        });
    });
});

