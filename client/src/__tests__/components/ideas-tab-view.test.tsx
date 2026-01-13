import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

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
  userRole: "creator" as const,
} as any;

const mockUseAuth = jest.fn(() => ({
  user: mockUser,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de useToast
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de useQuery
const mockRefetchIdeas = jest.fn();
const mockRefetchPending = jest.fn();
const mockUseQuery = jest.fn((config: any) => {
  if (config.queryKey[0] === "/api/ideas") {
    return {
      data: [],
      isLoading: false,
      isError: false,
      refetch: mockRefetchIdeas,
    } as any;
  }
  if (config.queryKey[0] === "/api/pending-ideas") {
    return {
      data: [],
      isLoading: false,
      isError: false,
      refetch: mockRefetchPending,
    } as any;
  }
  if (config.queryKey[0] === "/api/ideas/priority") {
    return {
      data: { ideas: [], priorityWeight: 0.5 },
      isLoading: false,
    } as any;
  }
  return {
    data: null,
    isLoading: false,
    isError: false,
  } as any;
});

jest.mock("@tanstack/react-query", () => ({
  useQuery: (config: any) => mockUseQuery(config),
  useMutation: jest.fn((config: any) => ({
    mutate: jest.fn((ideaId: number) => {
      if (config.mutationFn) {
        config.mutationFn(ideaId);
      }
    }),
    isPending: false,
  })),
}));

// Mock de queryClient - debe estar antes del import del componente
jest.mock("@/lib/queryClient", () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
  apiRequest: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({}),
    } as any)
  ),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
  CheckCircle: jest.fn(({ className }) => (
    <div data-testid="check-circle-icon" className={className} />
  )),
  XCircle: jest.fn(({ className }) => (
    <div data-testid="x-circle-icon" className={className} />
  )),
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
  Clock: jest.fn(({ className }) => (
    <div data-testid="clock-icon" className={className} />
  )),
  ArrowUpDown: jest.fn(({ className }) => (
    <div data-testid="arrow-up-down-icon" className={className} />
  )),
  TrendingUp: jest.fn(({ className }) => (
    <div data-testid="trending-up-icon" className={className} />
  )),
  Heart: jest.fn(({ className }) => (
    <div data-testid="heart-icon" className={className} />
  )),
  Lightbulb: jest.fn(({ className }) => (
    <div data-testid="lightbulb-icon" className={className} />
  )),
  Plus: jest.fn(({ className }) => (
    <div data-testid="plus-icon" className={className} />
  )),
  MessageSquare: jest.fn(({ className }) => (
    <div data-testid="message-square-icon" className={className} />
  )),
}));

// Mock de IdeaCard
jest.mock("@/components/idea-card", () => ({
  __esModule: true,
  default: ({ idea }: any) => (
    <div data-testid={`idea-card-${idea.id}`}>{idea.title}</div>
  ),
}));

// Mock de IdeaListView
jest.mock("@/components/idea-list-view", () => ({
  __esModule: true,
  default: ({ idea }: any) => (
    <div data-testid={`idea-list-view-${idea.id}`}>{idea.title}</div>
  ),
}));

// Mock de IdeaForm
jest.mock("@/components/idea-form", () => ({
  __esModule: true,
  default: ({ isOpen, idea, onClose }: any) =>
    isOpen ? (
      <div data-testid="idea-form">
        {idea ? `Editing ${idea.title}` : "New Idea"}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    "data-testid": testId,
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={testId}
    >
      {children}
    </button>
  ),
}));

// Mock de Badge component
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

// Mock de hasActivePremiumAccess - debe estar antes del import del componente
jest.mock("@shared/premium-utils", () => ({
  hasActivePremiumAccess: jest.fn(() => false),
}));

// Mock de window.confirm
window.confirm = jest.fn(() => true);

// Import después de los mocks
import { IdeasTabView } from "../../components/ideas-tab-view";
import { IdeaResponse } from "@shared/schema";

