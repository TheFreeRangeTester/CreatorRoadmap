import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string | object, options?: any) => {
    if (typeof defaultValue === "object") {
      return key;
    }
    if (options && typeof options === "object") {
      // Handle interpolation
      let result = defaultValue || key;
      Object.keys(options).forEach((optKey) => {
        result = result.replace(`{{${optKey}}}`, options[optKey]);
      });
      return result;
    }
    return defaultValue || key;
  }
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Youtube: jest.fn(({ className }) => (
    <div data-testid="youtube-icon" className={className} />
  )),
  TrendingUp: jest.fn(({ className }) => (
    <div data-testid="trending-up-icon" className={className} />
  )),
  Users: jest.fn(({ className }) => (
    <div data-testid="users-icon" className={className} />
  )),
  Target: jest.fn(({ className }) => (
    <div data-testid="target-icon" className={className} />
  )),
  RefreshCw: jest.fn(({ className }) => (
    <div data-testid="refresh-icon" className={className} />
  )),
  Lock: jest.fn(({ className }) => (
    <div data-testid="lock-icon" className={className} />
  )),
  AlertCircle: jest.fn(({ className }) => (
    <div data-testid="alert-circle-icon" className={className} />
  )),
  Info: jest.fn(({ className }) => (
    <div data-testid="info-icon" className={className} />
  )),
  Zap: jest.fn(({ className }) => (
    <div data-testid="zap-icon" className={className} />
  )),
  BarChart3: jest.fn(({ className }) => (
    <div data-testid="bar-chart-icon" className={className} />
  )),
}));

// Mock de UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    className,
    asChild,
    ...props
  }: any) => {
    if (asChild) {
      return <>{children}</>;
    }
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        data-size={size}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  },
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <div
      data-testid="badge"
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children, asChild }: any) => {
    if (asChild) {
      return <>{children}</>;
    }
    return <div>{children}</div>;
  },
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/responsive-tooltip", () => ({
  ResponsiveTooltip: ({ children, content }: any) => (
    <div>
      {children}
      <div data-testid="tooltip-content">{content}</div>
    </div>
  ),
}));

// Mock de cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock de React Query
let mockScoreData: any = null;
let mockIsLoading = false;
let mockError: any = null;
let mockRateLimitData: any = null;
const mockMutate = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((config?: any) => {
    const queryKey = config?.queryKey?.[0];
    if (queryKey?.includes("rate-limit")) {
      return {
        data: mockRateLimitData,
        isLoading: false,
      };
    }
    return {
      data: mockScoreData,
      isLoading: mockIsLoading,
      error: mockError,
    };
  }),
  useMutation: jest.fn((config?: any) => ({
    mutate: mockMutate,
    isPending: false,
    ...config,
  })),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// Mock de apiRequest
const mockApiRequest = jest.fn();
jest.mock("@/lib/queryClient", () => ({
  apiRequest: mockApiRequest,
}));

// Mock de window.location
delete (window as any).location;
(window as any).location = {
  href: "",
};

import YouTubeOpportunityPanel from "../../components/youtube-opportunity-panel";

