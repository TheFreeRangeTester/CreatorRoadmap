import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CompactIdeaCard } from "../../components/compact-idea-card";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  ThumbsUp: jest.fn(({ className }) => (
    <div data-testid="thumbs-up-icon" className={className} />
  )),
  TrendingUp: jest.fn(({ className }) => (
    <div data-testid="trending-up-icon" className={className} />
  )),
  TrendingDown: jest.fn(({ className }) => (
    <div data-testid="trending-down-icon" className={className} />
  )),
  Minus: jest.fn(({ className }) => (
    <div data-testid="minus-icon" className={className} />
  )),
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, size, variant }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid="vote-button"
    >
      {children}
    </button>
  ),
}));

// Mock de Badge component
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, variant }: any) => (
    <span
      data-variant={variant}
      className={className}
      data-testid="badge"
    >
      {children}
    </span>
  ),
}));

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
// Mock both global and window localStorage
global.localStorage = localStorageMock as any;
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});


describe("CompactIdeaCard", () => {
  const mockIdea = {
    id: 1,
    title: "Test Idea",
    description: "Test Description",
    votes: 10,
    position: {
      current: 1,
      previous: 2,
      change: -1,
    },
  };

  const mockOnVote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Basic Rendering", () => {
    it("should render idea title and description", () => {
      render(
        <CompactIdeaCard rank={1} idea={mockIdea} isLoggedIn={true} />
      );

      expect(screen.getByText("Test Idea")).toBeTruthy();
      expect(screen.getByText("Test Description")).toBeTruthy();
    });

    it("should render vote count", () => {
      render(
        <CompactIdeaCard rank={1} idea={mockIdea} isLoggedIn={true} />
      );

      expect(screen.getByText(/10/)).toBeTruthy();
    });

    it("should render rank badge", () => {
      render(
        <CompactIdeaCard rank={1} idea={mockIdea} isLoggedIn={true} />
      );

      // Should render emoji for rank 1
      expect(screen.getByText("🏆")).toBeTruthy();
    });
  });

  describe("Rank Styling", () => {
    it("should apply gold styling for rank 1", () => {
      const { container } = render(
        <CompactIdeaCard rank={1} idea={mockIdea} isLoggedIn={true} />
      );

      const rankBadge = container.querySelector(".from-yellow-400");
      expect(rankBadge).toBeTruthy();
    });

    it("should apply silver styling for rank 2", () => {
      const { container } = render(
        <CompactIdeaCard rank={2} idea={mockIdea} isLoggedIn={true} />
      );

      expect(screen.getByText("🥈")).toBeTruthy();
    });

    it("should apply bronze styling for rank 3", () => {
      const { container } = render(
        <CompactIdeaCard rank={3} idea={mockIdea} isLoggedIn={true} />
      );

      expect(screen.getByText("🥉")).toBeTruthy();
    });

    it("should apply default styling for rank > 3", () => {
      render(
        <CompactIdeaCard rank={4} idea={mockIdea} isLoggedIn={true} />
      );

      // Should show rank number instead of emoji
      expect(screen.getByText("#4")).toBeTruthy();
    });
  });

  describe("Trend Indicators", () => {
    it("should show trending up icon when position change is positive", () => {
      const ideaWithUpTrend = {
        ...mockIdea,
        position: { current: 1, previous: 3, change: 2 },
      };

      render(
        <CompactIdeaCard rank={1} idea={ideaWithUpTrend} isLoggedIn={true} />
      );

      expect(screen.getByTestId("trending-up-icon")).toBeTruthy();
    });

    it("should show trending down icon when position change is negative", () => {
      render(
        <CompactIdeaCard rank={1} idea={mockIdea} isLoggedIn={true} />
      );

      expect(screen.getByTestId("trending-down-icon")).toBeTruthy();
    });

    it("should show minus icon when position change is null", () => {
      const ideaWithNoChange = {
        ...mockIdea,
        position: { current: 1, previous: null, change: null },
      };

      render(
        <CompactIdeaCard rank={1} idea={ideaWithNoChange} isLoggedIn={true} />
      );

      expect(screen.getByTestId("minus-icon")).toBeTruthy();
    });

    it("should show minus icon when position change is 0", () => {
      const ideaWithZeroChange = {
        ...mockIdea,
        position: { current: 1, previous: 1, change: 0 },
      };

      render(
        <CompactIdeaCard rank={1} idea={ideaWithZeroChange} isLoggedIn={true} />
      );

      expect(screen.getByTestId("minus-icon")).toBeTruthy();
    });
  });

  describe("Vote Button", () => {
    it("should render vote button when onVote is provided", () => {
      render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          onVote={mockOnVote}
          isLoggedIn={true}
        />
      );

      expect(screen.getByTestId("vote-button")).toBeTruthy();
    });

    it("should not render vote button when onVote is not provided", () => {
      render(
        <CompactIdeaCard rank={1} idea={mockIdea} isLoggedIn={true} />
      );

      expect(screen.queryByTestId("vote-button")).toBeNull();
    });

    it("should call onVote when vote button is clicked", () => {
      render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          onVote={mockOnVote}
          isLoggedIn={true}
        />
      );

      const voteButton = screen.getByTestId("vote-button");
      fireEvent.click(voteButton);

      expect(mockOnVote).toHaveBeenCalledWith(mockIdea.id);
      expect(mockOnVote).toHaveBeenCalledTimes(1);
    });

    it("should disable vote button when isVoting is true", () => {
      render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          onVote={mockOnVote}
          isVoting={true}
          isLoggedIn={true}
        />
      );

      const voteButton = screen.getByTestId("vote-button") as HTMLButtonElement;
      expect(voteButton.disabled).toBe(true);
    });

    it("should disable vote button when isVoted is true", () => {
      render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          onVote={mockOnVote}
          isVoted={true}
          isLoggedIn={true}
        />
      );

      const voteButton = screen.getByTestId("vote-button") as HTMLButtonElement;
      expect(voteButton.disabled).toBe(true);
    });

    it("should show loading spinner when isVoting is true", () => {
      render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          onVote={mockOnVote}
          isVoting={true}
          isLoggedIn={true}
        />
      );

      expect(screen.getByTestId("loader-icon")).toBeTruthy();
    });

    it("should show 'Votado' text when isVoted is true", () => {
      render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          onVote={mockOnVote}
          isVoted={true}
          isLoggedIn={true}
        />
      );

      expect(screen.getByText("Votado")).toBeTruthy();
    });

    it("should show 'Votar' text when not voted", () => {
      render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          onVote={mockOnVote}
          isLoggedIn={true}
        />
      );

      expect(screen.getByText("Votar")).toBeTruthy();
    });
  });

  describe("Login to Vote", () => {
    it("should show login button when user is not logged in", () => {
      render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          onVote={mockOnVote}
          isLoggedIn={false}
        />
      );

      expect(screen.getByText("Inicia sesión para votar")).toBeTruthy();
    });

    it("should set redirect when login button is clicked", () => {
      // Clear any previous calls
      localStorageMock.setItem.mockClear();
      
      render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          onVote={mockOnVote}
          isLoggedIn={false}
        />
      );

      const loginButton = screen.getByTestId("vote-button");
      
      // Verify button is clickable
      expect(loginButton).toBeTruthy();
      
      // Click the button - this will trigger the onClick handler
      // The component sets localStorage and then redirects
      fireEvent.click(loginButton);

      // Verify that localStorage.setItem was called with redirect key
      // Note: The redirect may fail in test environment, but we verify the localStorage call
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const setItemCalls = localStorageMock.setItem.mock.calls;
      if (setItemCalls.length > 0) {
        expect(setItemCalls[0][0]).toBe("redirectAfterAuth");
        // The second argument will be the current pathname
        expect(setItemCalls[0][1]).toBeTruthy();
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle idea without description", () => {
      const ideaWithoutDescription = {
        ...mockIdea,
        description: "",
      };

      render(
        <CompactIdeaCard rank={1} idea={ideaWithoutDescription} isLoggedIn={true} />
      );

      expect(screen.getByText("Test Idea")).toBeTruthy();
      expect(screen.queryByText("Test Description")).toBeNull();
    });

    it("should handle idea without position data", () => {
      const ideaWithoutPosition = {
        ...mockIdea,
        position: undefined,
      };

      render(
        <CompactIdeaCard rank={1} idea={ideaWithoutPosition} isLoggedIn={true} />
      );

      expect(screen.getByTestId("minus-icon")).toBeTruthy();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <CompactIdeaCard
          rank={1}
          idea={mockIdea}
          className="custom-class"
          isLoggedIn={true}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card?.className).toContain("custom-class");
    });
  });
});
