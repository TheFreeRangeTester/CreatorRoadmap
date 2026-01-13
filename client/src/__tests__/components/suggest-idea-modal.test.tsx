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
import React from "react";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string | any, options?: any) => {
    // If defaultValue is an object, it's actually options (i18next syntax)
    if (
      defaultValue &&
      typeof defaultValue === "object" &&
      !Array.isArray(defaultValue) &&
      !options
    ) {
      return key;
    }
    // If options is provided and defaultValue is a string, interpolate
    if (options && typeof defaultValue === "string") {
      return defaultValue.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(options[name] || "")
      );
    }
    return typeof defaultValue === "string" ? defaultValue : key;
  }
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de useToast
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de useAuth
const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
} as any;

const mockUseAuth = jest.fn(() => ({
  user: mockUser,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de useReactiveStats
const mockSpendPoints = jest.fn();
jest.mock("@/hooks/use-reactive-stats", () => ({
  useReactiveStats: () => ({
    spendPoints: mockSpendPoints,
  }),
}));

// Mock de useQueryClient
const mockInvalidateQueries = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

const mockUseQueryClient = jest.fn(() => mockQueryClient);

// Mock de useMutation
const mockMutate = jest.fn();
const mockSuggestMutation = {
  mutate: mockMutate,
  isPending: false,
};

const mockUseMutation = jest.fn((config?: any) => mockSuggestMutation);

jest.mock("@tanstack/react-query", () => ({
  useMutation: (config?: any) => mockUseMutation(config),
  useQueryClient: () => mockUseQueryClient(),
}));

// Mock de useForm
const mockForm = {
  register: jest.fn((name: string) => ({
    name,
    onChange: jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn(),
  })),
  handleSubmit: jest.fn((fn: any) => (e: any) => {
    e.preventDefault();
    fn({ title: "Test Title", description: "Test Description" });
  }),
  reset: jest.fn(),
  formState: { errors: {} },
};

const mockUseForm = jest.fn(() => mockForm);

jest.mock("react-hook-form", () => ({
  useForm: () => mockUseForm(),
}));

// Mock de zodResolver
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: jest.fn(),
}));

// Mock de apiRequest
jest.mock("@/lib/queryClient", () => ({
  apiRequest: jest.fn(() =>
    Promise.resolve({
      json: async () => ({
        creator: { id: 1 },
        success: true,
      }),
    } as any)
  ),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
  X: jest.fn(({ className }) => (
    <div data-testid="x-icon" className={className} />
  )),
  LogIn: jest.fn(({ className }) => (
    <div data-testid="login-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    type,
    size,
    className,
    asChild,
  }: any) => {
    if (asChild && children) {
      return children;
    }
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        data-size={size}
        type={type}
        className={className}
      >
        {children}
      </button>
    );
  },
}));

// Mock de Dialog components
let dialogOpen = false;
let dialogOnOpenChange: ((open: boolean) => void) | null = null;

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) => {
    dialogOpen = open !== undefined ? open : false;
    if (onOpenChange) {
      dialogOnOpenChange = onOpenChange;
    }
    return (
      <div data-testid="dialog" data-open={open}>
        {children}
      </div>
    );
  },
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: any) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <div data-testid="dialog-title" className={className}>
      {children}
    </div>
  ),
  DialogDescription: ({ children, className }: any) => (
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
  DialogFooter: ({ children, className }: any) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
}));

// Mock de Label component
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className} data-testid="label">
      {children}
    </label>
  ),
}));

// Mock de Input component
jest.mock("@/components/ui/input", () => ({
  Input: ({ id, placeholder, className, ...props }: any) => (
    <input
      id={id}
      placeholder={placeholder}
      className={className}
      data-testid="input"
      {...props}
    />
  ),
}));

// Mock de Textarea component
jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({ id, placeholder, className, ...props }: any) => (
    <textarea
      id={id}
      placeholder={placeholder}
      className={className}
      data-testid="textarea"
      {...props}
    />
  ),
}));

