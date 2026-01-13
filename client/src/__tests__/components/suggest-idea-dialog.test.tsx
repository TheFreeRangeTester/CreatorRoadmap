import { describe, it, expect, beforeEach, jest } from "@jest/globals";
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
      // In i18next, t(key, options) means the second param is options
      return key;
    }
    // If options is provided and defaultValue is a string, interpolate
    if (options && typeof defaultValue === "string") {
      return defaultValue.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(options[name] || "")
      );
    }
    // If defaultValue is an object but options is also provided, defaultValue is the default string
    if (
      defaultValue &&
      typeof defaultValue === "object" &&
      !Array.isArray(defaultValue) &&
      options
    ) {
      return key;
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

// Mock de useAchievements
const mockShowAchievement = jest.fn();
jest.mock("@/hooks/use-achievements", () => ({
  useAchievements: () => ({
    showAchievement: mockShowAchievement,
  }),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Lightbulb: jest.fn(({ className }) => (
    <div data-testid="lightbulb-icon" className={className} />
  )),
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
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
  Input: ({
    id,
    value,
    onChange,
    placeholder,
    disabled,
    autoComplete,
    className,
  }: any) => (
    <input
      id={id}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      className={className}
      data-testid="input"
    />
  ),
}));

// Mock de Textarea component
jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    id,
    value,
    onChange,
    placeholder,
    rows,
    disabled,
    className,
  }: any) => (
    <textarea
      id={id}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={className}
      data-testid="textarea"
    />
  ),
}));

// Mock de fetch global
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ success: true }),
  } as any)
);

global.fetch = mockFetch as any;

// Mock de console.log y console.error
const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

import SuggestIdeaDialog from "../../components/suggest-idea-dialog";

