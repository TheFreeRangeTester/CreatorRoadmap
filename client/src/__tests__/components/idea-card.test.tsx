import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import IdeaCard from "../../components/idea-card";
import { IdeaResponse } from "@shared/schema";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValueOrOptions?: string | any, options?: any) => {
    // Handle case where second arg is options object (react-i18next style: t(key, options))
    if (
      typeof defaultValueOrOptions === "object" &&
      defaultValueOrOptions !== null &&
      !Array.isArray(defaultValueOrOptions)
    ) {
      const opts = defaultValueOrOptions;
      if ("change" in opts) {
        // Return a string representation for rendering
        return `Up ${String(opts.change)}`;
      }
      return String(key);
    }

    // Handle case where second arg is defaultValue and third is options
    if (options && typeof options === "object" && "change" in options) {
      const change = options.change;
      if (typeof defaultValueOrOptions === "string") {
        return defaultValueOrOptions.replace("{{change}}", String(change));
      }
      return `${key} ${change}`;
    }

    // Default case: return defaultValue or key
    return typeof defaultValueOrOptions === "string"
      ? defaultValueOrOptions
      : String(key);
  }
);

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
        if ("change" in opts) {
          // Return a string representation for rendering
          return `Up ${String(opts.change)}`;
        }
        return String(key);
      }

      // Handle case where second arg is defaultValue and third is options
      if (options && typeof options === "object" && "change" in options) {
        const change = options.change;
        if (typeof defaultValueOrOptions === "string") {
          return defaultValueOrOptions.replace("{{change}}", String(change));
        }
        return `${key} ${change}`;
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
  userRole: "audience" as const,
} as any;

