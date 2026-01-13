import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PointsDisplay } from "../../components/points-display";

// Mock de useTranslation
const mockT = jest.fn((key: string, options?: any) => {
  if (options && typeof options === "object" && "points" in options) {
    return key.replace("{{points}}", options.points);
  }
  return key;
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de useQuery
const mockPointsData = {
  totalPoints: 100,
  pointsEarned: 150,
  pointsSpent: 50,
} as any;

const mockTransactionsData = [
  {
    id: 1,
    type: "earned" as const,
    amount: 10,
    reason: "vote",
  },
  {
    id: 2,
    type: "spent" as const,
    amount: 5,
    reason: "suggestion",
  },
] as any;

const mockUseQuery = jest.fn(({ queryKey }: any) => {
  if (queryKey[0] === "/api/user/points") {
    return {
      data: mockPointsData,
      isLoading: false,
    };
  }
  if (queryKey[0] === "/api/user/point-transactions") {
    return {
      data: mockTransactionsData,
      isLoading: false,
    };
  }
  return {
    data: undefined,
    isLoading: false,
  };
});

jest.mock("@tanstack/react-query", () => ({
  useQuery: (config: any) => mockUseQuery(config),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Coins: jest.fn(({ className }) => (
    <div data-testid="coins-icon" className={className} />
  )),
  TrendingUp: jest.fn(({ className }) => (
    <div data-testid="trending-up-icon" className={className} />
  )),
  TrendingDown: jest.fn(({ className }) => (
    <div data-testid="trending-down-icon" className={className} />
  )),
}));

// Mock de Card components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
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
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
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

describe("PointsDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation((key: string, options?: any) => {
      if (options && typeof options === "object" && "points" in options) {
        return key.replace("{{points}}", options.points);
      }
      return key;
    });
    mockUseQuery.mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "/api/user/points") {
        return {
          data: mockPointsData,
          isLoading: false,
        };
      }
      if (queryKey[0] === "/api/user/point-transactions") {
        return {
          data: mockTransactionsData,
          isLoading: false,
        };
      }
      return {
        data: undefined,
        isLoading: false,
      };
    });
  });

  describe("Basic Rendering", () => {
    it("should render points display", () => {
      const { container } = render(<PointsDisplay />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render card", () => {
      render(<PointsDisplay />);

      expect(screen.getByTestId("card")).toBeTruthy();
    });

    it("should render coins icon", () => {
      render(<PointsDisplay />);

      expect(screen.getByTestId("coins-icon")).toBeTruthy();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when points are loading", () => {
      mockUseQuery.mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === "/api/user/points") {
          return {
            data: undefined,
            isLoading: true,
          };
        }
        return {
          data: undefined,
          isLoading: false,
        };
      });

      render(<PointsDisplay />);

      expect(mockT).toHaveBeenCalledWith("points.title");
      // Check for loading skeleton
      const cardContent = screen.getByTestId("card-content");
      expect(cardContent.querySelector(".animate-pulse")).toBeTruthy();
    });
  });

  describe("Points Data Display", () => {
    it("should display total points", () => {
      render(<PointsDisplay />);

      expect(screen.getByText("100")).toBeTruthy();
    });

    it("should display points earned", () => {
      render(<PointsDisplay />);

      expect(screen.getByText("150")).toBeTruthy();
    });

    it("should display points spent", () => {
      render(<PointsDisplay />);

      expect(screen.getByText("50")).toBeTruthy();
    });

    it("should default to 0 when points data is undefined", () => {
      mockUseQuery.mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === "/api/user/points") {
          return {
            data: undefined,
            isLoading: false,
          };
        }
        return {
          data: undefined,
          isLoading: false,
        };
      });

      render(<PointsDisplay />);

      // Should show 0 for total points
      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThan(0);
    });
  });

  describe("Translation Calls", () => {
    it("should call translation for title", () => {
      render(<PointsDisplay />);

      expect(mockT).toHaveBeenCalledWith("points.title");
    });

    it("should call translation for current points with interpolation", () => {
      render(<PointsDisplay />);

      expect(mockT).toHaveBeenCalledWith("points.currentPoints", {
        points: 100,
      });
    });

    it("should call translation for earned by", () => {
      render(<PointsDisplay />);

      expect(mockT).toHaveBeenCalledWith("points.earnedBy");
    });

    it("should call translation for spent on", () => {
      render(<PointsDisplay />);

      expect(mockT).toHaveBeenCalledWith("points.spentOn");
    });
  });

  describe("How to Earn Section", () => {
    it("should render how to earn section", () => {
      render(<PointsDisplay />);

      expect(mockT).toHaveBeenCalledWith("points.howToEarn.title");
      expect(mockT).toHaveBeenCalledWith("points.howToEarn.vote");
      expect(mockT).toHaveBeenCalledWith("points.howToEarn.approvedIdea");
    });

    it("should render trending up icons for earning methods", () => {
      render(<PointsDisplay />);

      const trendingUpIcons = screen.getAllByTestId("trending-up-icon");
      expect(trendingUpIcons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("How to Spend Section", () => {
    it("should render how to spend section", () => {
      render(<PointsDisplay />);

      expect(mockT).toHaveBeenCalledWith("points.howToSpend.title");
      expect(mockT).toHaveBeenCalledWith("points.howToSpend.suggestion");
    });

    it("should render trending down icon for spending method", () => {
      render(<PointsDisplay />);

      const trendingDownIcons = screen.getAllByTestId("trending-down-icon");
      expect(trendingDownIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Transactions History", () => {
    it("should render transactions history when data is available", () => {
      render(<PointsDisplay />);

      expect(mockT).toHaveBeenCalledWith("points.pointsHistory");
    });

    it("should render transaction items", () => {
      render(<PointsDisplay />);

      // Should render transaction badges
      const badges = screen.getAllByTestId("badge");
      expect(badges.length).toBeGreaterThan(0);
    });

    it("should show earned transaction with correct badge variant", () => {
      render(<PointsDisplay />);

      const badges = screen.getAllByTestId("badge");
      const earnedBadge = badges.find((badge) =>
        badge.textContent?.includes("+10")
      );
      expect(earnedBadge?.getAttribute("data-variant")).toBe("default");
    });

    it("should show spent transaction with correct badge variant", () => {
      render(<PointsDisplay />);

      const badges = screen.getAllByTestId("badge");
      const spentBadge = badges.find((badge) =>
        badge.textContent?.includes("-5")
      );
      expect(spentBadge?.getAttribute("data-variant")).toBe("destructive");
    });

    it("should not render transactions section when no transactions", () => {
      mockUseQuery.mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === "/api/user/points") {
          return {
            data: mockPointsData,
            isLoading: false,
          };
        }
        if (queryKey[0] === "/api/user/point-transactions") {
          return {
            data: [],
            isLoading: false,
          };
        }
        return {
          data: undefined,
          isLoading: false,
        };
      });

      render(<PointsDisplay />);

      // When transactions array is empty, the section should not render
      // Check by looking for transaction badges
      const badges = screen.queryAllByTestId("badge");
      const transactionBadges = badges.filter((badge) =>
        badge.textContent?.match(/[+-]\d+/)
      );
      expect(transactionBadges.length).toBe(0);
    });

    it("should limit transactions to 5", () => {
      const manyTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        type: "earned" as const,
        amount: 10,
        reason: "vote",
      }));

      mockUseQuery.mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === "/api/user/points") {
          return {
            data: mockPointsData,
            isLoading: false,
          };
        }
        if (queryKey[0] === "/api/user/point-transactions") {
          return {
            data: manyTransactions,
            isLoading: false,
          };
        }
        return {
          data: undefined,
          isLoading: false,
        };
      });

      render(<PointsDisplay />);

      // Should only show first 5 transactions
      const badges = screen.getAllByTestId("badge");
      // 5 transaction badges (filtering out other badges that might exist)
      const transactionBadges = badges.filter((badge) =>
        badge.textContent?.match(/[+-]\d+/)
      );
      expect(transactionBadges.length).toBe(5);
    });
  });

  describe("Transaction Icons", () => {
    it("should render trending up icon for earned transactions", () => {
      render(<PointsDisplay />);

      const trendingUpIcons = screen.getAllByTestId("trending-up-icon");
      // At least one for earned transaction, plus the ones in "how to earn" section
      expect(trendingUpIcons.length).toBeGreaterThan(2);
    });

    it("should render trending down icon for spent transactions", () => {
      render(<PointsDisplay />);

      const trendingDownIcons = screen.getAllByTestId("trending-down-icon");
      // At least one for spent transaction, plus the one in "how to spend" section
      expect(trendingDownIcons.length).toBeGreaterThan(1);
    });
  });

  describe("Query Configuration", () => {
    it("should query user points endpoint", () => {
      render(<PointsDisplay />);

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["/api/user/points"],
        })
      );
    });

    it("should query point transactions endpoint", () => {
      render(<PointsDisplay />);

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["/api/user/point-transactions"],
        })
      );
    });
  });
});
