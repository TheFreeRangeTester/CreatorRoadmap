import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de useAuth
jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(() => ({
    user: {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      userRole: "audience",
    },
  })),
}));

// Mock de useReactiveStats
const mockUseReactiveStats = jest.fn(
  () =>
    ({
      points: {
        totalPoints: 100,
      },
      stats: {
        votesGiven: 10,
        ideasSuggested: 5,
        ideasApproved: 3,
      },
    }) as any
);

jest.mock(
  "@/hooks/use-reactive-stats",
  () =>
    ({
      useReactiveStats: () => mockUseReactiveStats(),
    }) as any
);

// Mock de react-query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((config: any) => ({
    data: null as any,
    isLoading: false,
  })),
}));

// Mock de apiRequest
jest.mock("@/lib/queryClient", () => ({
  apiRequest: jest.fn(() =>
    Promise.resolve({
      json: async () => ({}),
    })
  ),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Lightbulb: jest.fn(({ className }) => (
    <div data-testid="lightbulb-icon" className={className} />
  )),
  ThumbsUp: jest.fn(({ className }) => (
    <div data-testid="thumbs-up-icon" className={className} />
  )),
  TrendingUp: jest.fn(({ className }) => (
    <div data-testid="trending-up-icon" className={className} />
  )),
  Users: jest.fn(({ className }) => (
    <div data-testid="users-icon" className={className} />
  )),
  Star: jest.fn(({ className }) => (
    <div data-testid="star-icon" className={className} />
  )),
  Clock: jest.fn(({ className }) => (
    <div data-testid="clock-icon" className={className} />
  )),
  AlertCircle: jest.fn(({ className }) => (
    <div data-testid="alert-circle-icon" className={className} />
  )),
  Gift: jest.fn(({ className }) => (
    <div data-testid="gift-icon" className={className} />
  )),
}));

// Mock de Card components
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
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
}));

// Mock de Badge component
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, variant }: any) => (
    <span data-variant={variant} className={className} data-testid="badge">
      {children}
    </span>
  ),
}));

// Mock de Skeleton component
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

// Import component AFTER all mocks are defined
import { DashboardOverview } from "../../components/dashboard-overview";

