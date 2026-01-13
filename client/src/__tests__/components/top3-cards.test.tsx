import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      initial,
      animate,
      transition,
      whileHover,
      ...props
    }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Trophy: jest.fn(({ className }) => (
    <div data-testid="trophy-icon" className={className} />
  )),
  TrendingUp: jest.fn(({ className }) => (
    <div data-testid="trending-up-icon" className={className} />
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
    variant,
    size,
    className,
    ...props
  }: any) => (
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
  ),
}));

// Mock de Badge component
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

// Mock de cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock de localStorage
const mockLocalStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock de window.location
delete (window as any).location;
(window as any).location = {
  href: "",
  pathname: "/test",
};

import { Top3Cards } from "../../components/top3-cards";

describe("Top3Cards", () => {
  const mockOnVote = jest.fn();
  const mockIsVoting: { [key: number]: boolean } = {};
  const mockVotedIdeas = new Set<number>();
  const mockUser = {
    id: 1,
    username: "testuser",
  } as any;

  const mockIdea1 = {
    id: 1,
    title: "Idea 1",
    description: "Description 1",
    votes: 10,
    suggestedByUsername: null,
  } as any;

  const mockIdea2 = {
    id: 2,
    title: "Idea 2",
    description: "Description 2",
    votes: 8,
    suggestedByUsername: "user1",
  } as any;

  const mockIdea3 = {
    id: 3,
    title: "Idea 3",
    description: "Description 3",
    votes: 5,
    suggestedByUsername: null,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockOnVote.mockClear();
    mockIsVoting[1] = false;
    mockIsVoting[2] = false;
    mockIsVoting[3] = false;
    mockVotedIdeas.clear();
    mockLocalStorage.setItem.mockClear();
    (window as any).location.href = "";
  });

  describe("Basic Rendering", () => {
    it("should render top3 cards", () => {
      const { container } = render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(container.firstChild).toBeTruthy();
    });

    it("should render title", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      const trophyIcons = screen.getAllByTestId("trophy-icon");
      expect(trophyIcons.length).toBeGreaterThan(0);
      expect(screen.getByText("Top 3 Ideas")).toBeTruthy();
    });

    it("should return null when no ideas", () => {
      const { container } = render(
        <Top3Cards
          ideas={[]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Cards Rendering", () => {
    it("should render top 3 ideas", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(screen.getByTestId("card-idea-1")).toBeTruthy();
      expect(screen.getByTestId("card-idea-2")).toBeTruthy();
      expect(screen.getByTestId("card-idea-3")).toBeTruthy();
    });

    it("should render only top 3 ideas when more are provided", () => {
      const extraIdea = {
        id: 4,
        title: "Idea 4",
        description: "Description 4",
        votes: 3,
      } as any;

      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3, extraIdea]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(screen.getByTestId("card-idea-1")).toBeTruthy();
      expect(screen.getByTestId("card-idea-2")).toBeTruthy();
      expect(screen.getByTestId("card-idea-3")).toBeTruthy();
      expect(screen.queryByTestId("card-idea-4")).toBeNull();
    });

    it("should render idea title", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(screen.getByText("Idea 1")).toBeTruthy();
      expect(screen.getByText("Idea 2")).toBeTruthy();
      expect(screen.getByText("Idea 3")).toBeTruthy();
    });

    it("should render idea description", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(screen.getByText("Description 1")).toBeTruthy();
      expect(screen.getByText("Description 2")).toBeTruthy();
      expect(screen.getByText("Description 3")).toBeTruthy();
    });

    it("should render vote count", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(screen.getByText("10")).toBeTruthy();
      expect(screen.getByText("8")).toBeTruthy();
      expect(screen.getByText("5")).toBeTruthy();
    });

    it("should render rank badges", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(screen.getByText("#1")).toBeTruthy();
      expect(screen.getByText("#2")).toBeTruthy();
      expect(screen.getByText("#3")).toBeTruthy();
    });
  });

  describe("Suggested By Badge", () => {
    it("should render suggested badge when idea has suggestedByUsername", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(screen.getByTestId("suggested-badge-top3-2")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("ideas.suggestedByAudience");
    });

    it("should not render suggested badge when idea has no suggestedByUsername", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(screen.queryByTestId("suggested-badge-top3-1")).toBeNull();
      expect(screen.queryByTestId("suggested-badge-top3-3")).toBeNull();
    });
  });

  describe("Vote Button", () => {
    it("should render vote button for each idea", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(screen.getByTestId("button-vote-1")).toBeTruthy();
      expect(screen.getByTestId("button-vote-2")).toBeTruthy();
      expect(screen.getByTestId("button-vote-3")).toBeTruthy();
    });

    it("should call onVote when vote button is clicked", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      const voteButton = screen.getByTestId("button-vote-1");
      fireEvent.click(voteButton);

      expect(mockOnVote).toHaveBeenCalledWith(1);
    });

    it("should disable vote button when user has voted", () => {
      mockVotedIdeas.add(1);

      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      const voteButton = screen.getByTestId("button-vote-1");
      expect((voteButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("should disable vote button when voting is in progress", () => {
      mockIsVoting[1] = true;

      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      const voteButton = screen.getByTestId("button-vote-1");
      expect((voteButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("should show voted text when user has voted", () => {
      mockVotedIdeas.add(1);

      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(mockT).toHaveBeenCalledWith("common.voted", "Votado");
    });

    it("should show vote text when user has not voted", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      expect(mockT).toHaveBeenCalledWith("common.vote", "Votar");
    });

    it("should not call onVote when button is disabled", () => {
      mockVotedIdeas.add(1);

      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      const voteButton = screen.getByTestId("button-vote-1");
      fireEvent.click(voteButton);

      expect(mockOnVote).not.toHaveBeenCalled();
    });
  });

  describe("Unauthenticated User", () => {
    it("should redirect to auth when vote button is clicked and user is null", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={null}
        />
      );

      const voteButton = screen.getByTestId("button-vote-1");
      fireEvent.click(voteButton);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "redirectAfterAuth",
        expect.any(String)
      );
      // Verify that location.href was set (the component sets it directly)
      expect((window as any).location.href).toBeTruthy();
    });

    it("should not call onVote when user is null", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={null}
        />
      );

      const voteButton = screen.getByTestId("button-vote-1");
      fireEvent.click(voteButton);

      expect(mockOnVote).not.toHaveBeenCalled();
    });
  });

  describe("Rank Colors", () => {
    it("should apply correct border color for rank 1", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      const card1 = screen.getByTestId("card-idea-1");
      const gradientDiv = card1.querySelector(".bg-gradient-to-br");
      expect(gradientDiv?.className).toContain("from-yellow-400");
    });

    it("should apply correct border color for rank 2", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      const card2 = screen.getByTestId("card-idea-2");
      const gradientDiv = card2.querySelector(".bg-gradient-to-br");
      expect(gradientDiv?.className).toContain("from-blue-400");
    });

    it("should apply correct border color for rank 3", () => {
      render(
        <Top3Cards
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          user={mockUser}
        />
      );

      const card3 = screen.getByTestId("card-idea-3");
      const gradientDiv = card3.querySelector(".bg-gradient-to-br");
      expect(gradientDiv?.className).toContain("from-orange-400");
    });
  });
});