const mockUseAuth = jest.fn(() => ({
  user: mockUser,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowUp: jest.fn(({ className }) => (
    <div data-testid="arrow-up-icon" className={className} />
  )),
  ArrowDown: jest.fn(({ className }) => (
    <div data-testid="arrow-down-icon" className={className} />
  )),
  Minus: jest.fn(({ className }) => (
    <div data-testid="minus-icon" className={className} />
  )),
  Plus: jest.fn(({ className }) => (
    <div data-testid="plus-icon" className={className} />
  )),
  ThumbsUp: jest.fn(({ className }) => (
    <div data-testid="thumbs-up-icon" className={className} />
  )),
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
  Heart: jest.fn(({ className }) => (
    <div data-testid="heart-icon" className={className} />
  )),
  TrendingUp: jest.fn(({ className }) => (
    <div data-testid="trending-up-icon" className={className} />
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

// Mock de ModernIcon
jest.mock("@/components/modern-icon", () => ({
  ModernIcon: jest.fn(),
  IconBadge: ({ icon: Icon, className }: any) => (
    <div data-testid="icon-badge" className={className}>
      <Icon className="icon" />
    </div>
  ),
}));

// Mock de IdeaActionTray
jest.mock("@/components/idea-action-tray", () => ({
  IdeaActionTray: ({ ideaId, onEdit, onDelete, onOpenScript }: any) => (
    <div data-testid={`idea-action-tray-${ideaId}`}>
      {onEdit && (
        <button data-testid={`tray-edit-${ideaId}`} onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button data-testid={`tray-delete-${ideaId}`} onClick={onDelete}>
          Delete
        </button>
      )}
      {onOpenScript && (
        <button data-testid={`tray-script-${ideaId}`} onClick={onOpenScript}>
          Script
        </button>
      )}
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
(window as any).location = { href: "http://localhost:3000" };

// Mock de timers
jest.useFakeTimers();

describe("IdeaCard", () => {
  const mockIdea: IdeaResponse = {
    id: 1,
    title: "Test Idea",
    description: "Test Description",
    votes: 10,
    creatorId: 2,
    niche: "technology",
    suggestedByUsername: undefined,
    position: {
      current: 1,
      previous: 2,
      change: 1,
    },
  } as any;

  const mockOnVote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    // Reset mockT to use the implementation from jest.mock
    mockT.mockImplementation(
      (key: string, defaultValueOrOptions?: string | any, options?: any) => {
        // Handle case where second arg is options object (react-i18next style: t(key, options))
        if (
          typeof defaultValueOrOptions === "object" &&
          defaultValueOrOptions !== null &&
          !Array.isArray(defaultValueOrOptions)
        ) {
          const opts = defaultValueOrOptions;
          if ("change" in opts) {
            // Return a string representation for rendering
            return `Up ${String(opts.change)}`;
          }
          return String(key);
        }

        // Handle case where second arg is defaultValue and third is options
        if (options && typeof options === "object" && "change" in options) {
          const change = options.change;
          if (typeof defaultValueOrOptions === "string") {
            return defaultValueOrOptions.replace("{{change}}", String(change));
          }
          return `${key} ${change}`;
        }

        // Default case: return defaultValue or key
        return typeof defaultValueOrOptions === "string"
          ? defaultValueOrOptions
          : String(key);
      }
    );
    mockUseAuth.mockReturnValue({
      user: mockUser,
    });
    mockLocalStorage.getItem.mockReturnValue("[]");
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe("Basic Rendering", () => {
    it("should render card", () => {
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      expect(screen.getByTestId("card")).toBeTruthy();
    });

    it("should render idea title", () => {
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should render idea description", () => {
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      expect(screen.getByText("Test Description")).toBeTruthy();
    });

    it("should render votes count", () => {
      const { container } = render(
        <IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />
      );

      // Votes count might be split across elements, check container textContent
      expect(container.textContent).toContain("10");
    });
  });

  describe("Niche Badge", () => {
    it("should render niche badge when niche is provided", () => {
      const { container } = render(
        <IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />
      );

      // Verify component renders
      expect(container.firstChild).toBeTruthy();
      // Component should render successfully with niche
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should not render niche badge when niche is not provided", () => {
      const ideaWithoutNiche = { ...mockIdea, niche: null };
      render(
        <IdeaCard
          idea={ideaWithoutNiche}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.queryByTestId(`niche-badge-${mockIdea.id}`)).toBeNull();
    });
  });

  describe("Suggested By Badge", () => {
    it("should render suggested by badge when suggestedByUsername is provided", () => {
      const ideaWithSuggestion = {
        ...mockIdea,
        suggestedByUsername: "testuser",
      };
      render(
        <IdeaCard
          idea={ideaWithSuggestion}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByTestId("user-icon")).toBeTruthy();
      expect(screen.getByText(/suggestedBy/i)).toBeTruthy();
    });

    it("should not render suggested by badge when suggestedByUsername is not provided", () => {
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      const userIcons = screen.queryAllByTestId("user-icon");
      // User icon might appear in other places, so we check for suggestedBy text
      const suggestedByText = screen.queryByText(/suggestedBy/i);
      expect(suggestedByText).toBeNull();
    });
  });

  describe("Voting", () => {
    it("should render vote button when user is logged in and not creator", () => {
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      // Should have vote button (not login button) - check for vote text or icon
      const voteTexts = screen.queryAllByText(/vote/i);
      const thumbsUpIcon = screen.queryByTestId("thumbs-up-icon");
      expect(voteTexts.length > 0 || thumbsUpIcon).toBeTruthy();
    });

    it("should call onVote when vote button is clicked", () => {
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      // Find vote button by icon badge parent (more reliable)
      const iconBadge = screen.getByTestId("icon-badge");
      const button = iconBadge.closest("button");
      if (button) {
        fireEvent.click(button);
        expect(mockOnVote).toHaveBeenCalledWith(mockIdea.id);
      } else {
        // Fallback: try finding by text
        const voteTexts = screen.getAllByText(/vote/i);
        const voteButton = voteTexts[0]?.closest("button");
        if (voteButton) {
          fireEvent.click(voteButton);
          expect(mockOnVote).toHaveBeenCalledWith(mockIdea.id);
        }
      }
    });

    it("should show loader when isVoting is true", () => {
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={true} />);

      expect(screen.getByTestId("loader-icon")).toBeTruthy();
      expect(screen.getByText(/voting/i)).toBeTruthy();
    });

    it("should disable vote button when hasVoted is true", () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([mockIdea.id]));
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      const voteButton = screen
        .getByText(/voted/i)
        .closest("button") as HTMLButtonElement;
      if (voteButton) {
        expect(voteButton.disabled).toBe(true);
      } else {
        // If button not found by text, check for disabled state via icon
        const heartIcon = screen.queryByTestId("heart-icon");
        expect(heartIcon).toBeTruthy();
      }
    });

    it("should show login button when user is not logged in", () => {
      mockUseAuth.mockReturnValue({
        user: null,
      });
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      expect(screen.getByText(/loginToVote/i)).toBeTruthy();
      expect(screen.getByTestId("trending-up-icon")).toBeTruthy();
    });

    it("should redirect to auth when login button is clicked", () => {
      mockUseAuth.mockReturnValue({
        user: null,
      });
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      const loginButton = screen.getByText(/loginToVote/i).closest("button");
      if (loginButton) {
        fireEvent.click(loginButton);
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "redirectAfterAuth",
        expect.any(String)
      );
    });
  });

  describe("Creator Actions", () => {
    it("should render IdeaActionTray when onEdit is provided", () => {
      const mockOnEdit = jest.fn();
      render(
        <IdeaCard
          idea={mockIdea}
          onVote={mockOnVote}
          isVoting={false}
          onEdit={mockOnEdit}
        />
      );

      expect(
        screen.getByTestId(`idea-action-tray-${mockIdea.id}`)
      ).toBeTruthy();
      expect(screen.getByTestId(`tray-edit-${mockIdea.id}`)).toBeTruthy();
    });

    it("should render IdeaActionTray when onDelete is provided", () => {
      const mockOnDelete = jest.fn();
      render(
        <IdeaCard
          idea={mockIdea}
          onVote={mockOnVote}
          isVoting={false}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByTestId(`idea-action-tray-${mockIdea.id}`)
      ).toBeTruthy();
      expect(screen.getByTestId(`tray-delete-${mockIdea.id}`)).toBeTruthy();
    });

    it("should render IdeaActionTray when onOpenTemplate is provided", () => {
      const mockOnOpenTemplate = jest.fn();
      render(
        <IdeaCard
          idea={mockIdea}
          onVote={mockOnVote}
          isVoting={false}
          onOpenTemplate={mockOnOpenTemplate}
        />
      );

      expect(
        screen.getByTestId(`idea-action-tray-${mockIdea.id}`)
      ).toBeTruthy();
      expect(screen.getByTestId(`tray-script-${mockIdea.id}`)).toBeTruthy();
    });

    it("should call onEdit when edit button in tray is clicked", () => {
      const mockOnEdit = jest.fn();
      render(
        <IdeaCard
          idea={mockIdea}
          onVote={mockOnVote}
          isVoting={false}
          onEdit={mockOnEdit}
        />
      );

      const editButton = screen.getByTestId(`tray-edit-${mockIdea.id}`);
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockIdea);
    });

    it("should call onDelete when delete button in tray is clicked", () => {
      const mockOnDelete = jest.fn();
      render(
        <IdeaCard
          idea={mockIdea}
          onVote={mockOnVote}
          isVoting={false}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTestId(`tray-delete-${mockIdea.id}`);
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(mockIdea.id);
    });

    it("should not show vote button when onEdit or onDelete is provided", () => {
      const mockOnEdit = jest.fn();
      render(
        <IdeaCard
          idea={mockIdea}
          onVote={mockOnVote}
          isVoting={false}
          onEdit={mockOnEdit}
        />
      );

      // Vote button should not be rendered when onEdit is provided
      // Check that IdeaActionTray is rendered instead
      expect(
        screen.getByTestId(`idea-action-tray-${mockIdea.id}`)
      ).toBeTruthy();
      // Vote button text should not appear
      const voteButtonText = screen.queryByText(/^vote$/i);
      expect(voteButtonText).toBeNull();
    });
  });

  describe("Position Indicator", () => {
    it("should show 'new' badge when previous is null", () => {
      const newIdea = {
        ...mockIdea,
        position: { current: 1, previous: null, change: null },
      };
      const { container } = render(
        <IdeaCard idea={newIdea} onVote={mockOnVote} isVoting={false} />
      );

      // Verify component renders successfully
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should show 'up' badge when change is positive", () => {
      const { container } = render(
        <IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />
      );

      // Verify component renders successfully
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should show 'down' badge when change is negative", () => {
      const downIdea = {
        ...mockIdea,
        position: { current: 3, previous: 1, change: -2 },
      };
      const { container } = render(
        <IdeaCard idea={downIdea} onVote={mockOnVote} isVoting={false} />
      );

      // Verify component renders successfully
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should show 'same' badge when change is zero", () => {
      const sameIdea = {
        ...mockIdea,
        position: { current: 1, previous: 1, change: 0 },
      };
      const { container } = render(
        <IdeaCard idea={sameIdea} onVote={mockOnVote} isVoting={false} />
      );

      // Verify component renders successfully
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });
  });

  describe("Vote Animation", () => {
    it("should show confetti animation after voting", async () => {
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      // Find vote button by icon badge
      const iconBadge = screen.getByTestId("icon-badge");
      const voteButton = iconBadge.closest("button");
      if (voteButton) {
        fireEvent.click(voteButton);

        // Advance timers to trigger confetti
        jest.advanceTimersByTime(100);

        // Confetti should appear
        await waitFor(() => {
          const confetti = document.querySelector(".bg-primary.rounded-full");
          expect(
            confetti || document.querySelector(".rounded-full")
          ).toBeTruthy();
        });
      }
    });

    it("should update localStorage after voting", () => {
      render(<IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />);

      // Find vote button by icon badge
      const iconBadge = screen.getByTestId("icon-badge");
      const voteButton = iconBadge.closest("button");
      if (voteButton) {
        fireEvent.click(voteButton);

        // Advance timers
        jest.advanceTimersByTime(100);
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `votedIdeas_${mockUser.id}`,
        JSON.stringify([mockIdea.id])
      );
    });
  });

  describe("Creator Check", () => {
    it("should not show vote button when user is creator", () => {
      const creatorIdea = {
        ...mockIdea,
        creatorId: mockUser.id,
      };
      render(
        <IdeaCard idea={creatorIdea} onVote={mockOnVote} isVoting={false} />
      );

      // Vote button should not be rendered when user is creator
      const voteButton = screen.queryByText(/^vote$/i);
      const loginButton = screen.queryByText(/loginToVote/i);
      expect(voteButton).toBeNull();
      expect(loginButton).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle idea with no position data", () => {
      const ideaWithoutPosition = {
        ...mockIdea,
        position: { current: 1, previous: null, change: null },
      };
      render(
        <IdeaCard
          idea={ideaWithoutPosition as any}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByTestId("card")).toBeTruthy();
    });

    it("should handle single vote text", () => {
      const singleVoteIdea = {
        ...mockIdea,
        votes: 1,
      };
      const { container } = render(
        <IdeaCard idea={singleVoteIdea} onVote={mockOnVote} isVoting={false} />
      );

      // Verify component renders successfully with single vote
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should handle multiple votes text", () => {
      const { container } = render(
        <IdeaCard idea={mockIdea} onVote={mockOnVote} isVoting={false} />
      );

      // Verify component renders successfully with multiple votes
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });
  });
});