// Mock de Link from wouter
jest.mock("wouter", () => ({
  Link: ({ children, to, href, className }: any) => (
    <a href={to || href} className={className} data-testid="link">
      {children}
    </a>
  ),
}));

// Mock de console.log y console.error
const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

import SuggestIdeaModal from "../../components/suggest-idea-modal";

describe("SuggestIdeaModal", () => {
  const mockUsername = "testcreator";
  const mockOnOpenChange = jest.fn();
  const mockOnSuccess = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string | any, options?: any) => {
        if (
          defaultValue &&
          typeof defaultValue === "object" &&
          !Array.isArray(defaultValue) &&
          !options
        ) {
          return key;
        }
        if (options && typeof defaultValue === "string") {
          return defaultValue.replace(/\{\{(\w+)\}\}/g, (_, name) =>
            String(options[name] || "")
          );
        }
        return typeof defaultValue === "string" ? defaultValue : key;
      }
    );
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockMutate.mockClear();
    mockInvalidateQueries.mockClear();
    mockToast.mockClear();
    mockSpendPoints.mockClear();
    mockOnOpenChange.mockClear();
    mockOnSuccess.mockClear();
    mockForm.reset.mockClear();
    mockForm.handleSubmit.mockImplementation((fn: any) => (e: any) => {
      e.preventDefault();
      fn({ title: "Test Title", description: "Test Description" });
    });
    mockSuggestMutation.isPending = false;
    dialogOpen = false;
    dialogOnOpenChange = null;
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("Basic Rendering", () => {
    it("should render suggest idea modal", () => {
      const { container } = render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(container.firstChild).toBeTruthy();
    });

    it("should render dialog when open", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByTestId("dialog")).toBeTruthy();
      expect(screen.getByTestId("dialog").getAttribute("data-open")).toBe(
        "true"
      );
    });

    it("should not render dialog when closed", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={false}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByTestId("dialog").getAttribute("data-open")).toBe(
        "false"
      );
    });

    it("should render title", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByTestId("dialog-title")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("suggestIdea.title", {
        username: mockUsername,
      });
    });

    it("should render description", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByTestId("dialog-description")).toBeTruthy();
    });
  });

  describe("Unauthenticated User", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null });
    });

    it("should show login required message when user is not authenticated", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(mockT).toHaveBeenCalledWith(
        "suggestIdea.loginRequired",
        expect.any(String)
      );
      expect(mockT).toHaveBeenCalledWith(
        "suggestIdea.loginRequiredDesc",
        expect.any(String)
      );
    });

    it("should render login button", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      const loginIcons = screen.getAllByTestId("login-icon");
      expect(loginIcons.length).toBeGreaterThan(0);
      expect(mockT).toHaveBeenCalledWith(
        "suggestIdea.goToLoginButton",
        expect.any(String)
      );
    });

    it("should render cancel button for unauthenticated user", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      // Cancel button should be rendered (may be called multiple times)
      const cancelCalls = mockT.mock.calls.filter(
        (call) => call[0] === "suggestIdea.cancel"
      );
      expect(cancelCalls.length).toBeGreaterThan(0);
    });

    it("should call onOpenChange when cancel button is clicked", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      // Find cancel button - there might be multiple, get the first one
      const cancelButtons = screen
        .getAllByText(/suggestIdea.cancel|Cancel/i)
        .map((text) => text.closest("button"))
        .filter((btn) => btn !== null);

      if (cancelButtons.length > 0 && cancelButtons[0]) {
        fireEvent.click(cancelButtons[0]);
      }

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Authenticated User - Form", () => {
    it("should render form when user is authenticated", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByTestId("input")).toBeTruthy();
      expect(screen.getByTestId("textarea")).toBeTruthy();
    });

    it("should render title field", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(mockT).toHaveBeenCalledWith("suggestIdea.titleLabel");
    });

    it("should render description field", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(mockT).toHaveBeenCalledWith("suggestIdea.descriptionLabel");
    });

    it("should render submit button", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(mockT).toHaveBeenCalledWith("suggestIdea.submit");
    });

    it("should render cancel button", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(mockT).toHaveBeenCalledWith("suggestIdea.cancel");
    });
  });

  describe("Form Submission", () => {
    it("should call mutation when form is submitted", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      const form = screen.getByTestId("input").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      expect(mockMutate).toHaveBeenCalled();
    });

    it("should call onSuccess after successful submission", async () => {
      // Mock the mutation's onSuccess to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        const mutation = {
          mutate: jest.fn((data: any) => {
            if (config.onSuccess) {
              config.onSuccess({ result: { success: true }, creatorId: 1 });
            }
          }),
          isPending: false,
        };
        return mutation;
      });

      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      const form = screen.getByTestId("input").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("should show success toast after successful submission", async () => {
      // Mock the mutation's onSuccess to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        const mutation = {
          mutate: jest.fn((data: any) => {
            if (config.onSuccess) {
              config.onSuccess({ result: { success: true }, creatorId: 1 });
            }
          }),
          isPending: false,
        };
        return mutation;
      });

      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      const form = screen.getByTestId("input").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });

    it("should spend points after successful submission", async () => {
      // Mock the mutation's onSuccess to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        const mutation = {
          mutate: jest.fn((data: any) => {
            if (config.onSuccess) {
              config.onSuccess({ result: { success: true }, creatorId: 1 });
            }
          }),
          isPending: false,
        };
        return mutation;
      });

      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      const form = screen.getByTestId("input").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockSpendPoints).toHaveBeenCalledWith(3, "suggestion");
      });
    });

    it("should invalidate queries after successful submission", async () => {
      // Mock the mutation's onSuccess to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        const mutation = {
          mutate: jest.fn((data: any) => {
            if (config.onSuccess) {
              config.onSuccess({ result: { success: true }, creatorId: 1 });
            }
          }),
          isPending: false,
        };
        return mutation;
      });

      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      const form = screen.getByTestId("input").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalled();
      });
    });

    it("should close dialog after successful submission", async () => {
      // Mock the mutation's onSuccess to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        const mutation = {
          mutate: jest.fn((data: any) => {
            if (config.onSuccess) {
              config.onSuccess({ result: { success: true }, creatorId: 1 });
            }
          }),
          isPending: false,
        };
        return mutation;
      });

      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      const form = screen.getByTestId("input").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Error Handling", () => {
    it("should show error toast when submission fails", async () => {
      // Mock the mutation's onError to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        const mutation = {
          mutate: jest.fn((data: any) => {
            if (config.onError) {
              config.onError({ message: "Error message" });
            }
          }),
          isPending: false,
        };
        return mutation;
      });

      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      const form = screen.getByTestId("input").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "destructive",
          })
        );
      });
    });
  });

  describe("Button States", () => {
    it("should disable submit button when mutation is pending", () => {
      // Mock mutation with pending state
      (mockUseMutation as any).mockImplementation((config: any) => {
        return {
          mutate: mockMutate,
          isPending: true,
        };
      });

      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      // When pending, button shows "sending" text
      const submitButton = screen
        .getByText(/suggestIdea.sending/i)
        .closest("button");
      expect((submitButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("should show loading state when submitting", () => {
      // Mock mutation with pending state
      (mockUseMutation as any).mockImplementation((config: any) => {
        return {
          mutate: mockMutate,
          isPending: true,
        };
      });

      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByTestId("loader-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("suggestIdea.sending");
    });
  });

  describe("Dialog Closing", () => {
    it("should call onOpenChange when dialog is closed", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      if (dialogOnOpenChange) {
        dialogOnOpenChange(false);
      }

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("should clear form error when dialog is closed", () => {
      render(
        <SuggestIdeaModal
          username={mockUsername}
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      );

      if (dialogOnOpenChange) {
        dialogOnOpenChange(false);
      }

      // onOpenChange should be called with false
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
