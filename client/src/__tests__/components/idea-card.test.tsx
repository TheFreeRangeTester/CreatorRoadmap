import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IdeaCard from '../../components/idea-card';
import type { IdeaResponse } from '../../../shared/schema';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon">♥</div>,
  MoreVertical: () => <div data-testid="more-vertical-icon">⋮</div>,
  Edit: () => <div data-testid="edit-icon">✏</div>,
  Trash2: () => <div data-testid="trash-icon">🗑</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">📈</div>,
  TrendingDown: () => <div data-testid="trending-down-icon">📉</div>,
  Minus: () => <div data-testid="minus-icon">-</div>,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the use-toast hook
const mockToast = jest.fn();
jest.mock('../../hooks/use-toast', () => ({
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
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('IdeaCard Component', () => {
  const mockIdea: IdeaResponse = {
    id: 1,
    title: 'Test Idea Title',
    description: 'This is a test idea description that should be displayed in the card.',
    votes: 42,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    creatorId: 1,
    status: 'approved',
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
    hasVoted: false,
    isCreator: false,
    isVoting: false,
    showActions: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render idea title and description', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      expect(screen.getByText('Test Idea Title')).toBeInTheDocument();
      expect(screen.getByText(/This is a test idea description/)).toBeInTheDocument();
    });

    it('should display vote count', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should show position change indicator when position changes', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('should show trending down when position decreases', () => {
      const ideaWithDownTrend = {
        ...mockIdea,
        position: {
          current: 5,
          previous: 3,
          change: -2,
        },
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithDownTrend} />, { wrapper: Wrapper });

      expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
      expect(screen.getByText('-2')).toBeInTheDocument();
    });

    it('should show no change indicator when position is stable', () => {
      const ideaWithNoChange = {
        ...mockIdea,
        position: {
          current: 3,
          previous: 3,
          change: 0,
        },
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithNoChange} />, { wrapper: Wrapper });

      expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
    });

    it('should display position number', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      expect(screen.getByText('#2')).toBeInTheDocument();
    });

    it('should show suggested by information when available', () => {
      const suggestedIdea = {
        ...mockIdea,
        suggestedBy: 2,
        suggestedByUsername: 'suggester-user',
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={suggestedIdea} />, { wrapper: Wrapper });

      expect(screen.getByText(/Sugerido por/)).toBeInTheDocument();
      expect(screen.getByText('suggester-user')).toBeInTheDocument();
    });
  });

  describe('Voting Functionality', () => {
    it('should call onVote when vote button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnVote = jest.fn();
      const Wrapper = createWrapper();

      render(<IdeaCard {...defaultProps} onVote={mockOnVote} />, { wrapper: Wrapper });

      const voteButton = screen.getByRole('button', { name: /votar/i });
      await user.click(voteButton);

      expect(mockOnVote).toHaveBeenCalledWith(mockIdea.id);
    });

    it('should show voted state when hasVoted is true', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} hasVoted={true} />, { wrapper: Wrapper });

      const voteButton = screen.getByRole('button', { name: /votar/i });
      expect(voteButton).toHaveClass('bg-red-500'); // Assuming voted state has red background
    });

    it('should disable vote button when isVoting is true', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} isVoting={true} />, { wrapper: Wrapper });

      const voteButton = screen.getByRole('button', { name: /votar/i });
      expect(voteButton).toBeDisabled();
    });

    it('should show loading state when voting', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} isVoting={true} />, { wrapper: Wrapper });

      expect(screen.getByText(/votando/i)).toBeInTheDocument();
    });
  });

  describe('Creator Actions', () => {
    it('should show edit and delete buttons for creators', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} isCreator={true} />, { wrapper: Wrapper });

      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    });

    it('should not show action buttons for non-creators', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} isCreator={false} />, { wrapper: Wrapper });

      expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();
      const Wrapper = createWrapper();

      render(<IdeaCard {...defaultProps} isCreator={true} onEdit={mockOnEdit} />, { wrapper: Wrapper });

      const editButton = screen.getByTestId('edit-icon').closest('button');
      if (editButton) {
        await user.click(editButton);
      }

      expect(mockOnEdit).toHaveBeenCalledWith(mockIdea);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn();
      const Wrapper = createWrapper();

      render(<IdeaCard {...defaultProps} isCreator={true} onDelete={mockOnDelete} />, { wrapper: Wrapper });

      const deleteButton = screen.getByTestId('trash-icon').closest('button');
      if (deleteButton) {
        await user.click(deleteButton);
      }

      expect(mockOnDelete).toHaveBeenCalledWith(mockIdea.id);
    });

    it('should hide actions when showActions is false', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} showActions={false} isCreator={true} />, { wrapper: Wrapper });

      expect(screen.queryByTestId('more-vertical-icon')).not.toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format and display creation date', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      // Check that some date is displayed (exact format may vary)
      expect(screen.getByText(/15 de enero de 2024|Jan 15, 2024|2024-01-15/)).toBeInTheDocument();
    });

    it('should handle invalid dates gracefully', () => {
      const ideaWithInvalidDate = {
        ...mockIdea,
        createdAt: new Date('invalid-date'),
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithInvalidDate} />, { wrapper: Wrapper });

      // Should still render without crashing
      expect(screen.getByText('Test Idea Title')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for vote button', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      const voteButton = screen.getByRole('button', { name: /votar/i });
      expect(voteButton).toHaveAttribute('aria-label');
    });

    it('should have proper heading hierarchy', () => {
      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} />, { wrapper: Wrapper });

      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H3'); // Assuming h3 is used
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const mockOnVote = jest.fn();
      const Wrapper = createWrapper();

      render(<IdeaCard {...defaultProps} onVote={mockOnVote} />, { wrapper: Wrapper });

      // Tab to vote button and press Enter
      await user.tab();
      await user.keyboard('{Enter}');

      expect(mockOnVote).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long titles gracefully', () => {
      const ideaWithLongTitle = {
        ...mockIdea,
        title: 'A'.repeat(200),
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithLongTitle} />, { wrapper: Wrapper });

      expect(screen.getByText(ideaWithLongTitle.title)).toBeInTheDocument();
    });

    it('should handle very long descriptions gracefully', () => {
      const ideaWithLongDescription = {
        ...mockIdea,
        description: 'B'.repeat(500),
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithLongDescription} />, { wrapper: Wrapper });

      expect(screen.getByText(ideaWithLongDescription.description)).toBeInTheDocument();
    });

    it('should handle zero votes', () => {
      const ideaWithZeroVotes = {
        ...mockIdea,
        votes: 0,
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithZeroVotes} />, { wrapper: Wrapper });

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle null position gracefully', () => {
      const ideaWithNullPosition = {
        ...mockIdea,
        position: {
          current: null,
          previous: null,
          change: null,
        },
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={ideaWithNullPosition} />, { wrapper: Wrapper });

      // Should still render without position indicators
      expect(screen.getByText('Test Idea Title')).toBeInTheDocument();
    });

    it('should handle pending status ideas', () => {
      const pendingIdea = {
        ...mockIdea,
        status: 'pending' as const,
      };

      const Wrapper = createWrapper();
      render(<IdeaCard {...defaultProps} idea={pendingIdea} />, { wrapper: Wrapper });

      expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
    });
  });
});