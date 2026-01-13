import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string | any, options?: any) => {
    // If defaultValue is an object (like for date formatting), return the key
    if (
      defaultValue &&
      typeof defaultValue === "object" &&
      !Array.isArray(defaultValue)
    ) {
      return key;
    }
    if (options && typeof defaultValue === "string") {
      return defaultValue.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(options[name] || "")
      );
    }
    return typeof defaultValue === "string" ? defaultValue : key;
  }
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de useToast
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de useQuery
const mockUser: any = {
  id: 1,
  subscriptionStatus: "free",
  hasUsedTrial: false,
};

let mockIsLoading = false;

const mockUseQuery = jest.fn((config?: any) => ({
  data: mockUser,
  isLoading: mockIsLoading,
}));

// Mock de useMutation
const mockStartTrialMutate = jest.fn();
const mockCancelSubscriptionMutate = jest.fn();

const mockStartTrialMutation = {
  mutate: mockStartTrialMutate,
  isPending: false,
};

const mockCancelSubscriptionMutation = {
  mutate: mockCancelSubscriptionMutate,
  isPending: false,
};

const mockUseMutation = jest.fn((config?: any) => {
  if (config?.mutationFn) {
    const url = config.mutationFn.toString();
    if (url.includes("start-trial")) {
      return mockStartTrialMutation;
    } else if (url.includes("cancel-subscription")) {
      return mockCancelSubscriptionMutation;
    }
  }
  return mockStartTrialMutation;
});

// Mock de useQueryClient
const mockInvalidateQueries = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

const mockUseQueryClient = jest.fn(() => mockQueryClient);

jest.mock("@tanstack/react-query", () => ({
  useQuery: (config?: any) => mockUseQuery(config),
  useMutation: (config?: any) => mockUseMutation(config),
  useQueryClient: () => mockUseQueryClient(),
}));

// Mock de premium-utils
const mockHasActivePremiumAccess = jest.fn((user: any) => false);
const mockGetPremiumAccessStatus = jest.fn((user: any) => ({
  hasAccess: false,
  reason: "no_subscription" as const,
})) as jest.MockedFunction<
  (user: any) => {
    hasAccess: boolean;
    reason:
      | "premium"
      | "trial"
      | "trial_expired"
      | "premium_expired"
      | "premium_canceled"
      | "no_subscription";
    daysRemaining?: number;
  }
>;

jest.mock("@shared/premium-utils", () => ({
  hasActivePremiumAccess: (user: any) => mockHasActivePremiumAccess(user),
  getPremiumAccessStatus: (user: any) => mockGetPremiumAccessStatus(user),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Crown: jest.fn(({ className }) => (
    <div data-testid="crown-icon" className={className} />
  )),
  Sparkles: jest.fn(({ className }) => (
    <div data-testid="sparkles-icon" className={className} />
  )),
  CheckCircle: jest.fn(({ className }) => (
    <div data-testid="check-circle-icon" className={className} />
  )),
  AlertCircle: jest.fn(({ className }) => (
    <div data-testid="alert-circle-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock de Popover components
let popoverOpen = false;
let popoverOnOpenChange: ((open: boolean) => void) | null = null;

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children, open, onOpenChange }: any) => {
    popoverOpen = open !== undefined ? open : false;
    if (onOpenChange) {
      popoverOnOpenChange = onOpenChange;
    }
    return (
      <div data-testid="popover" data-open={open}>
        {children}
      </div>
    );
  },
  PopoverTrigger: ({ children, asChild, onClick }: any) => {
    if (asChild && children) {
      // Clone the child and add onClick handler
      if (React.isValidElement(children)) {
        return React.cloneElement(children as any, {
          onClick: (e: any) => {
            if (onClick) onClick(e);
            const childProps = (children as any).props || {};
            if (childProps.onClick) childProps.onClick(e);
            // Also trigger popover open
            if (popoverOnOpenChange) {
              popoverOnOpenChange(true);
            }
          },
        });
      }
      return children;
    }
    return (
      <div data-testid="popover-trigger" onClick={onClick}>
        {children}
      </div>
    );
  },
  PopoverContent: ({ children, className, align }: any) => (
    <div data-testid="popover-content" className={className} data-align={align}>
      {children}
    </div>
  ),
}));