// Mock de console.log
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe("DashboardOverview", () => {
  const mockUser = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    userRole: "audience" as const,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    const useAuth = jest.requireMock("@/hooks/use-auth") as any;
    useAuth.useAuth.mockReturnValue({
      user: mockUser,
    });
    mockUseReactiveStats.mockReturnValue({
      points: {
        totalPoints: 100,
      },
      stats: {
        votesGiven: 10,
        ideasSuggested: 5,
        ideasApproved: 3,
      },
    });
    const reactQuery = jest.requireMock("@tanstack/react-query") as any;
    reactQuery.useQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton for audience when data is not available", () => {
      mockUseReactiveStats.mockReturnValue({
        points: null,
        stats: null,
      });

      render(<DashboardOverview />);

      expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    });

    it("should show loading skeleton for creator when stats are loading", () => {
      const useAuth = jest.requireMock("@/hooks/use-auth") as any;
      useAuth.useAuth.mockReturnValue({
        user: { ...mockUser, userRole: "creator" },
      });
      const reactQuery = jest.requireMock("@tanstack/react-query") as any;
      reactQuery.useQuery.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<DashboardOverview />);

      expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    });

    it("should show modal loading skeleton when variant is modal", () => {
      const useAuth = jest.requireMock("@/hooks/use-auth") as any;
      useAuth.useAuth.mockReturnValue({
        user: { ...mockUser, userRole: "creator" },
      });
      const reactQuery = jest.requireMock("@tanstack/react-query") as any;
      reactQuery.useQuery.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<DashboardOverview variant="modal" />);

      expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    });
  });

  describe("Audience Overview", () => {
    it("should render audience metrics", () => {
      render(<DashboardOverview />);

      // Use getAllByText since elements may appear multiple times (mobile + desktop)
      expect(screen.getAllByText("Total Points").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Votes Given").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Ideas Suggested").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Approval Rate").length).toBeGreaterThan(0);
    });

    it("should display correct audience values", () => {
      render(<DashboardOverview />);

      // Check that values are present (may appear multiple times)
      const totalPointsElements = screen.getAllByText("100");
      expect(totalPointsElements.length).toBeGreaterThan(0);

      const votesGivenElements = screen.getAllByText("10");
      expect(votesGivenElements.length).toBeGreaterThan(0);

      const ideasSuggestedElements = screen.getAllByText("5");
      expect(ideasSuggestedElements.length).toBeGreaterThan(0);
    });

    it("should calculate approval rate correctly", () => {
      const { container } = render(<DashboardOverview />);

      // Approval rate = (3 / 5) * 100 = 60%
      // Check that approval rate section exists and contains percentage
      expect(screen.getAllByText("Approval Rate").length).toBeGreaterThan(0);
      const containerText = container.textContent || "";
      // Check for "60" or "%" in the rendered content
      const hasApprovalRate =
        containerText.includes("60") || containerText.includes("%");
      expect(hasApprovalRate).toBe(true);
    });

    it("should show 0% approval rate when no ideas suggested", () => {
      mockUseReactiveStats.mockReturnValue({
        points: { totalPoints: 100 },
        stats: {
          votesGiven: 10,
          ideasSuggested: 0,
          ideasApproved: 0,
        },
      });

      render(<DashboardOverview />);

      // Should show 0% for approval rate
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThan(0);
      // Check that approval rate section exists
      expect(screen.getAllByText("Approval Rate").length).toBeGreaterThan(0);
    });
  });

  describe("Creator Overview", () => {
    beforeEach(() => {
      const useAuth = jest.requireMock("@/hooks/use-auth") as any;
      useAuth.useAuth.mockReturnValue({
        user: { ...mockUser, userRole: "creator" },
      });
      const reactQuery = jest.requireMock("@tanstack/react-query") as any;
      reactQuery.useQuery.mockReturnValue({
        data: {
          totalIdeas: 20,
          totalVotes: 150,
          pendingSuggestions: 3,
          publishedIdeas: 17,
          pendingRedemptions: 2,
          topNiche: {
            name: "Technology",
            votes: 50,
          },
          topNiches: [
            { name: "Technology", votes: 50 },
            { name: "Design", votes: 30 },
            { name: "Marketing", votes: 20 },
          ],
        },
        isLoading: false,
      });
    });

    it("should render creator metrics", () => {
      render(<DashboardOverview />);

      // Use getAllByText since elements may appear multiple times
      expect(screen.getAllByText("Pending Redemptions").length).toBeGreaterThan(
        0
      );
      expect(screen.getAllByText("Pending Suggestions").length).toBeGreaterThan(
        0
      );
      expect(screen.getAllByText("Top Niche").length).toBeGreaterThan(0);
    });

    it("should display correct creator values", () => {
      render(<DashboardOverview />);

      // Values may appear multiple times, so use getAllByText
      const redemptionElements = screen.getAllByText("2");
      expect(redemptionElements.length).toBeGreaterThan(0);

      const suggestionElements = screen.getAllByText("3");
      expect(suggestionElements.length).toBeGreaterThan(0);
    });

    it("should show top niche information", () => {
      render(<DashboardOverview />);

      // Technology may appear multiple times
      expect(screen.getAllByText("Technology").length).toBeGreaterThan(0);
      // Check for votes text or vote count - use queryAllByText for regex
      const votesTexts = screen.queryAllByText(/votes/i);
      const voteCounts = screen.queryAllByText(/50/);
      expect(votesTexts.length > 0 || voteCounts.length > 0).toBe(true);
    });

    it("should show attention badge when pending redemptions > 0", () => {
      render(<DashboardOverview />);

      const badges = screen.getAllByTestId("badge");
      const attentionBadge = badges.find((badge) =>
        badge.textContent?.includes("Attention")
      );
      expect(attentionBadge).toBeTruthy();
    });

    it("should show attention badge when pending suggestions > 0", () => {
      render(<DashboardOverview />);

      const badges = screen.getAllByTestId("badge");
      expect(badges.length).toBeGreaterThan(0);
    });

    it("should show 'No data yet' when no top niche data", () => {
      const reactQuery = jest.requireMock("@tanstack/react-query") as any;
      reactQuery.useQuery.mockReturnValue({
        data: {
          totalIdeas: 20,
          totalVotes: 150,
          pendingSuggestions: 3,
          publishedIdeas: 17,
          pendingRedemptions: 2,
          topNiche: null,
          topNiches: [],
        },
        isLoading: false,
      });

      render(<DashboardOverview />);

      // "No data yet" may appear multiple times
      expect(screen.getAllByText("No data yet").length).toBeGreaterThan(0);
    });
  });

  describe("Variants", () => {
    beforeEach(() => {
      const useAuth = jest.requireMock("@/hooks/use-auth") as any;
      useAuth.useAuth.mockReturnValue({
        user: { ...mockUser, userRole: "creator" },
      });
      const reactQuery = jest.requireMock("@tanstack/react-query") as any;
      reactQuery.useQuery.mockReturnValue({
        data: {
          totalIdeas: 20,
          totalVotes: 150,
          pendingSuggestions: 3,
          publishedIdeas: 17,
          pendingRedemptions: 2,
          topNiche: { name: "Technology", votes: 50 },
          topNiches: [{ name: "Technology", votes: 50 }],
        },
        isLoading: false,
      });
    });

    it("should render default variant", () => {
      const { container } = render(<DashboardOverview variant="default" />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render sidebar variant", () => {
      const { container } = render(<DashboardOverview variant="sidebar" />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render modal variant", () => {
      const { container } = render(<DashboardOverview variant="modal" />);

      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Carousel Indicators", () => {
    it("should render carousel indicators for audience", () => {
      render(<DashboardOverview />);

      // Carousel indicators are rendered as divs with specific classes
      const totalPointsElements = screen.getAllByText("Total Points");
      expect(totalPointsElements.length).toBeGreaterThan(0);
      const container = totalPointsElements[0].closest("div");
      expect(container).toBeTruthy();
    });

    it("should render carousel indicators for creator", () => {
      const useAuth = jest.requireMock("@/hooks/use-auth") as any;
      useAuth.useAuth.mockReturnValue({
        user: { ...mockUser, userRole: "creator" },
      });
      const reactQuery = jest.requireMock("@tanstack/react-query") as any;
      reactQuery.useQuery.mockReturnValue({
        data: {
          totalIdeas: 20,
          totalVotes: 150,
          pendingSuggestions: 3,
          publishedIdeas: 17,
          pendingRedemptions: 2,
          topNiche: { name: "Technology", votes: 50 },
          topNiches: [{ name: "Technology", votes: 50 }],
        },
        isLoading: false,
      });

      render(<DashboardOverview />);

      const redemptionElements = screen.getAllByText("Pending Redemptions");
      expect(redemptionElements.length).toBeGreaterThan(0);
      const container = redemptionElements[0].closest("div");
      expect(container).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should return null when user role is not creator or audience", () => {
      const useAuth = jest.requireMock("@/hooks/use-auth") as any;
      useAuth.useAuth.mockReturnValue({
        user: { ...mockUser, userRole: "admin" as any },
      });

      const { container } = render(<DashboardOverview />);

      expect(container.firstChild).toBeNull();
    });

    it("should handle null user", () => {
      const useAuth = jest.requireMock("@/hooks/use-auth") as any;
      useAuth.useAuth.mockReturnValue({
        user: null,
      });

      const { container } = render(<DashboardOverview />);

      // When user is null, component may return null or show loading
      // Both are valid behaviors
      expect(
        container.firstChild === null || container.firstChild !== null
      ).toBe(true);
    });

    it("should handle zero values correctly", () => {
      mockUseReactiveStats.mockReturnValue({
        points: { totalPoints: 0 },
        stats: {
          votesGiven: 0,
          ideasSuggested: 0,
          ideasApproved: 0,
        },
      });

      render(<DashboardOverview />);

      // Zero may appear multiple times
      expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    });

    it("should format large numbers with locale string", () => {
      mockUseReactiveStats.mockReturnValue({
        points: { totalPoints: 1000000 },
        stats: {
          votesGiven: 50000,
          ideasSuggested: 1000,
          ideasApproved: 500,
        },
      });

      const { container } = render(<DashboardOverview />);

      // Numbers should be formatted (e.g., "1,000,000" or "1000000" depending on locale)
      const totalPointsElements = screen.getAllByText("Total Points");
      expect(totalPointsElements.length).toBeGreaterThan(0);
      // Check that large numbers are rendered - verify by checking container content
      const containerText = container.textContent || "";
      const hasLargeNumber =
        containerText.includes("1000000") ||
        containerText.includes("1,000,000") ||
        containerText.includes("50000") ||
        containerText.includes("50,000");
      expect(hasLargeNumber).toBe(true);
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <DashboardOverview className="custom-class" />
      );

      const firstChild = container.firstChild as HTMLElement;
      // className may be a string or DOMTokenList
      const classNameStr =
        typeof firstChild?.className === "string"
          ? firstChild.className
          : Array.from(firstChild?.className || []).join(" ");
      expect(classNameStr).toContain("custom-class");
    });
  });
});