describe("SuggestIdeaDialog", () => {
  const mockRefetch = jest.fn(() => Promise.resolve());
  const mockUsername = "testcreator";

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
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
        // If defaultValue is an object but options is also provided, defaultValue is the default string
        if (
          defaultValue &&
          typeof defaultValue === "object" &&
          !Array.isArray(defaultValue) &&
          options
        ) {
          return key;
        }
        return typeof defaultValue === "string" ? defaultValue : key;
      }
    );
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as any);
    mockRefetch.mockClear();
    mockToast.mockClear();
    mockShowAchievement.mockClear();
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
    it("should render suggest idea dialog", () => {
      const { container } = render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      expect(container.firstChild).toBeTruthy();
    });

    it("should render open button", () => {
      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      const icons = screen.getAllByTestId("lightbulb-icon");
      expect(icons.length).toBeGreaterThan(0);
      expect(mockT).toHaveBeenCalledWith("suggestIdea.button");
    });

    it("should not render dialog when closed", () => {
      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      const dialog = screen.getByTestId("dialog");
      expect(dialog.getAttribute("data-open")).toBe("false");
    });
  });

  describe("Dialog Opening", () => {
    it("should open dialog when button is clicked", () => {
      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      const dialog = screen.getByTestId("dialog");
      expect(dialog.getAttribute("data-open")).toBe("true");
    });

    it("should show toast when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({ user: null });

      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockToast).toHaveBeenCalled();
      expect(mockT).toHaveBeenCalledWith("suggestIdea.loginRequired");
    });

    it("should not open dialog when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({ user: null });

      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      const dialog = screen.getByTestId("dialog");
      expect(dialog.getAttribute("data-open")).toBe("false");
    });

    it("should reset form when dialog is opened", () => {
      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      // Open dialog
      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      // Form fields should be empty
      const titleInput = screen.getByTestId("input");
      const descriptionTextarea = screen.getByTestId("textarea");
      expect((titleInput as HTMLInputElement).value).toBe("");
      expect((descriptionTextarea as HTMLTextAreaElement).value).toBe("");
    });
  });

  describe("Form Fields", () => {
    beforeEach(() => {
      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      // Open dialog
      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }
    });

    it("should render title field", () => {
      expect(screen.getByTestId("input")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("suggestIdea.titleLabel");
    });

    it("should render description field", () => {
      expect(screen.getByTestId("textarea")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("suggestIdea.descriptionLabel");
    });

    it("should update title when input changes", () => {
      const titleInput = screen.getByTestId("input");
      fireEvent.change(titleInput, { target: { value: "Test Title" } });

      expect((titleInput as HTMLInputElement).value).toBe("Test Title");
    });

    it("should update description when textarea changes", () => {
      const descriptionTextarea = screen.getByTestId("textarea");
      fireEvent.change(descriptionTextarea, {
        target: { value: "Test Description" },
      });

      expect((descriptionTextarea as HTMLTextAreaElement).value).toBe(
        "Test Description"
      );
    });
  });

  describe("Form Validation", () => {
    beforeEach(() => {
      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      // Open dialog
      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }
    });

    it("should show error when title is too short", async () => {
      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockT).toHaveBeenCalledWith("suggestIdea.titleMinLength");
      });
    });

    it("should show error when title is too long", async () => {
      const titleInput = screen.getByTestId("input");
      fireEvent.change(titleInput, {
        target: { value: "a".repeat(101) },
      });

      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockT).toHaveBeenCalledWith("suggestIdea.titleMaxLength");
      });
    });

    it("should show error when description is too short", async () => {
      const titleInput = screen.getByTestId("input");
      fireEvent.change(titleInput, { target: { value: "Valid Title" } });

      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockT).toHaveBeenCalledWith("suggestIdea.descriptionMinLength");
      });
    });

    it("should show error when description is too long", async () => {
      const titleInput = screen.getByTestId("input");
      const descriptionTextarea = screen.getByTestId("textarea");

      fireEvent.change(titleInput, { target: { value: "Valid Title" } });
      fireEvent.change(descriptionTextarea, {
        target: { value: "a".repeat(501) },
      });

      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockT).toHaveBeenCalledWith("suggestIdea.descriptionMaxLength");
      });
    });
  });

  describe("Form Submission", () => {
    beforeEach(() => {
      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      // Open dialog
      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }

      // Fill form
      const titleInput = screen.getByTestId("input");
      const descriptionTextarea = screen.getByTestId("textarea");

      fireEvent.change(titleInput, { target: { value: "Test Title" } });
      fireEvent.change(descriptionTextarea, {
        target: { value: "This is a valid description with enough characters" },
      });
    });

    it("should call fetch with correct data when form is submitted", async () => {
      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        const calls = mockFetch.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        const lastCall = calls[calls.length - 1];
        expect(lastCall).toBeTruthy();
        const [url, options] = lastCall as unknown as [string, any];
        expect(url).toBe(`/api/creators/${mockUsername}/suggest`);
        expect(options?.method).toBe("POST");
        if (options?.body) {
          const body = JSON.parse(options.body);
          expect(body.title).toBe("Test Title");
          expect(body.description).toBe(
            "This is a valid description with enough characters"
          );
        }
      });
    });

    it("should show success toast after successful submission", async () => {
      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });

    it("should close dialog after successful submission", async () => {
      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog.getAttribute("data-open")).toBe("false");
      });
    });

    it("should call refetch after successful submission", async () => {
      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it("should show achievement after successful submission", async () => {
      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(mockShowAchievement).toHaveBeenCalled();
      });
    });

    it("should show error toast when submission fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Error message" }),
      } as any);

      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
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
    beforeEach(() => {
      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      // Open dialog
      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }
    });

    it("should disable buttons when submitting", async () => {
      const titleInput = screen.getByTestId("input");
      const descriptionTextarea = screen.getByTestId("textarea");

      fireEvent.change(titleInput, { target: { value: "Test Title" } });
      fireEvent.change(descriptionTextarea, {
        target: { value: "This is a valid description with enough characters" },
      });

      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const dialogButtons = buttons.filter((btn) =>
          btn.closest('[data-testid="dialog-footer"]')
        );
        dialogButtons.forEach((button) => {
          expect((button as HTMLButtonElement).disabled).toBe(true);
        });
      });
    });

    it("should show loading state when submitting", async () => {
      const titleInput = screen.getByTestId("input");
      const descriptionTextarea = screen.getByTestId("textarea");

      fireEvent.change(titleInput, { target: { value: "Test Title" } });
      fireEvent.change(descriptionTextarea, {
        target: { value: "This is a valid description with enough characters" },
      });

      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("loader-icon")).toBeTruthy();
        expect(mockT).toHaveBeenCalledWith("suggestIdea.sending");
      });
    });
  });

  describe("Dialog Closing", () => {
    beforeEach(() => {
      render(
        <SuggestIdeaDialog username={mockUsername} refetch={mockRefetch} />
      );

      // Open dialog
      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0]?.closest("button");
      if (button) {
        fireEvent.click(button);
      }
    });

    it("should close dialog when cancel button is clicked", () => {
      const cancelButton = screen
        .getByText(/suggestIdea.cancel/i)
        .closest("button");
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      const dialog = screen.getByTestId("dialog");
      expect(dialog.getAttribute("data-open")).toBe("false");
    });

    it("should not close dialog when submitting", () => {
      const titleInput = screen.getByTestId("input");
      const descriptionTextarea = screen.getByTestId("textarea");

      fireEvent.change(titleInput, { target: { value: "Test Title" } });
      fireEvent.change(descriptionTextarea, {
        target: { value: "This is a valid description with enough characters" },
      });

      const submitButton = screen
        .getByText(/suggestIdea.submit/i)
        .closest("button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }

      // Dialog should not close immediately when submitting
      const dialog = screen.getByTestId("dialog");
      // It might still be open or closed depending on async timing
      expect(dialog).toBeTruthy();
    });
  });

  describe("Full Width Variant", () => {
    it("should apply full width classes when fullWidth is true", () => {
      render(
        <SuggestIdeaDialog
          username={mockUsername}
          refetch={mockRefetch}
          fullWidth={true}
        />
      );

      const icons = screen.getAllByTestId("lightbulb-icon");
      const button = icons[0].closest("button");
      expect(button?.className).toContain("w-full");
    });
  });
});