describe("IdeasTabView", () => {
  const mockIdeas: IdeaResponse[] = [
    {
      id: 1,
      title: "Test Idea 1",
      description: "Test Description 1",
      votes: 10,
      creatorId: 1,
      status: "approved",
      niche: "technology",
      position: {
        current: 1,
        previous: 2,
        change: 1,
      },
    } as IdeaResponse,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockUseAuth.mockReturnValue({
      user: mockUser,
    });
    mockUseQuery.mockImplementation((config: any) => {
      if (config.queryKey[0] === "/api/ideas") {
        return {
          data: mockIdeas,
          isLoading: false,
          isError: false,
          refetch: mockRefetchIdeas,
        } as any;
      }
      if (config.queryKey[0] === "/api/pending-ideas") {
        return {
          data: [],
          isLoading: false,
          isError: false,
          refetch: mockRefetchPending,
        } as any;
      }
      if (config.queryKey[0] === "/api/ideas/priority") {
        return {
          data: { ideas: [], priorityWeight: 0.5 },
          isLoading: false,
        } as any;
      }
      return {
        data: null,
        isLoading: false,
        isError: false,
      } as any;
    });
  });

  describe("Basic Rendering", () => {
    it("should render loading state", () => {
      mockUseQuery.mockImplementation((config: any) => {
        if (config.queryKey[0] === "/api/ideas") {
          return {
            data: null,
            isLoading: true,
            isError: false,
            refetch: mockRefetchIdeas,
          } as any;
        }
        return {
          data: null,
          isLoading: false,
          isError: false,
        } as any;
      });

      render(<IdeasTabView mode="published" />);

      expect(screen.getByTestId("loader-icon")).toBeTruthy();
    });

    it("should render error state", () => {
      mockUseQuery.mockImplementation((config: any) => {
        if (config.queryKey[0] === "/api/ideas") {
          return {
            data: null,
            isLoading: false,
            isError: true,
            refetch: mockRefetchIdeas,
          } as any;
        }
        return {
          data: null,
          isLoading: false,
          isError: false,
        } as any;
      });

      render(<IdeasTabView mode="published" />);

      expect(mockT).toHaveBeenCalledWith("ideas.loadError");
    });

    it("should render empty state when no ideas", () => {
      mockUseQuery.mockImplementation((config: any) => {
        if (config.queryKey[0] === "/api/ideas") {
          return {
            data: [],
            isLoading: false,
            isError: false,
            refetch: mockRefetchIdeas,
          } as any;
        }
        return {
          data: null,
          isLoading: false,
          isError: false,
        } as any;
      });

      render(<IdeasTabView mode="published" />);

      expect(mockT).toHaveBeenCalledWith("ideas.noPublishedIdeas");
    });

    it("should render ideas when data is available", () => {
      render(<IdeasTabView mode="published" />);

      expect(screen.getByTestId("idea-list-view-1")).toBeTruthy();
      expect(screen.getByText("Test Idea 1")).toBeTruthy();
    });
  });

  describe("Published Mode", () => {
    it("should render filter controls for creators", () => {
      render(<IdeasTabView mode="published" />);

      expect(mockT).toHaveBeenCalledWith("ideas.showActive");
      expect(mockT).toHaveBeenCalledWith("ideas.showCompleted");
    });

    it("should render create idea button in empty state for creators", () => {
      mockUseQuery.mockImplementation((config: any) => {
        if (config.queryKey[0] === "/api/ideas") {
          return {
            data: [],
            isLoading: false,
            isError: false,
            refetch: mockRefetchIdeas,
          } as any;
        }
        return {
          data: null,
          isLoading: false,
          isError: false,
        } as any;
      });

      render(<IdeasTabView mode="published" />);

      expect(screen.getByTestId("empty-state-create-idea")).toBeTruthy();
    });
  });

  describe("Suggested Mode", () => {
    it("should render pending ideas", () => {
      const pendingIdeas: IdeaResponse[] = [
        {
          id: 2,
          title: "Pending Idea",
          description: "Pending Description",
          votes: 0,
          creatorId: 2,
          status: "pending",
          suggestedByUsername: "testuser",
        } as IdeaResponse,
      ];

      mockUseQuery.mockImplementation((config: any) => {
        if (config.queryKey[0] === "/api/pending-ideas") {
          return {
            data: pendingIdeas,
            isLoading: false,
            isError: false,
            refetch: mockRefetchPending,
          } as any;
        }
        return {
          data: null,
          isLoading: false,
          isError: false,
        } as any;
      });

      render(<IdeasTabView mode="suggested" />);

      expect(screen.getByText("Pending Idea")).toBeTruthy();
    });

    it("should render empty state for suggested mode", () => {
      mockUseQuery.mockImplementation((config: any) => {
        if (config.queryKey[0] === "/api/pending-ideas") {
          return {
            data: [],
            isLoading: false,
            isError: false,
            refetch: mockRefetchPending,
          } as any;
        }
        return {
          data: null,
          isLoading: false,
          isError: false,
        } as any;
      });

      render(<IdeasTabView mode="suggested" />);

      expect(mockT).toHaveBeenCalledWith("ideas.noSuggestedIdeas");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null user", () => {
      mockUseAuth.mockReturnValue({
        user: null,
      });

      render(<IdeasTabView mode="published" />);

      expect(screen.getByTestId("idea-list-view-1")).toBeTruthy();
    });

    it("should handle audience user role", () => {
      const audienceUser = {
        ...mockUser,
        userRole: "audience" as const,
      };
      mockUseAuth.mockReturnValue({
        user: audienceUser,
      });

      render(<IdeasTabView mode="published" />);

      expect(screen.getByTestId("idea-list-view-1")).toBeTruthy();
    });
  });
});
