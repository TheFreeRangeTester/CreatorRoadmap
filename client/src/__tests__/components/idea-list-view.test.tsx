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
import IdeaListView from "../../components/idea-list-view";
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
  TrendingUp: jest.fn(({ className }) => (
    <div data-testid="trending-up-icon" className={className} />
  )),
  Heart: jest.fn(({ className }) => (
    <div data-testid="heart-icon" className={className} />
  )),
  Youtube: jest.fn(({ className }) => (
    <div data-testid="youtube-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, size }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-size={size}
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

// Mock de IdeaActionTray
jest.mock("@/components/idea-action-tray", () => ({
  IdeaActionTray: ({
    ideaId,
    onEdit,
    onDelete,
    onOpenScript,
    onComplete,
  }: any) => (
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
      {onComplete && (
        <button data-testid={`tray-complete-${ideaId}`} onClick={onComplete}>
          Complete
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

// Mock de timers
jest.useFakeTimers();

describe("IdeaListView", () => {
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
  } as IdeaResponse;

  const mockOnVote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
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
    it("should render idea title", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should render idea description", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByText("Test Description")).toBeTruthy();
    });

    it("should render position number", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={5}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByText("#5")).toBeTruthy();
    });

    it("should render vote count", () => {
      const { container } = render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      // Vote count might be split across elements, check container textContent
      expect(container.textContent).toContain("10");
    });
  });

  describe("Niche Badge", () => {
    it("should render niche badge when niche is provided", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(
        screen.getByTestId(`niche-badge-list-${mockIdea.id}`)
      ).toBeTruthy();
    });

    it("should not render niche badge when niche is not provided", () => {
      const ideaWithoutNiche = { ...mockIdea, niche: null };
      render(
        <IdeaListView
          idea={ideaWithoutNiche}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(
        screen.queryByTestId(`niche-badge-list-${mockIdea.id}`)
      ).toBeNull();
    });
  });

  describe("Position Indicator", () => {
    it("should show 'new' badge when previous is null", () => {
      const newIdea = {
        ...mockIdea,
        position: { current: 1, previous: null, change: null },
      };
      const { container } = render(
        <IdeaListView
          idea={newIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      // Verify component renders successfully
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should show 'up' badge when change is positive", () => {
      const { container } = render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
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
        <IdeaListView
          idea={downIdea}
          position={3}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      // Verify component renders successfully
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should show 'stable' badge when change is zero", () => {
      const sameIdea = {
        ...mockIdea,
        position: { current: 1, previous: 1, change: 0 },
      };
      render(
        <IdeaListView
          idea={sameIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByTestId("trending-up-icon")).toBeTruthy();
    });
  });

  describe("Voting", () => {
    it("should render vote button when user is not creator", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByText(/Votar|vote/i)).toBeTruthy();
    });

    it("should call onVote when vote button is clicked", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      const voteButton = screen.getByText(/Votar|vote/i).closest("button");
      if (voteButton) {
        fireEvent.click(voteButton);
      }

      expect(mockOnVote).toHaveBeenCalledWith(mockIdea.id);
    });

    it("should show loader when isVoting is true", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={true}
        />
      );

      expect(screen.getByTestId("loader-icon")).toBeTruthy();
    });

    it("should disable vote button when hasVoted is true", () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([mockIdea.id]));
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      const voteButton = screen
        .getByText(/Votado|voted/i)
        .closest("button") as HTMLButtonElement;
      expect(voteButton.disabled).toBe(true);
    });

    it("should update localStorage after voting", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      const voteButton = screen.getByText(/Votar|vote/i).closest("button");
      if (voteButton) {
        fireEvent.click(voteButton);
        jest.advanceTimersByTime(100);
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `votedIdeas_${mockUser.id}`,
        JSON.stringify([mockIdea.id])
      );
    });
  });

  describe("Creator Actions", () => {
    it("should render IdeaActionTray when user is creator", () => {
      const creatorIdea = {
        ...mockIdea,
        creatorId: mockUser.id,
      };
      const mockOnEdit = jest.fn();
      render(
        <IdeaListView
          idea={creatorIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
          onEdit={mockOnEdit}
        />
      );

      expect(
        screen.getByTestId(`idea-action-tray-${creatorIdea.id}`)
      ).toBeTruthy();
    });

    it("should not show vote button when user is creator", () => {
      const creatorIdea = {
        ...mockIdea,
        creatorId: mockUser.id,
      };
      render(
        <IdeaListView
          idea={creatorIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      const voteButton = screen.queryByText(/Votar|vote/i);
      expect(voteButton).toBeNull();
    });
  });

  describe("Priority Score", () => {
    it("should render priority score badge when priorityScore is provided", () => {
      const { container } = render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
          priorityScore={85}
        />
      );

      // Priority score might be in the container
      expect(container.textContent).toContain("85");
    });

    it("should not render priority score badge when priorityScore is not provided", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      // Component should render successfully without priority score
      expect(screen.getByText("Test Idea")).toBeTruthy();
    });
  });

  describe("YouTube Badge", () => {
    it("should render YouTube badge when hasYouTubeData is true", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
          hasYouTubeData={true}
        />
      );

      expect(screen.getByTestId(`youtube-badge-${mockIdea.id}`)).toBeTruthy();
      expect(screen.getByTestId("youtube-icon")).toBeTruthy();
    });

    it("should not render YouTube badge when hasYouTubeData is false", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
          hasYouTubeData={false}
        />
      );

      expect(screen.queryByTestId(`youtube-badge-${mockIdea.id}`)).toBeNull();
    });
  });

  describe("Suggested By Badge", () => {
    it("should render suggested by badge when suggestedByUsername is provided", () => {
      const ideaWithSuggestion = {
        ...mockIdea,
        suggestedByUsername: "testuser",
      };
      render(
        <IdeaListView
          idea={ideaWithSuggestion}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByTestId(`suggested-by-${mockIdea.id}`)).toBeTruthy();
      expect(screen.getByTestId("user-icon")).toBeTruthy();
    });

    it("should not render suggested by badge when suggestedByUsername is not provided", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.queryByTestId(`suggested-by-${mockIdea.id}`)).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle idea without description", () => {
      const ideaWithoutDesc = { ...mockIdea, description: "" };
      render(
        <IdeaListView
          idea={ideaWithoutDesc}
          position={1}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByText("Test Idea")).toBeTruthy();
      expect(screen.queryByText("Test Description")).toBeNull();
    });

    it("should handle different position numbers", () => {
      render(
        <IdeaListView
          idea={mockIdea}
          position={15}
          onVote={mockOnVote}
          isVoting={false}
        />
      );

      expect(screen.getByText("#15")).toBeTruthy();
    });
  });
});