describe("YouTubeOpportunityPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string | object, options?: any) => {
        if (typeof defaultValue === "object") {
          return key;
        }
        if (options && typeof options === "object") {
          let result = defaultValue || key;
          Object.keys(options).forEach((optKey) => {
            result = String(result).replace(`{{${optKey}}}`, options[optKey]);
          });
          return result;
        }
        return defaultValue || key;
      }
    );
    mockScoreData = null;
    mockIsLoading = false;
    mockError = null;
    mockRateLimitData = null;
    mockMutate.mockClear();
    mockInvalidateQueries.mockClear();
    mockApiRequest.mockClear();
    (window as any).location.href = "";
  });

  describe("Premium Required", () => {
    it("should show premium required message when isPremium is false", () => {
      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={false}
          audienceVotes={10}
        />
      );

      expect(screen.getByTestId("lock-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith(
        "youtubeOpportunity.premiumRequired.title"
      );
      expect(mockT).toHaveBeenCalledWith(
        "youtubeOpportunity.premiumRequired.description"
      );
    });

    it("should show upgrade button when isPremium is false", () => {
      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={false}
          audienceVotes={10}
        />
      );

      const upgradeButton = screen.getByTestId("button-upgrade-youtube");
      expect(upgradeButton).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith(
        "youtubeOpportunity.premiumRequired.cta"
      );
    });

    it("should redirect to pricing when upgrade button is clicked", () => {
      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={false}
          audienceVotes={10}
        />
      );

      const upgradeButton = screen.getByTestId("button-upgrade-youtube");
      fireEvent.click(upgradeButton);

      // The component sets window.location.href, verify it was set
      expect((window as any).location.href).toBeTruthy();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when isLoading is true", () => {
      mockIsLoading = true;

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      const skeletons = screen.getAllByTestId("skeleton");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Error State", () => {
    it("should show error message when error occurs", () => {
      mockError = new Error("Fetch failed");

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      expect(screen.getByTestId("alert-circle-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith(
        "youtubeOpportunity.errors.fetchFailed"
      );
    });

    it("should show retry button when error occurs", () => {
      mockError = new Error("Fetch failed");

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      const retryButton = screen.getByTestId("button-retry-youtube");
      expect(retryButton).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("common.refresh");
    });

    it("should call fetch mutation when retry button is clicked", () => {
      mockError = new Error("Fetch failed");

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      const retryButton = screen.getByTestId("button-retry-youtube");
      fireEvent.click(retryButton);

      expect(mockMutate).toHaveBeenCalledWith(false);
    });
  });

  describe("No Data State", () => {
    it("should show analyze button when no score data", () => {
      mockScoreData = { score: null, snapshot: null };

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      expect(screen.getByTestId("bar-chart-icon")).toBeTruthy();
      const analyzeButton = screen.getByTestId("button-analyze-youtube");
      expect(analyzeButton).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("youtubeOpportunity.analyze");
    });

    it("should call fetch mutation when analyze button is clicked", () => {
      mockScoreData = { score: null, snapshot: null };

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      const analyzeButton = screen.getByTestId("button-analyze-youtube");
      fireEvent.click(analyzeButton);

      expect(mockMutate).toHaveBeenCalledWith(false);
    });

    it("should show rate limit status when available", () => {
      mockScoreData = { score: null, snapshot: null };
      mockRateLimitData = { remaining: 5, limit: 10 };

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      const rateLimitStatus = screen.getByTestId("text-rate-limit-status");
      expect(rateLimitStatus).toBeTruthy();
    });
  });

  describe("Rate Limit State", () => {
    it("should show rate limit message when rate limited", () => {
      mockScoreData = { score: null, snapshot: null };
      mockRateLimitData = { remaining: 0, limit: 10 };

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      expect(screen.getByTestId("alert-circle-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith(
        "youtubeOpportunity.rateLimit.limitReached"
      );
    });
  });

  describe("Score Display", () => {
    const mockScore = {
      id: 1,
      ideaId: 1,
      demandScore: 75,
      demandLabel: "high" as const,
      competitionScore: 50,
      competitionLabel: "medium" as const,
      opportunityScore: 80,
      opportunityLabel: "strong" as const,
      compositeLabel: "balanced" as const,
      explanation: {
        demandReason: "demand.high|1000|50000",
        competitionReason: "competition.medium|50",
        opportunityReason: "opportunity.strong",
      },
      updatedAt: new Date().toISOString(),
    };

    const mockSnapshot = {
      id: 1,
      ideaId: 1,
      queryTerm: "test query",
      videoCount: 1000,
      avgViews: 50000,
      medianViews: 30000,
      maxViews: 100000,
      avgViewsPerDay: 1000,
      uniqueChannels: 50,
      status: "success" as const,
      errorMessage: null,
      fetchedAt: new Date().toISOString(),
    };

    it("should render score data when available", () => {
      mockScoreData = {
        score: mockScore,
        snapshot: mockSnapshot,
        isFresh: true,
      };

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      expect(screen.getByTestId("score-demand")).toBeTruthy();
      expect(screen.getByTestId("score-competition")).toBeTruthy();
      expect(screen.getByTestId("score-opportunity")).toBeTruthy();
    });

    it("should render composite label badge when available", () => {
      mockScoreData = {
        score: mockScore,
        snapshot: mockSnapshot,
        isFresh: true,
      };

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      expect(screen.getByTestId("badge-composite-label")).toBeTruthy();
    });

    it("should render refresh button", () => {
      mockScoreData = {
        score: mockScore,
        snapshot: mockSnapshot,
        isFresh: true,
      };

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      const refreshButton = screen.getByTestId("button-refresh-youtube");
      expect(refreshButton).toBeTruthy();
    });

    it("should call fetch mutation with forceRefresh when refresh button is clicked", () => {
      mockScoreData = {
        score: mockScore,
        snapshot: mockSnapshot,
        isFresh: true,
      };

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      const refreshButton = screen.getByTestId("button-refresh-youtube");
      fireEvent.click(refreshButton);

      expect(mockMutate).toHaveBeenCalledWith(true);
    });

    it("should display snapshot statistics", () => {
      mockScoreData = {
        score: mockScore,
        snapshot: mockSnapshot,
        isFresh: true,
      };

      render(
        <YouTubeOpportunityPanel
          ideaId={1}
          isPremium={true}
          audienceVotes={10}
        />
      );

      // Check for video count
      expect(screen.getByText("1000")).toBeTruthy();
      // formatNumber converts 50000 to "50.0K", check for formatted number
      const formattedElements = screen.queryAllByText(/50/);
      expect(formattedElements.length).toBeGreaterThan(0);
      // Check for unique channels count
      const channelElements = screen.queryAllByText("50");
      expect(channelElements.length).toBeGreaterThan(0);
    });
  });
});
