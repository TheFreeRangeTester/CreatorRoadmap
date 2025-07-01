import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/use-auth';
import type { UserResponse } from '../../../shared/schema';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Create a wrapper component for tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  const mockUser: UserResponse = {
    id: 1,
    username: 'testuser',
    userRole: 'creator',
    email: 'test@example.com',
    profileDescription: 'Test user description',
    logoUrl: 'https://example.com/logo.png',
    subscriptionStatus: 'premium',
    hasUsedTrial: false,
    profileBackground: 'gradient-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('User Authentication State', () => {
    it('should return authenticated user when API returns user data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return unauthenticated state when API returns 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Not authenticated' }),
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should show loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Login Functionality', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock login API call
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        } as Response)
        // Mock user data refetch after login
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.login).toBeDefined();
      });

      const loginResult = await result.current.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(loginResult.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
        }),
      }));
    });

    it('should handle login failure with invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.login).toBeDefined();
      });

      const loginResult = await result.current.login({
        username: 'wrong',
        password: 'wrong',
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid credentials');
    });

    it('should show loading state during login', async () => {
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      mockFetch.mockImplementation(() => loginPromise);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.login).toBeDefined();
      });

      // Start login (don't await yet)
      const loginPromiseResult = result.current.login({
        username: 'testuser',
        password: 'password123',
      });

      // Check loading state
      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(true);
      });

      // Resolve login
      resolveLogin!({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      await loginPromiseResult;

      expect(result.current.isLoggingIn).toBe(false);
    });
  });

  describe('Registration Functionality', () => {
    it('should register successfully with valid data', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.register).toBeDefined();
      });

      const registerResult = await result.current.register({
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        userRole: 'creator',
      });

      expect(registerResult.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'newuser',
          password: 'password123',
          email: 'new@example.com',
          userRole: 'creator',
        }),
      }));
    });

    it('should handle registration failure with validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Username already exists' }),
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.register).toBeDefined();
      });

      const registerResult = await result.current.register({
        username: 'existing',
        password: 'password123',
        email: 'existing@example.com',
        userRole: 'audience',
      });

      expect(registerResult.success).toBe(false);
      expect(registerResult.error).toBe('Username already exists');
    });

    it('should show loading state during registration', async () => {
      let resolveRegister: (value: any) => void;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });

      mockFetch.mockImplementation(() => registerPromise);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.register).toBeDefined();
      });

      // Start registration
      const registerPromiseResult = result.current.register({
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        userRole: 'creator',
      });

      // Check loading state
      await waitFor(() => {
        expect(result.current.isRegistering).toBe(true);
      });

      // Resolve registration
      resolveRegister!({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      await registerPromiseResult;

      expect(result.current.isRegistering).toBe(false);
    });
  });

  describe('Logout Functionality', () => {
    it('should logout successfully and clear user state', async () => {
      // First establish authenticated state
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        } as Response)
        // Then mock logout
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Logged out successfully' }),
        } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const logoutResult = await result.current.logout();

      expect(logoutResult.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({
        method: 'POST',
      }));

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
      });
    });

    it('should handle logout errors gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' }),
        } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const logoutResult = await result.current.logout();

      expect(logoutResult.success).toBe(false);
      expect(logoutResult.error).toBe('Server error');
    });
  });

  describe('User Role Checks', () => {
    it('should correctly identify creators', async () => {
      const creatorUser = { ...mockUser, userRole: 'creator' as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => creatorUser,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isCreator).toBe(true);
      });

      expect(result.current.isAudience).toBe(false);
    });

    it('should correctly identify audience members', async () => {
      const audienceUser = { ...mockUser, userRole: 'audience' as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => audienceUser,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAudience).toBe(true);
      });

      expect(result.current.isCreator).toBe(false);
    });
  });

  describe('Premium Status Checks', () => {
    it('should correctly identify premium users', async () => {
      const premiumUser = { ...mockUser, subscriptionStatus: 'premium' as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => premiumUser,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isPremium).toBe(true);
      });
    });

    it('should correctly identify trial users as premium', async () => {
      const trialUser = {
        ...mockUser,
        subscriptionStatus: 'trial' as const,
        trialEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => trialUser,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isPremium).toBe(true);
        expect(result.current.isTrialActive).toBe(true);
      });
    });

    it('should identify expired trial users as non-premium', async () => {
      const expiredTrialUser = {
        ...mockUser,
        subscriptionStatus: 'trial' as const,
        trialEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expiredTrialUser,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isPremium).toBe(false);
        expect(result.current.isTrialActive).toBe(false);
      });
    });

    it('should correctly identify free users', async () => {
      const freeUser = { ...mockUser, subscriptionStatus: 'free' as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => freeUser,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isPremium).toBe(false);
        expect(result.current.isTrialActive).toBe(false);
      });
    });
  });

  describe('Profile Updates', () => {
    it('should update user profile successfully', async () => {
      const updatedUser = {
        ...mockUser,
        profileDescription: 'Updated description',
        logoUrl: 'https://example.com/new-logo.png',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: updatedUser }),
        } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.updateProfile).toBeDefined();
      });

      const updateResult = await result.current.updateProfile({
        profileDescription: 'Updated description',
        logoUrl: 'https://example.com/new-logo.png',
      });

      expect(updateResult.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileDescription: 'Updated description',
          logoUrl: 'https://example.com/new-logo.png',
        }),
      }));
    });

    it('should handle profile update failures', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Invalid profile data' }),
        } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.updateProfile).toBeDefined();
      });

      const updateResult = await result.current.updateProfile({
        profileDescription: 'A'.repeat(1000), // Too long
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe('Invalid profile data');
    });
  });
});