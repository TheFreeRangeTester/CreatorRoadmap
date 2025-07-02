import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import IdeaCard from "../../components/idea-card";
import type { IdeaResponse } from "@shared/schema";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Heart: () => <div data-testid="heart-icon">♥</div>,
  MoreVertical: () => <div data-testid="more-vertical-icon">⋮</div>,
  Edit: () => <div data-testid="edit-icon">✏</div>,
  Trash2: () => <div data-testid="trash-icon">🗑</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">📈</div>,
  TrendingDown: () => <div data-testid="trending-down-icon">📉</div>,
  Minus: () => <div data-testid="minus-icon">-</div>,
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the use-toast hook
const mockToast = jest.fn();
jest.mock("../../hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Create a wrapper component for tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("IdeaCard Component", () => {
  const mockIdea: IdeaResponse = {
    id: 1,
    title: "Test Idea Title",
    description:
      "This is a test idea description that should be displayed in the card.",
    votes: 42,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    creatorId: 1,
    status: "approved",
    suggestedBy: null,
    position: {
      current: 2,
      previous: 3,
      change: 1,
    },
  };

  const defaultProps = {
    idea: mockIdea,
    onVote: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    isVoting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render idea title and description", () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      expect(screen.getByText("Test Idea Title")).toBeTruthy();
      expect(screen.getByText(/This is a test idea description/)).toBeTruthy();
    });

    it("should display vote count", () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      expect(screen.getByText("42")).toBeTruthy();
    });

    it("should show position change indicator when position changes", () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      expect(screen.getByTestId("trending-up-icon")).toBeTruthy();
      expect(screen.getByText("+1")).toBeTruthy();
    });

    it("should show trending down when position decreases", () => {
      const ideaWithDownTrend = {
        ...mockIdea,
        position: {
          current: 5,
          previous: 3,
          change: -2,
        },
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithDownTrend} />, {
        wrapper: Wrapper,
      });

      expect(screen.getByTestId("trending-down-icon")).toBeTruthy();
      expect(screen.getByText("-2")).toBeTruthy();
    });

    it("should show no change indicator when position is stable", () => {
      const ideaWithNoChange = {
        ...mockIdea,
        position: {
          current: 3,
          previous: 3,
          change: 0,
        },
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithNoChange} />, {
        wrapper: Wrapper,
      });

      expect(screen.getByTestId("minus-icon")).toBeTruthy();
    });

    it("should display position number", () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      expect(screen.getByText("#2")).toBeTruthy();
    });

    it("should show suggested by information when available", () => {
      const suggestedIdea = {
        ...mockIdea,
        suggestedBy: 2,
        suggestedByUsername: "suggester-user",
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={suggestedIdea} />, {
        wrapper: Wrapper,
      });

      expect(screen.getByText(/Sugerido por/)).toBeTruthy();
      expect(screen.getByText("suggester-user")).toBeTruthy();
    });
  });

  describe("Voting Functionality", () => {
    it("should call onVote when vote button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnVote = jest.fn();
      const Wrapper = createWrapper();

      render(<IdeaCard {...defaultProps} onVote={mockOnVote} />, {
        wrapper: Wrapper,
      });

      const voteButton = screen.getByRole("button", { name: /votar/i });
      await user.click(voteButton);

      expect(mockOnVote).toHaveBeenCalledWith(mockIdea.id);
    });

    it("should show voted state when user already voted", () => {
      const Wrapper = createWrapper();
      window.localStorage.setItem("votedIdeas_1", JSON.stringify([1]));
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });
      const voteButton = screen.getByRole("button", { name: /votar/i });
      // Usamos toHaveAttribute en vez de toHaveClass para compatibilidad con la versión de Jest-DOM
      expect(voteButton.getAttribute("class")).toEqual(
        expect.stringContaining("bg-neutral-100")
      );
      window.localStorage.clear();
    });

    it("should disable vote button when isVoting is true", () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} isVoting={true} />, {
        wrapper: Wrapper,
      });

      const voteButton = screen.getByRole("button", { name: /votar/i });
      // Verificamos que el botón esté deshabilitado comprobando el atributo 'disabled'
      expect(voteButton.hasAttribute("disabled")).toBe(true);

      expect(screen.getByText(/votando/i)).toBeTruthy();
    });
  });

  describe("Creator Actions", () => {
    it("should show edit and delete buttons for creator user", () => {
      const Wrapper = createWrapper();
      jest
        .spyOn(require("../../hooks/use-auth"), "useAuth")
        .mockReturnValue({ user: { id: 1 } });
      render(
        <IdeaCard {...defaultProps} onEdit={jest.fn()} onDelete={jest.fn()} />,
        { wrapper: Wrapper }
      );
      // Usamos .toBeTruthy() en vez de .toBeInTheDocument() por compatibilidad con la versión de Jest-DOM
      expect(screen.getByTestId("edit-icon")).toBeTruthy();
      expect(screen.getByTestId("trash-icon")).toBeTruthy();
    });

    it("should call onEdit when edit button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();
      const Wrapper = createWrapper();

      render(<IdeaCard {...defaultProps} onEdit={mockOnEdit} />, {
        wrapper: Wrapper,
      });

      const editButton = screen.getByTestId("edit-icon").closest("button");
      if (editButton) {
        await user.click(editButton);
      }

      expect(mockOnEdit).toHaveBeenCalledWith(mockIdea);
    });

    it("should call onDelete when delete button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn();
      const Wrapper = createWrapper();

      render(<IdeaCard {...defaultProps} onDelete={mockOnDelete} />, {
        wrapper: Wrapper,
      });

      const deleteButton = screen.getByTestId("trash-icon").closest("button");
      if (deleteButton) {
        await user.click(deleteButton);
      }

      expect(mockOnDelete).toHaveBeenCalledWith(mockIdea.id);
    });

    it("should hide actions when showActions is false", () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      expect(screen.queryByTestId("more-vertical-icon")).not.toBeTruthy();
    });
  });

  describe("Date Formatting", () => {
    it("should format and display creation date", () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      // Check that some date is displayed (exact format may vary)
      expect(
        screen.getByText(/15 de enero de 2024|Jan 15, 2024|2024-01-15/)
      ).toBeTruthy();
    });

    it("should handle invalid dates gracefully", () => {
      const ideaWithInvalidDate = {
        ...mockIdea,
        createdAt: new Date("invalid-date"),
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithInvalidDate} />, {
        wrapper: Wrapper,
      });

      // Should still render without crashing
      expect(screen.getByText("Test Idea Title")).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for vote button", () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      const voteButton = screen.getByRole("button", { name: /votar/i });
      // Usamos getAttribute para evitar el error de tipado con toHaveAttribute
      expect(voteButton.getAttribute("aria-label")).toBeTruthy();
    });

    it("debería tener la jerarquía de encabezado adecuada", () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      const heading = screen.getByRole("heading");
      // Usamos getAttribute para evitar el error de tipado con toBeInTheDocument
      expect(heading.getAttribute("id") || heading.textContent).toBeTruthy();
      expect(heading.tagName).toBe("H3"); // Suponiendo que se usa h3

      // Corregimos el nombre de la variable Wrapper (antes era Wrapper, pero arriba se define como 'wrapper')
      // También aseguramos que mockOnVote esté definido antes de usarlo
      const mockOnVote = jest.fn();
      const wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} onVote={mockOnVote} />, {
        wrapper,
      });

      // Tab para el botón de votar y presionar Enter
      // Hacemos la función async y aseguramos que 'user' esté definido
      it("debería activar el voto con tab y enter", async () => {
        const mockOnVote = jest.fn();
        const wrapper = createWrapper();
        render(<IdeaCard {...defaultProps} onVote={mockOnVote} />, {
          wrapper,
        });

        // Importamos userEvent de @testing-library/user-event
        // Si ya está importado arriba, omite esta línea
        // import userEvent from '@testing-library/user-event';
        const user = userEvent.setup();

        // Tabulamos hasta el botón de votar y presionamos Enter
        await user.tab();
        await user.keyboard("{Enter}");

        expect(mockOnVote).toHaveBeenCalled();
      });
    });

    describe("Edge Cases", () => {
      it("should handle very long titles gracefully", () => {
        const ideaWithLongTitle = {
          ...mockIdea,
          title: "A".repeat(200),
        };

        const Wrapper = createWrapper();
        render(<IdeaCard {...defaultProps} idea={ideaWithLongTitle} />, {
          wrapper: Wrapper,
        });

        expect(screen.getByText(ideaWithLongTitle.title)).toBeTruthy();
      });

      it("should handle very long descriptions gracefully", () => {
        const ideaWithLongDescription = {
          ...mockIdea,
          description: "B".repeat(500),
        };

        const Wrapper = createWrapper();
        render(<IdeaCard {...defaultProps} idea={ideaWithLongDescription} />, {
          wrapper: Wrapper,
        });

        expect(
          screen.getByText(ideaWithLongDescription.description)
        ).toBeTruthy();
      });

      it("should handle zero votes", () => {
        const ideaWithZeroVotes = {
          ...mockIdea,
          votes: 0,
        };

        const Wrapper = createWrapper();
        render(<IdeaCard {...defaultProps} idea={ideaWithZeroVotes} />, {
          wrapper: Wrapper,
        });

        expect(screen.getByText("0")).toBeTruthy();
      });

      it("should handle null position gracefully", () => {
        const ideaWithNullPosition = {
          ...mockIdea,
          position: {
            current: null,
            previous: null,
            change: null,
          },
        };

        const Wrapper = createWrapper();
        render(<IdeaCard {...defaultProps} idea={ideaWithNullPosition} />, {
          wrapper: Wrapper,
        });

        // Should still render without position indicators
        expect(screen.getByText("Test Idea Title")).toBeTruthy();
      });

      it("should handle pending status ideas", () => {
        const pendingIdea = {
          ...mockIdea,
          status: "pending" as const,
        };

        const Wrapper = createWrapper();
        render(<IdeaCard {...defaultProps} idea={pendingIdea} />, {
          wrapper: Wrapper,
        });

        expect(screen.getByText(/pendiente/i)).toBeTruthy();
      });
    });
  });
});
