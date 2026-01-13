import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AudienceStats from "../../components/audience-stats";

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
const mockUser = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
} as any;

const mockUseAuth = jest.fn(() => ({
  user: mockUser,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de useReactiveStats
const mockUseReactiveStats = jest.fn();

jest.mock("@/hooks/use-reactive-stats", () => ({
  useReactiveStats: (creatorId?: number) => mockUseReactiveStats(creatorId),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  ThumbsUp: jest.fn(({ className }) => (
    <div data-testid="thumbs-up-icon" className={className} />
  )),
  Send: jest.fn(({ className }) => (
    <div data-testid="send-icon" className={className} />
  )),
  CheckCircle: jest.fn(({ className }) => (
    <div data-testid="check-circle-icon" className={className} />
  )),
  BarChart3: jest.fn(({ className }) => (
    <div data-testid="bar-chart-icon" className={className} />
  )),
  Star: jest.fn(({ className }) => (
    <div data-testid="star-icon" className={className} />
  )),
}));

// Mock de componentes UI
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

// Mock de console.log para evitar spam en tests
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
  jest.clearAllMocks();
  mockT.mockImplementation(
    (key: string, defaultValue?: string) => defaultValue || key
  );
  // Reset mockUseReactiveStats to default return value
  mockUseReactiveStats.mockImplementation(() => ({
    points: {
      userId: 1,
      totalPoints: 100,
      pointsEarned: 150,
      pointsSpent: 50,
    } as any,
    stats: {
      votesGiven: 25,
      ideasSuggested: 10,
      ideasApproved: 5,
    } as any,
    isLoading: false,
    updatePoints: jest.fn(),
    updateStats: jest.fn(),
    addVote: jest.fn(),
    spendPoints: jest.fn(),
  }));
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe("AudienceStats", () => {
  describe("Conditional Rendering", () => {
    it("should return null when isVisible is false", () => {
      const { container } = render(<AudienceStats isVisible={false} />);
      expect(container.firstChild).toBeNull();
    });

    it("should return null when user is not available", () => {
      mockUseAuth.mockReturnValueOnce({ user: null });
      const { container } = render(<AudienceStats isVisible={true} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render when isVisible is true and user is available", () => {
      render(<AudienceStats isVisible={true} />);
      expect(screen.getByText("Your Activity")).toBeTruthy();
    });
  });

  describe("Header Section", () => {
    it("should render title with icon", () => {
      render(<AudienceStats isVisible={true} />);

      expect(screen.getByText("Your Activity")).toBeTruthy();
      expect(screen.getByTestId("bar-chart-icon")).toBeTruthy();
    });

    it("should render subtitle", () => {
      render(<AudienceStats isVisible={true} />);

      expect(
        screen.getByText("Your participation stats across all creators")
      ).toBeTruthy();
    });

    it("should render points info", () => {
      render(<AudienceStats isVisible={true} />);

      expect(screen.getByText(/Gana puntos votando/)).toBeTruthy();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when isLoading is true", () => {
      mockUseReactiveStats.mockReturnValueOnce({
        points: null,
        stats: null,
        isLoading: true,
        updatePoints: jest.fn(),
        updateStats: jest.fn(),
        addVote: jest.fn(),
        spendPoints: jest.fn(),
      });

      const { container } = render(<AudienceStats isVisible={true} />);

      // Should render 4 skeleton cards
      const cards = container.querySelectorAll('[data-testid="card"]');
      expect(cards.length).toBe(4);
    });

    it("should not show stats when loading", () => {
      mockUseReactiveStats.mockReturnValueOnce({
        points: null,
        stats: null,
        isLoading: true,
        updatePoints: jest.fn(),
        updateStats: jest.fn(),
        addVote: jest.fn(),
        spendPoints: jest.fn(),
      });

      render(<AudienceStats isVisible={true} />);

      // Should not show actual stats values
      expect(screen.queryByText("100")).toBeNull();
    });
  });

  describe("Stats Display", () => {
    it("should render all 4 stats cards", () => {
      render(<AudienceStats isVisible={true} />);

      expect(screen.getByText("Total Points")).toBeTruthy();
      expect(screen.getByText("Votes Given")).toBeTruthy();
      expect(screen.getByText("Ideas Suggested")).toBeTruthy();
      expect(screen.getByText("Ideas Approved")).toBeTruthy();
    });

    it("should display correct values for each stat", () => {
      render(<AudienceStats isVisible={true} />);

      expect(screen.getByText("100")).toBeTruthy(); // Total Points
      expect(screen.getByText("25")).toBeTruthy(); // Votes Given
      expect(screen.getByText("10")).toBeTruthy(); // Ideas Suggested
      expect(screen.getByText("5")).toBeTruthy(); // Ideas Approved
    });

    it("should display correct icons for each stat", () => {
      render(<AudienceStats isVisible={true} />);

      expect(screen.getByTestId("star-icon")).toBeTruthy(); // Total Points
      expect(screen.getByTestId("thumbs-up-icon")).toBeTruthy(); // Votes Given
      expect(screen.getByTestId("send-icon")).toBeTruthy(); // Ideas Suggested
      expect(screen.getByTestId("check-circle-icon")).toBeTruthy(); // Ideas Approved
    });

    it("should display descriptions for each stat", () => {
      render(<AudienceStats isVisible={true} />);

      expect(screen.getByText("Available for suggestions")).toBeTruthy();
      expect(screen.getByText("Ideas you've voted for")).toBeTruthy();
      expect(screen.getByText("Ideas you've suggested")).toBeTruthy();
      expect(screen.getByText("Your ideas that were approved")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null points data", () => {
      mockUseReactiveStats.mockReturnValueOnce({
        points: null,
        stats: {
          votesGiven: 25,
          ideasSuggested: 10,
          ideasApproved: 5,
        },
        isLoading: false,
        updatePoints: jest.fn(),
        updateStats: jest.fn(),
        addVote: jest.fn(),
        spendPoints: jest.fn(),
      });

      render(<AudienceStats isVisible={true} />);

      // Total Points should show 0 when points is null
      const totalPointsElements = screen.getAllByText("0");
      expect(totalPointsElements.length).toBeGreaterThan(0);
    });

    it("should handle null stats data", () => {
      mockUseReactiveStats.mockReturnValueOnce({
        points: {
          userId: 1,
          totalPoints: 100,
          pointsEarned: 150,
          pointsSpent: 50,
        },
        stats: null,
        isLoading: false,
        updatePoints: jest.fn(),
        updateStats: jest.fn(),
        addVote: jest.fn(),
        spendPoints: jest.fn(),
      });

      render(<AudienceStats isVisible={true} />);

      // Stats should show 0 when stats is null
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(3); // At least votes, ideas suggested, ideas approved
    });

    it("should handle zero values", () => {
      mockUseReactiveStats.mockReturnValueOnce({
        points: {
          userId: 1,
          totalPoints: 0,
          pointsEarned: 0,
          pointsSpent: 0,
        },
        stats: {
          votesGiven: 0,
          ideasSuggested: 0,
          ideasApproved: 0,
        },
        isLoading: false,
        updatePoints: jest.fn(),
        updateStats: jest.fn(),
        addVote: jest.fn(),
        spendPoints: jest.fn(),
      });

      render(<AudienceStats isVisible={true} />);

      // All stats should show 0
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(4);
    });

    it("should handle undefined points.totalPoints", () => {
      mockUseReactiveStats.mockReturnValueOnce({
        points: {
          userId: 1,
          totalPoints: undefined as any,
          pointsEarned: 150,
          pointsSpent: 50,
        },
        stats: {
          votesGiven: 25,
          ideasSuggested: 10,
          ideasApproved: 5,
        },
        isLoading: false,
        updatePoints: jest.fn(),
        updateStats: jest.fn(),
        addVote: jest.fn(),
        spendPoints: jest.fn(),
      });

      render(<AudienceStats isVisible={true} />);

      // Should default to 0
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  describe("CreatorId Prop", () => {
    it("should pass creatorId to useReactiveStats hook", () => {
      const creatorId = 123;
      render(<AudienceStats isVisible={true} creatorId={creatorId} />);

      expect(mockUseReactiveStats).toHaveBeenCalled();
      const calls = (mockUseReactiveStats as jest.MockedFunction<any>).mock
        .calls;
      expect(calls[0][0]).toBe(creatorId);
    });

    it("should work without creatorId prop", () => {
      render(<AudienceStats isVisible={true} />);

      expect(mockUseReactiveStats).toHaveBeenCalled();
      // Should be called with undefined when no creatorId is provided
      const calls = (mockUseReactiveStats as jest.MockedFunction<any>).mock
        .calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0]).toBeUndefined();
    });
  });

  describe("Translation", () => {
    it("should use translation function for labels", () => {
      render(<AudienceStats isVisible={true} />);

      expect(mockT).toHaveBeenCalledWith(
        "audienceStats.title",
        "Your Activity"
      );
      expect(mockT).toHaveBeenCalledWith(
        "audienceStats.subtitle",
        "Your participation stats across all creators"
      );
      expect(mockT).toHaveBeenCalledWith("points.totalPoints", "Total Points");
    });

    it("should use translation function for stat descriptions", () => {
      render(<AudienceStats isVisible={true} />);

      expect(mockT).toHaveBeenCalledWith(
        "points.availableForSuggestions",
        "Available for suggestions"
      );
      expect(mockT).toHaveBeenCalledWith(
        "audienceStats.votesGivenDesc",
        "Ideas you've voted for"
      );
    });
  });

  describe("Console Logging", () => {
    it("should log stats when stats data exists", () => {
      const statsData = {
        votesGiven: 25,
        ideasSuggested: 10,
        ideasApproved: 5,
      };

      mockUseReactiveStats.mockReturnValueOnce({
        points: null,
        stats: statsData,
        isLoading: false,
        updatePoints: jest.fn(),
        updateStats: jest.fn(),
        addVote: jest.fn(),
        spendPoints: jest.fn(),
      });

      render(<AudienceStats isVisible={true} />);

      expect(console.log).toHaveBeenCalledWith(
        "[AUDIENCE-STATS] Current stats:",
        statsData
      );
    });

    it("should log points when points data exists", () => {
      const pointsData = {
        userId: 1,
        totalPoints: 100,
        pointsEarned: 150,
        pointsSpent: 50,
      };

      mockUseReactiveStats.mockReturnValueOnce({
        points: pointsData,
        stats: null,
        isLoading: false,
        updatePoints: jest.fn(),
        updateStats: jest.fn(),
        addVote: jest.fn(),
        spendPoints: jest.fn(),
      });

      render(<AudienceStats isVisible={true} />);

      expect(console.log).toHaveBeenCalledWith(
        "[POINTS-DATA] Current points:",
        pointsData
      );
    });

    it("should not log when data is null", () => {
      mockUseReactiveStats.mockReturnValueOnce({
        points: null,
        stats: null,
        isLoading: false,
        updatePoints: jest.fn(),
        updateStats: jest.fn(),
        addVote: jest.fn(),
        spendPoints: jest.fn(),
      });

      render(<AudienceStats isVisible={true} />);

      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining("[AUDIENCE-STATS]"),
        expect.anything()
      );
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining("[POINTS-DATA]"),
        expect.anything()
      );
    });
  });
});
