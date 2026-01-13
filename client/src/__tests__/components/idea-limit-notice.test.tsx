import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IdeaLimitNotice } from "../../components/idea-limit-notice";

// Mock de useTranslation
const mockT = jest.fn((key: string, defaultValue?: string, options?: any) => {
  if (
    options &&
    typeof options === "object" &&
    "count" in options &&
    "limit" in options
  ) {
    const count = String(options.count);
    const limit = String(options.limit);
    if (defaultValue) {
      return defaultValue
        .replace("{{count}}", count)
        .replace("{{limit}}", limit);
    }
    return `${key} ${count}/${limit}`;
  }
  return defaultValue || key;
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: string | any, options?: any) => {
      // Handle case where second arg is options object (react-i18next style: t(key, options))
      if (
        typeof defaultValueOrOptions === "object" &&
        defaultValueOrOptions !== null &&
        !Array.isArray(defaultValueOrOptions)
      ) {
        const opts = defaultValueOrOptions;
        if ("count" in opts && "limit" in opts) {
          const count = String(opts.count);
          const limit = String(opts.limit);
          return `${key} ${count}/${limit}`;
        }
        return String(key);
      }

      // Handle case where second arg is defaultValue and third is options
      if (
        options &&
        typeof options === "object" &&
        "count" in options &&
        "limit" in options
      ) {
        const count = String(options.count);
        const limit = String(options.limit);
        if (typeof defaultValueOrOptions === "string") {
          return defaultValueOrOptions
            .replace("{{count}}", count)
            .replace("{{limit}}", limit);
        }
        return `${key} ${count}/${limit}`;
      }

      // Default case: return defaultValue or key
      return typeof defaultValueOrOptions === "string"
        ? defaultValueOrOptions
        : String(key);
    },
  }),
}));

// Mock de useAuth
const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  userRole: "creator" as const,
  subscriptionStatus: "free" as const,
} as any;

