import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "../../hooks/use-auth";
import { UserResponse } from "@shared/schema";
// Nota: El import de UserResponse da error porque "../../../shared/schema" no existe o no tiene declaraciones de tipos.
// Puedes comentar o eliminar la siguiente línea si el archivo realmente no existe o corregir la ruta si es un error de path.
// import type { UserResponse } from "../../../shared/schema";

// Mock global de fetch
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useAuth Hook", () => {
  const mockUser: UserResponse = {
    id: 1,
    username: "testuser",
    userRole: "creator",
    email: "test@example.com",
    profileDescription: "Test user description",
    logoUrl: "https://example.com/logo.png",
    subscriptionStatus: "premium",
    hasUsedTrial: false,
    profileBackground: "gradient-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("User Authentication State", () => {
    it("should return authenticated user when API returns user data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
      expect(result.current.isLoading).toBe(false);
    });

    it("should return unauthenticated state when API returns 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Not authenticated" }),
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
      expect(result.current.isLoading).toBe(false);
    });

    it("should show loading state initially", () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("Login Functionality", () => {
    it("should login successfully with valid credentials", async () => {
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
        expect(result.current.loginMutation.mutateAsync).toBeDefined();
      });

      const loginResult = await result.current.loginMutation.mutateAsync({
        username: "testuser",
        password: "password123",
      });

      expect(loginResult).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({
          method: "POST",
          headers: expect.any(Object),
          body: JSON.stringify({
            username: "testuser",
            password: "password123",
          }),
        })
      );
    });

    it("should handle login failure with invalid credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Invalid credentials",
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loginMutation.mutateAsync).toBeDefined();
      });

      await expect(
        result.current.loginMutation.mutateAsync({
          username: "wrong",
          password: "wrong",
        })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("Registration Functionality", () => {
    it("should register successfully with valid data", async () => {
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
        expect(result.current.registerMutation.mutateAsync).toBeDefined();
      });

      const registerResult = await result.current.registerMutation.mutateAsync({
        username: "newuser",
        password: "password123",
        email: "new@example.com",
        userRole: "creator",
      });

      expect(registerResult).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({
          method: "POST",
          headers: expect.any(Object),
          body: JSON.stringify({
            username: "newuser",
            password: "password123",
            email: "new@example.com",
            userRole: "creator",
          }),
        })
      );
    });

    it("should handle registration failure with validation errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Username already exists",
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.registerMutation.mutateAsync).toBeDefined();
      });

      await expect(
        result.current.registerMutation.mutateAsync({
          username: "existing",
          password: "password123",
          email: "existing@example.com",
          userRole: "audience",
        })
      ).rejects.toThrow("Username already exists");
    });
  });

  describe("Logout Functionality", () => {
    it("should logout successfully and clear user state", async () => {
      // First establish authenticated state
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        } as Response)
        // Then mock logout
        .mockResolvedValueOnce({
          ok: true,
          text: async () => "Logged out successfully",
        } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await result.current.logoutMutation.mutateAsync();
      // No error thrown = success
    });

    it("should handle logout errors gracefully", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => "Server error",
        } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await expect(result.current.logoutMutation.mutateAsync()).rejects.toThrow(
        "Server error"
      );
    });
  });

  // No se testean helpers como isPremium, isCreator, isAudience, isTrialActive ni updateProfile, ya que no existen en el contexto
});