// Mock de Badge component
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <div data-testid="badge" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

// Mock de Link from wouter
jest.mock("wouter", () => ({
  Link: ({ children, to, className }: any) => (
    <a href={to} className={className} data-testid="link">
      {children}
    </a>
  ),
}));

// Mock de fetch global
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ success: true }),
  } as any)
);

global.fetch = mockFetch as any;

import SubscriptionStatusIcon from "../../components/subscription-status-icon";

describe("SubscriptionStatusIcon", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string | any, options?: any) => {
        // If defaultValue is an object (like for date formatting), return the key
        if (
          defaultValue &&
          typeof defaultValue === "object" &&
          !Array.isArray(defaultValue)
        ) {
          return key;
        }
        if (options && typeof defaultValue === "string") {
          return defaultValue.replace(/\{\{(\w+)\}\}/g, (_, name) =>
            String(options[name] || "")
          );
        }
        return typeof defaultValue === "string" ? defaultValue : key;
      }
    );
    mockUser.subscriptionStatus = "free";
    mockUser.hasUsedTrial = false;
    mockUser.trialEndDate = null;
    mockUser.subscriptionEndDate = null;
    mockIsLoading = false;
    mockUseQuery.mockImplementation((config?: any) => ({
      data: mockUser,
      isLoading: mockIsLoading,
    }));
    mockHasActivePremiumAccess.mockReturnValue(false);
    mockGetPremiumAccessStatus.mockReturnValue({
      hasAccess: false,
      reason: "no_subscription",
    });
    mockStartTrialMutate.mockClear();
    mockCancelSubscriptionMutate.mockClear();
    mockInvalidateQueries.mockClear();
    mockToast.mockClear();
    popoverOpen = false;
    popoverOnOpenChange = null;
    mockStartTrialMutation.isPending = false;
    mockCancelSubscriptionMutation.isPending = false;
  });

  describe("Visibility", () => {
    it("should not render when user is loading", () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: true,
      });

      const { container } = render(<SubscriptionStatusIcon />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render when user is null", () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
      });

      const { container } = render(<SubscriptionStatusIcon />);

      expect(container.firstChild).toBeNull();
    });

    it("should render when user is available", () => {
      const { container } = render(<SubscriptionStatusIcon />);

      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Basic Rendering", () => {
    it("should render subscription status icon", () => {
      const { container } = render(<SubscriptionStatusIcon />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render popover", () => {
      render(<SubscriptionStatusIcon />);

      expect(screen.getByTestId("popover")).toBeTruthy();
    });

    it("should render trigger button", () => {
      render(<SubscriptionStatusIcon />);

      // The trigger button should be rendered (wrapped by PopoverTrigger)
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      expect(button).toBeTruthy();
    });
  });

  describe("Icon Configuration - Premium Active", () => {
    beforeEach(() => {
      mockUser.subscriptionStatus = "premium";
      mockUser.subscriptionEndDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      mockHasActivePremiumAccess.mockReturnValue(true);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: true,
        reason: "premium" as const,
      });
    });

    it("should render crown icon for premium", () => {
      render(<SubscriptionStatusIcon />);

      const icons = screen.getAllByTestId("crown-icon");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should not render badge for premium", () => {
      render(<SubscriptionStatusIcon />);

      const badges = screen.queryAllByTestId("badge");
      // Only CheckCircle icons in features, not a badge on the icon
      const iconBadges = badges.filter((badge) =>
        badge.className?.includes("absolute")
      );
      expect(iconBadges.length).toBe(0);
    });
  });

  describe("Icon Configuration - Trial Active", () => {
    beforeEach(() => {
      mockUser.subscriptionStatus = "trial";
      mockUser.trialEndDate = new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      ).toISOString();
      mockHasActivePremiumAccess.mockReturnValue(true);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: true,
        reason: "trial" as const,
        daysRemaining: 5,
      });
    });

    it("should render sparkles icon for trial", () => {
      render(<SubscriptionStatusIcon />);

      const icons = screen.getAllByTestId("sparkles-icon");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should render badge with days remaining for trial", () => {
      render(<SubscriptionStatusIcon />);

      const badges = screen.getAllByTestId("badge");
      const iconBadge = badges.find((badge) =>
        badge.className?.includes("absolute")
      );
      expect(iconBadge).toBeTruthy();
      expect(iconBadge?.textContent).toBe("5");
    });
  });

  describe("Icon Configuration - Premium Canceled", () => {
    beforeEach(() => {
      mockUser.subscriptionStatus = "canceled";
      mockUser.subscriptionEndDate = new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000
      ).toISOString();
      mockHasActivePremiumAccess.mockReturnValue(true);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: true,
        reason: "premium_canceled" as const,
      });
    });

    it("should render crown icon for canceled premium", () => {
      render(<SubscriptionStatusIcon />);

      const icons = screen.getAllByTestId("crown-icon");
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("Icon Configuration - Expired", () => {
    beforeEach(() => {
      mockUser.subscriptionStatus = "trial";
      mockUser.trialEndDate = new Date(
        Date.now() - 5 * 24 * 60 * 60 * 1000
      ).toISOString();
      mockHasActivePremiumAccess.mockReturnValue(false);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: false,
        reason: "trial_expired" as const,
      });
    });

    it("should render alert circle icon for expired", () => {
      render(<SubscriptionStatusIcon />);

      const icons = screen.getAllByTestId("alert-circle-icon");
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("Popover Content - Premium Active", () => {
    beforeEach(() => {
      mockUser.subscriptionStatus = "premium";
      mockUser.subscriptionEndDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      mockHasActivePremiumAccess.mockReturnValue(true);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: true,
        reason: "premium" as const,
      });
    });

    it("should show premium title when opened", () => {
      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockT).toHaveBeenCalledWith("subscription.badges.premium");
    });

    it("should show cancel button for premium", () => {
      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockT).toHaveBeenCalledWith("subscription.cancel");
    });

    it("should call cancel mutation when cancel button is clicked", () => {
      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      // Find and click cancel button
      const cancelButton = screen
        .getByText(/subscription.cancel/i)
        .closest("button");
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      expect(mockCancelSubscriptionMutate).toHaveBeenCalled();
    });
  });

  describe("Popover Content - Trial Available", () => {
    beforeEach(() => {
      mockUser.subscriptionStatus = "free";
      mockUser.hasUsedTrial = false;
      mockHasActivePremiumAccess.mockReturnValue(false);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: false,
        reason: "no_subscription",
      });
    });

    it("should show trial available title when opened", () => {
      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockT).toHaveBeenCalledWith("subscription.trial.available");
    });

    it("should show activate trial button", () => {
      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockT).toHaveBeenCalledWith("subscription.trial.activateButton");
    });

    it("should call start trial mutation when activate button is clicked", () => {
      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      // Find and click activate button
      const activateButton = screen
        .getByText(/subscription.trial.activateButton/i)
        .closest("button");
      if (activateButton) {
        fireEvent.click(activateButton);
      }

      expect(mockStartTrialMutate).toHaveBeenCalled();
    });
  });

  describe("Popover Content - Trial Active", () => {
    beforeEach(() => {
      mockUser.subscriptionStatus = "trial";
      mockUser.trialEndDate = new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      ).toISOString();
      mockHasActivePremiumAccess.mockReturnValue(true);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: true,
        reason: "trial" as const,
        daysRemaining: 5,
      });
    });

    it("should show trial active title when opened", () => {
      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("sparkles-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockT).toHaveBeenCalledWith("subscription.trial.active");
    });

    it("should show upgrade button for trial", () => {
      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("sparkles-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockT).toHaveBeenCalledWith("subscription.trial.upgradeButton");
    });
  });

  describe("Features List", () => {
    it("should show features list for non-premium users", () => {
      mockUser.subscriptionStatus = "free";
      mockHasActivePremiumAccess.mockReturnValue(false);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: false,
        reason: "no_subscription",
      });

      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockT).toHaveBeenCalledWith("subscription.features.upToIdeas");
      expect(mockT).toHaveBeenCalledWith("subscription.features.csvImport");
      expect(mockT).toHaveBeenCalledWith("subscription.features.noBranding");
    });

    it("should not show features list for premium users", () => {
      mockUser.subscriptionStatus = "premium";
      mockUser.subscriptionEndDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      mockHasActivePremiumAccess.mockReturnValue(true);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: true,
        reason: "premium" as const,
      });

      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      // Features should not be called for premium users
      const featuresCalls = mockT.mock.calls.filter((call) =>
        call[0]?.includes("subscription.features")
      );
      expect(featuresCalls.length).toBe(0);
    });
  });

  describe("Mutations", () => {
    it("should invalidate queries after successful trial start", () => {
      // Mock the mutation's onSuccess to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        if (config?.mutationFn?.toString().includes("start-trial")) {
          const mutation = {
            mutate: jest.fn((...args) => {
              if (config.onSuccess) {
                config.onSuccess();
              }
            }),
            isPending: false,
          };
          return mutation;
        }
        return mockStartTrialMutation;
      });

      mockUser.subscriptionStatus = "free";
      mockUser.hasUsedTrial = false;

      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      // Click activate button
      const activateButton = screen
        .getByText(/subscription.trial.activateButton/i)
        .closest("button");
      if (activateButton) {
        fireEvent.click(activateButton);
      }

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["/api/user"],
      });
    });

    it("should show toast after successful trial start", () => {
      // Mock the mutation's onSuccess to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        if (config?.mutationFn?.toString().includes("start-trial")) {
          const mutation = {
            mutate: jest.fn((...args) => {
              if (config.onSuccess) {
                config.onSuccess();
              }
            }),
            isPending: false,
          };
          return mutation;
        }
        return mockStartTrialMutation;
      });

      mockUser.subscriptionStatus = "free";
      mockUser.hasUsedTrial = false;

      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      // Click activate button
      const activateButton = screen
        .getByText(/subscription.trial.activateButton/i)
        .closest("button");
      if (activateButton) {
        fireEvent.click(activateButton);
      }

      expect(mockToast).toHaveBeenCalled();
    });
  });

  describe("Button States", () => {
    it("should disable cancel button when mutation is pending", () => {
      // Mock useMutation to return isPending: true for cancel mutation
      (mockUseMutation as any).mockImplementation((config?: any) => {
        if (config?.mutationFn) {
          const url = config.mutationFn.toString();
          if (url.includes("cancel-subscription")) {
            return {
              mutate: mockCancelSubscriptionMutate,
              isPending: true,
            };
          }
        }
        return mockCancelSubscriptionMutation;
      });

      mockUser.subscriptionStatus = "premium";
      mockUser.subscriptionEndDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      mockHasActivePremiumAccess.mockReturnValue(true);
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: true,
        reason: "premium" as const,
      });

      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      // When pending, button should be disabled
      const cancelButtons = screen.queryAllByText(/subscription.cancel/i);
      const cancelButton = cancelButtons.find((btn) => {
        const button = btn.closest("button");
        return button && (button as HTMLButtonElement).disabled;
      });
      expect(cancelButton).toBeTruthy();
    });

    it("should disable activate button when mutation is pending", () => {
      // Mock useMutation to return isPending: true for start trial mutation
      (mockUseMutation as any).mockImplementation((config?: any) => {
        if (config?.mutationFn) {
          const url = config.mutationFn.toString();
          if (url.includes("start-trial")) {
            return {
              mutate: mockStartTrialMutate,
              isPending: true,
            };
          }
        }
        return mockStartTrialMutation;
      });

      mockUser.subscriptionStatus = "free";
      mockUser.hasUsedTrial = false;
      (mockGetPremiumAccessStatus as any).mockReturnValue({
        hasAccess: false,
        reason: "no_subscription" as const,
      });

      render(<SubscriptionStatusIcon />);

      // Open popover
      const icons = screen.getAllByTestId("crown-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      // When pending, button should be disabled
      const activateButtons = screen.queryAllByText(
        /subscription.trial.activateButton|activating/i
      );
      const activateButton = activateButtons.find((btn) => {
        const button = btn.closest("button");
        return button && (button as HTMLButtonElement).disabled;
      });
      expect(activateButton).toBeTruthy();
    });
  });
});