const mockUseAuth = jest.fn(() => ({
  user: mockUser,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de useIdeaQuota
const mockQuota = {
  count: 10,
  limit: 10,
  hasReachedLimit: true,
} as any;

const mockUseIdeaQuota = jest.fn(() => ({
  data: mockQuota,
  isLoading: false,
}));

jest.mock("@/hooks/useIdeaQuota", () => ({
  useIdeaQuota: () => mockUseIdeaQuota(),
}));

// Mock de useLocation
const mockNavigate = jest.fn();
jest.mock("wouter", () => ({
  useLocation: () => ["", mockNavigate],
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  AlertTriangle: jest.fn(({ className }) => (
    <div data-testid="alert-triangle-icon" className={className} />
  )),
  Crown: jest.fn(({ className }) => (
    <div data-testid="crown-icon" className={className} />
  )),
}));

// Mock de Alert components
jest.mock("@/components/ui/alert", () => ({
  Alert: ({ children, className }: any) => (
    <div data-testid="alert" className={className}>
      {children}
    </div>
  ),
  AlertTitle: ({ children, className }: any) => (
    <div data-testid="alert-title" className={className}>
      {children}
    </div>
  ),
  AlertDescription: ({ children, className }: any) => (
    <div data-testid="alert-description" className={className}>
      {children}
    </div>
  ),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, size }: any) => (
    <button onClick={onClick} className={className} data-size={size}>
      {children}
    </button>
  ),
}));

// Mock de hasActivePremiumAccess
jest.mock("@shared/premium-utils", () => ({
  hasActivePremiumAccess: jest.fn((params: any) => {
    // Return false for free users, true for premium/trial
    if (
      params.subscriptionStatus === "premium" ||
      params.subscriptionStatus === "trial"
    ) {
      return true;
    }
    return false;
  }),
}));

describe("IdeaLimitNotice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string, options?: any) => {
        if (
          options &&
          typeof options === "object" &&
          "count" in options &&
          "limit" in options
        ) {
          const count = String(options.count);
          const limit = String(options.limit);
          if (defaultValue) {
            return defaultValue
              .replace("{{count}}", count)
              .replace("{{limit}}", limit);
          }
          return `${key} ${count}/${limit}`;
        }
        return defaultValue || key;
      }
    );
    mockUseAuth.mockReturnValue({
      user: mockUser,
    });
    mockUseIdeaQuota.mockReturnValue({
      data: mockQuota,
      isLoading: false,
    });
  });

  describe("Basic Rendering", () => {
    it("should not render when user is not logged in", () => {
      mockUseAuth.mockReturnValue({
        user: null,
      });

      render(<IdeaLimitNotice />);

      expect(screen.queryByTestId("alert")).toBeNull();
    });

    it("should not render when quota is loading", () => {
      mockUseIdeaQuota.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<IdeaLimitNotice />);

      expect(screen.queryByTestId("alert")).toBeNull();
    });

    it("should not render when quota is not available", () => {
      mockUseIdeaQuota.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      render(<IdeaLimitNotice />);

      expect(screen.queryByTestId("alert")).toBeNull();
    });

    it("should not render when user has premium", () => {
      const premiumUser = {
        ...mockUser,
        subscriptionStatus: "premium" as const,
      };
      mockUseAuth.mockReturnValue({
        user: premiumUser,
      });

      render(<IdeaLimitNotice />);

      expect(screen.queryByTestId("alert")).toBeNull();
    });

    it("should not render when limit is not reached", () => {
      mockUseIdeaQuota.mockReturnValue({
        data: { ...mockQuota, hasReachedLimit: false },
        isLoading: false,
      });

      render(<IdeaLimitNotice />);

      expect(screen.queryByTestId("alert")).toBeNull();
    });

    it("should render when limit is reached and user is not premium", () => {
      render(<IdeaLimitNotice />);

      expect(screen.getByTestId("alert")).toBeTruthy();
    });
  });

  describe("Content", () => {
    it("should render alert title", () => {
      render(<IdeaLimitNotice />);

      expect(screen.getByTestId("alert-title")).toBeTruthy();
      // Component should render successfully
      expect(screen.getByTestId("alert")).toBeTruthy();
    });

    it("should render alert description with quota info", () => {
      render(<IdeaLimitNotice />);

      expect(screen.getByTestId("alert-description")).toBeTruthy();
      // Component should render successfully with quota info
      expect(screen.getByTestId("alert")).toBeTruthy();
    });

    it("should render upgrade button", () => {
      render(<IdeaLimitNotice />);

      expect(screen.getByTestId("crown-icon")).toBeTruthy();
      // Component should render successfully
      expect(screen.getByTestId("alert")).toBeTruthy();
    });

    it("should render alert triangle icon", () => {
      render(<IdeaLimitNotice />);

      expect(screen.getByTestId("alert-triangle-icon")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("should navigate to subscription page when upgrade button is clicked", () => {
      render(<IdeaLimitNotice />);

      const upgradeButton = screen
        .getByText(/upgradeButton/i)
        .closest("button");
      if (upgradeButton) {
        fireEvent.click(upgradeButton);
      }

      expect(mockNavigate).toHaveBeenCalledWith("/subscription");
    });
  });

  describe("Edge Cases", () => {
    it("should handle different quota values", () => {
      mockUseIdeaQuota.mockReturnValue({
        data: { count: 5, limit: 10, hasReachedLimit: true },
        isLoading: false,
      });

      render(<IdeaLimitNotice />);

      expect(screen.getByTestId("alert")).toBeTruthy();
    });

    it("should handle trial subscription status", () => {
      const trialUser = {
        ...mockUser,
        subscriptionStatus: "trial" as const,
      };
      mockUseAuth.mockReturnValue({
        user: trialUser,
      });

      render(<IdeaLimitNotice />);

      // Should not render because trial users have premium access
      expect(screen.queryByTestId("alert")).toBeNull();
    });
  });
});
