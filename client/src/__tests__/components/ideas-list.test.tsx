import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IdeasList } from "../../components/ideas-list";
import { IdeaResponse } from "@shared/schema";

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
  TrendingUp: jest.fn(({ className }) => (
    <div data-testid="trending-up-icon" className={className} />
  )),
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    size,
    "data-testid": testId,
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-size={size}
      data-testid={testId}
    >
      {children}
    </button>
  ),
}));

// Mock de Badge component
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, "data-testid": testId }: any) => (
    <div data-testid={testId} className={className}>
      {children}
    </div>
  ),
}));

// Mock de localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock de window.location
delete (window as any).location;
(window as any).location = { href: "http://localhost:3000", pathname: "/" };

describe("IdeasList", () => {
  const mockIdeas: IdeaResponse[] = [
    {
      id: 1,
      title: "Test Idea 1",
      description: "Test Description 1",
      votes: 10,
      creatorId: 1,
      niche: "technology",
      suggestedByUsername: undefined,
      position: {
        current: 1,
        previous: 2,
        change: 1,
      },
    } as IdeaResponse,
    {
      id: 2,
      title: "Test Idea 2",
      description: "Test Description 2",
      votes: 5,
      creatorId: 2,
      niche: "gaming",
      suggestedByUsername: "testuser",
      position: {
        current: 2,
        previous: 1,
        change: -1,
      },
    } as IdeaResponse,
  ];

  const mockOnVote = jest.fn();
  const mockUser = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe("Basic Rendering", () => {
    it("should return null when ideas array is empty", () => {
      const { container } = render(
        <IdeasList
          ideas={[]}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render title", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(mockT).toHaveBeenCalledWith("ideas.allIdeas", "Todas las Ideas");
    });

    it("should render all ideas", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.getByText("Test Idea 1")).toBeTruthy();
      expect(screen.getByText("Test Idea 2")).toBeTruthy();
    });

    it("should render idea descriptions", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.getByText("Test Description 1")).toBeTruthy();
      expect(screen.getByText("Test Description 2")).toBeTruthy();
    });

    it("should render vote counts", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.getByText("10")).toBeTruthy();
      expect(screen.getByText("5")).toBeTruthy();
    });
  });

  describe("Ranking", () => {
    it("should render rank numbers starting from startRank", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
          startRank={4}
        />
      );

      expect(screen.getByText("#4")).toBeTruthy();
      expect(screen.getByText("#5")).toBeTruthy();
    });

    it("should use default startRank of 4", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.getByText("#4")).toBeTruthy();
    });
  });

  describe("Voting", () => {
    it("should render vote button for each idea", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.getByTestId("button-vote-list-1")).toBeTruthy();
      expect(screen.getByTestId("button-vote-list-2")).toBeTruthy();
    });

    it("should call onVote when vote button is clicked", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      const voteButton = screen.getByTestId("button-vote-list-1");
      fireEvent.click(voteButton);

      expect(mockOnVote).toHaveBeenCalledWith(1);
    });

    it("should show loader when isVoting is true", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{ 1: true }}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.getByTestId("loader-icon")).toBeTruthy();
    });

    it("should disable vote button when hasVoted is true", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set([1])}
          user={mockUser}
        />
      );

      const voteButton = screen.getByTestId(
        "button-vote-list-1"
      ) as HTMLButtonElement;
      expect(voteButton.disabled).toBe(true);
    });

    it("should show 'Votado' text when hasVoted is true", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set([1])}
          user={mockUser}
        />
      );

      expect(mockT).toHaveBeenCalledWith("common.voted", "Votado");
    });

    it("should redirect to auth when user is not logged in", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={null}
        />
      );

      const voteButton = screen.getByTestId("button-vote-list-1");
      fireEvent.click(voteButton);

      // Verify that localStorage.setItem was called for redirect
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "redirectAfterAuth",
        expect.any(String)
      );
      // Component should attempt to redirect (window.location.href assignment)
      // In test environment, we can't fully test the redirect, but we verify the localStorage call
    });
  });

  describe("Suggested By Badge", () => {
    it("should render suggested by badge when suggestedByUsername is provided", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.getByTestId("suggested-badge-list-2")).toBeTruthy();
      expect(screen.getByTestId("user-icon")).toBeTruthy();
    });

    it("should not render suggested by badge when suggestedByUsername is not provided", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.queryByTestId("suggested-badge-list-1")).toBeNull();
    });
  });

  describe("Card Rendering", () => {
    it("should render card for each idea", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.getByTestId("card-idea-list-1")).toBeTruthy();
      expect(screen.getByTestId("card-idea-list-2")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single idea", () => {
      render(
        <IdeasList
          ideas={[mockIdeas[0]]}
          onVote={mockOnVote}
          isVoting={{}}
          votedIdeas={new Set()}
          user={mockUser}
        />
      );

      expect(screen.getByText("Test Idea 1")).toBeTruthy();
      expect(screen.queryByText("Test Idea 2")).toBeNull();
    });

    it("should handle multiple ideas with different voting states", () => {
      render(
        <IdeasList
          ideas={mockIdeas}
          onVote={mockOnVote}
          isVoting={{ 1: true }}
          votedIdeas={new Set([2])}
          user={mockUser}
        />
      );

      // First idea should be voting
      expect(screen.getByTestId("loader-icon")).toBeTruthy();
      // Second idea should be voted
      const voteButton2 = screen.getByTestId(
        "button-vote-list-2"
      ) as HTMLButtonElement;
      expect(voteButton2.disabled).toBe(true);
    });
  });
});
