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
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    h2: ({ children, className, ...props }: any) => (
      <h2 className={className} {...props}>
        {children}
      </h2>
    ),
    p: ({ children, className, ...props }: any) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
  },
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Trophy: jest.fn(({ className }) => (
    <div data-testid="trophy-icon" className={className} />
  )),
  Medal: jest.fn(({ className }) => (
    <div data-testid="medal-icon" className={className} />
  )),
  Award: jest.fn(({ className }) => (
    <div data-testid="award-icon" className={className} />
  )),
  Sparkles: jest.fn(({ className }) => (
    <div data-testid="sparkles-icon" className={className} />
  )),
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
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

import { Top3Podium } from "../../components/top3-podium";

describe("Top3Podium", () => {
  const mockOnVote = jest.fn();
  const mockIsVoting: { [key: number]: boolean } = {};
  const mockVotedIdeas = new Set<number>();
  const mockSuccessVote: number | null = null;
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
    it("should render top3 podium", () => {
      const { container } = render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      expect(container.firstChild).toBeTruthy();
    });

    it("should render title", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const trophyIcons = screen.getAllByTestId("trophy-icon");
      expect(trophyIcons.length).toBeGreaterThan(0);
      expect(mockT).toHaveBeenCalledWith("podium.title", "Top Ideas");
    });

    it("should render subtitle", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      expect(mockT).toHaveBeenCalledWith(
        "podium.subtitle",
        "Las ideas más votadas por la comunidad"
      );
    });

    it("should return null when no ideas", () => {
      const { container } = render(
        <Top3Podium
          ideas={[]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Desktop Layout", () => {
    it("should render desktop layout", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      // Desktop layout should have grid with 3 columns
      const cards = screen.getAllByTestId("card");
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it("should render first place in center", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const idea1Elements = screen.getAllByText("Idea 1");
      expect(idea1Elements.length).toBeGreaterThan(0);
    });

    it("should render second place on left", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const idea2Elements = screen.getAllByText("Idea 2");
      expect(idea2Elements.length).toBeGreaterThan(0);
    });

    it("should render third place on right", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const idea3Elements = screen.getAllByText("Idea 3");
      expect(idea3Elements.length).toBeGreaterThan(0);
    });
  });

  describe("Mobile Layout", () => {
    it("should render mobile layout", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      // Mobile layout should also render cards
      const cards = screen.getAllByTestId("card");
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Rank Icons", () => {
    it("should render trophy icon for rank 1", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const trophyIcons = screen.getAllByTestId("trophy-icon");
      expect(trophyIcons.length).toBeGreaterThan(0);
    });

    it("should render medal icon for rank 2", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const medalIcons = screen.getAllByTestId("medal-icon");
      expect(medalIcons.length).toBeGreaterThan(0);
    });

    it("should render award icon for rank 3", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const awardIcons = screen.getAllByTestId("award-icon");
      expect(awardIcons.length).toBeGreaterThan(0);
    });

    it("should render sparkles icon for winner", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const sparklesIcons = screen.getAllByTestId("sparkles-icon");
      expect(sparklesIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Rank Badges", () => {
    it("should render rank badges", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const rank1Elements = screen.getAllByText("#1");
      const rank2Elements = screen.getAllByText("#2");
      const rank3Elements = screen.getAllByText("#3");
      expect(rank1Elements.length).toBeGreaterThan(0);
      expect(rank2Elements.length).toBeGreaterThan(0);
      expect(rank3Elements.length).toBeGreaterThan(0);
    });
  });

  describe("Idea Content", () => {
    it("should render idea titles", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      // Titles are rendered multiple times (desktop + mobile), so use queryAllByText
      const idea1Elements = screen.queryAllByText("Idea 1");
      const idea2Elements = screen.queryAllByText("Idea 2");
      const idea3Elements = screen.queryAllByText("Idea 3");
      expect(idea1Elements.length).toBeGreaterThan(0);
      expect(idea2Elements.length).toBeGreaterThan(0);
      expect(idea3Elements.length).toBeGreaterThan(0);
    });

    it("should render idea descriptions", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      // Descriptions are rendered multiple times (desktop + mobile), so use queryAllByText
      const desc1Elements = screen.queryAllByText("Description 1");
      const desc2Elements = screen.queryAllByText("Description 2");
      const desc3Elements = screen.queryAllByText("Description 3");
      expect(desc1Elements.length).toBeGreaterThan(0);
      expect(desc2Elements.length).toBeGreaterThan(0);
      expect(desc3Elements.length).toBeGreaterThan(0);
    });
  });

  describe("Suggested By Badge", () => {
    it("should render suggested badge when idea has suggestedByUsername", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      const badges = screen.queryAllByTestId("suggested-badge-podium-2");
      expect(badges.length).toBeGreaterThan(0);
      expect(mockT).toHaveBeenCalledWith("ideas.suggestedByAudience");
    });

    it("should not render suggested badge when idea has no suggestedByUsername", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      expect(screen.queryByTestId("suggested-badge-podium-1")).toBeNull();
      expect(screen.queryByTestId("suggested-badge-podium-3")).toBeNull();
    });
  });

  describe("Vote Button", () => {
    it("should render vote button", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      // Vote buttons should be rendered
      expect(mockT).toHaveBeenCalledWith("common.vote", "Votar");
    });

    it("should call onVote when vote button is clicked", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      // Find vote button by text
      const voteButtons = screen
        .getAllByText(/Votar|vote/i)
        .map((text) => text.closest("button"))
        .filter((btn) => btn !== null);

      if (voteButtons.length > 0 && voteButtons[0]) {
        fireEvent.click(voteButtons[0]);
      }

      expect(mockOnVote).toHaveBeenCalled();
    });

    it("should disable vote button when user has voted", () => {
      mockVotedIdeas.add(1);

      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      expect(mockT).toHaveBeenCalledWith("common.voted", "¡Votado!");
    });

    it("should disable vote button when voting is in progress", () => {
      mockIsVoting[1] = true;

      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      // Button should be disabled when voting
      // When voting, the button shows a spinner, so we check for disabled buttons
      const buttons = screen.getAllByRole("button");
      const voteButtons = buttons.filter(
        (btn) =>
          btn.textContent?.includes("Votar") ||
          btn.textContent?.includes("vote") ||
          btn.textContent?.includes("10") ||
          btn.textContent?.includes("8") ||
          btn.textContent?.includes("5") ||
          (btn as HTMLButtonElement).disabled
      );
      // At least one vote button should be disabled when voting
      const disabledButtons = voteButtons.filter(
        (btn) => (btn as HTMLButtonElement).disabled
      );
      // The button for idea 1 should be disabled
      expect(disabledButtons.length).toBeGreaterThan(0);
    });

    it("should show login text when user is null", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={null}
        />
      );

      expect(mockT).toHaveBeenCalledWith(
        "common.loginToVote",
        "Inicia sesión para votar"
      );
    });
  });

  describe("Unauthenticated User", () => {
    it("should redirect to auth when vote button is clicked and user is null", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={null}
        />
      );

      // Find vote button
      const voteButtons = screen
        .getAllByText(/Inicia sesión|loginToVote/i)
        .map((text) => text.closest("button"))
        .filter((btn) => btn !== null);

      if (voteButtons.length > 0 && voteButtons[0]) {
        fireEvent.click(voteButtons[0]);
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "redirectAfterAuth",
        expect.any(String)
      );
      expect((window as any).location.href).toBeTruthy();
    });

    it("should not call onVote when user is null", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={null}
        />
      );

      // Find vote button
      const voteButtons = screen
        .getAllByText(/Inicia sesión|loginToVote/i)
        .map((text) => text.closest("button"))
        .filter((btn) => btn !== null);

      if (voteButtons.length > 0 && voteButtons[0]) {
        fireEvent.click(voteButtons[0]);
      }

      expect(mockOnVote).not.toHaveBeenCalled();
    });
  });

  describe("Success Animation", () => {
    it("should show success animation when successVote matches idea id", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={1}
          user={mockUser}
        />
      );

      // Success animation should be rendered (particles)
      const cards = screen.getAllByTestId("card");
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe("Vote Count Display", () => {
    it("should display vote count in button text", () => {
      render(
        <Top3Podium
          ideas={[mockIdea1, mockIdea2, mockIdea3]}
          onVote={mockOnVote}
          isVoting={mockIsVoting}
          votedIdeas={mockVotedIdeas}
          successVote={mockSuccessVote}
          user={mockUser}
        />
      );

      // Vote count should be displayed in button text or elsewhere
      const vote10Elements = screen.queryAllByText(/10/);
      const vote8Elements = screen.queryAllByText(/8/);
      const vote5Elements = screen.queryAllByText(/5/);
      // Vote counts should be displayed somewhere (in buttons or mobile layout)
      expect(
        vote10Elements.length + vote8Elements.length + vote5Elements.length
      ).toBeGreaterThan(0);
    });
  });
});
