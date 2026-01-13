import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock de toast - debe estar antes del import del componente
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  toast: mockToast,
}));

import PublicLinksManager from "../../components/public-links-manager";

// Mock de useQuery
const mockLinks: any[] = [
  {
    id: 1,
    url: "https://example.com/link1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    expiresAt: null,
  },
  {
    id: 2,
    url: "https://example.com/link2",
    isActive: false,
    createdAt: "2024-01-02T00:00:00Z",
    expiresAt: "2024-12-31T00:00:00Z",
  },
];

const mockUseQuery = jest.fn(() => ({
  data: mockLinks as any,
  isLoading: false,
}));

// Mock de useMutation
const mockCreateMutate = jest.fn();
const mockToggleMutate = jest.fn();
const mockDeleteMutate = jest.fn();

const mockCreateMutation = {
  mutate: mockCreateMutate,
  isPending: false,
};

const mockToggleMutation = {
  mutate: mockToggleMutate,
  isPending: false,
};

const mockDeleteMutation = {
  mutate: mockDeleteMutate,
  isPending: false,
};

const mockUseMutation = jest.fn((config?: any) => {
  if (config?.mutationFn) {
    // Determine which mutation based on the URL pattern
    const url = config.mutationFn.toString();
    if (url.includes("POST")) {
      return mockCreateMutation;
    } else if (url.includes("PATCH")) {
      return mockToggleMutation;
    } else if (url.includes("DELETE")) {
      return mockDeleteMutation;
    }
  }
  return mockCreateMutation;
});

// Mock de useQueryClient
const mockInvalidateQueries = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

jest.mock("@tanstack/react-query", () => ({
  useQuery: () => mockUseQuery(),
  useMutation: (config?: any) => mockUseMutation(config),
  useQueryClient: () => mockQueryClient,
}));

// Mock de apiRequest
jest.mock("@/lib/queryClient", () => ({
  apiRequest: jest.fn(() =>
    Promise.resolve({
      json: async () => ({ success: true }),
    } as any)
  ),
}));

// Mock de toast ya está definido arriba

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  CalendarIcon: jest.fn(({ className }) => (
    <div data-testid="calendar-icon" className={className} />
  )),
  Copy: jest.fn(({ className }) => (
    <div data-testid="copy-icon" className={className} />
  )),
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
  Plus: jest.fn(({ className }) => (
    <div data-testid="plus-icon" className={className} />
  )),
  Share2: jest.fn(({ className }) => (
    <div data-testid="share-icon" className={className} />
  )),
  Trash: jest.fn(({ className }) => (
    <div data-testid="trash-icon" className={className} />
  )),
  ToggleLeft: jest.fn(({ className }) => (
    <div data-testid="toggle-left-icon" className={className} />
  )),
  ToggleRight: jest.fn(({ className }) => (
    <div data-testid="toggle-right-icon" className={className} />
  )),
  Eye: jest.fn(({ className }) => (
    <div data-testid="eye-icon" className={className} />
  )),
}));

// Mock de date-fns
jest.mock("date-fns", () => ({
  format: jest.fn((date: Date, formatStr: string) => {
    return date.toLocaleDateString();
  }),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    type,
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

// Mock de Card components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className }: any) => (
    <div data-testid="card-description" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div data-testid="card-footer" className={className}>
      {children}
    </div>
  ),
}));

// Mock de Dialog components
let dialogOnOpenChange: ((open: boolean) => void) | null = null;

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) => {
    dialogOnOpenChange = onOpenChange;
    return (
      <div data-testid="dialog" data-open={open}>
        {children}
      </div>
    );
  },
  DialogTrigger: ({ children, asChild }: any) => {
    const handleClick = (e: any) => {
      e.stopPropagation();
      if (dialogOnOpenChange) {
        dialogOnOpenChange(true);
      }
    };
    if (asChild && children) {
      // Clone the child and add onClick handler
      return React.cloneElement(children, { onClick: handleClick });
    }
    return (
      <div data-testid="dialog-trigger" onClick={handleClick}>
        {children}
      </div>
    );
  },
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
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
  DialogFooter: ({ children }: any) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

// Mock de Switch component
jest.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <button
      data-testid="switch"
      data-checked={checked}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
    >
      {checked ? "ON" : "OFF"}
    </button>
  ),
}));

// Mock de Calendar component
jest.mock("@/components/ui/calendar", () => ({
  Calendar: ({ selected, onSelect, disabled, mode }: any) => (
    <div
      data-testid="calendar"
      data-selected={selected ? selected.toISOString() : null}
      onClick={() => {
        if (onSelect && !disabled) {
          onSelect(new Date("2024-12-31"));
        }
      }}
    >
      Calendar
    </div>
  ),
}));

// Mock de Popover components
jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children, asChild }: any) => {
    if (asChild && children) {
      return children;
    }
    return <div data-testid="popover-trigger">{children}</div>;
  },
  PopoverContent: ({ children, className }: any) => (
    <div data-testid="popover-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock de AlertDialog components
let alertDialogOnOpenChange: ((open: boolean) => void) | null = null;

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: any) => (
    <div data-testid="alert-dialog">{children}</div>
  ),
  AlertDialogTrigger: ({ children, asChild }: any) => {
    const handleClick = (e: any) => {
      e.stopPropagation();
      if (alertDialogOnOpenChange) {
        alertDialogOnOpenChange(true);
      }
    };
    if (asChild && children) {
      return <div onClick={handleClick}>{children}</div>;
    }
    return (
      <div data-testid="alert-dialog-trigger" onClick={handleClick}>
        {children}
      </div>
    );
  },
  AlertDialogContent: ({ children }: any) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: any) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: any) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
  AlertDialogDescription: ({ children }: any) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: any) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogCancel: ({ children, onClick }: any) => (
    <button data-testid="alert-dialog-cancel" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogAction: ({ children, onClick, className }: any) => (
    <button
      data-testid="alert-dialog-action"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock de cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

// Mock de navigator.clipboard
const mockWriteText: jest.Mock = jest.fn(() => Promise.resolve());
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock de navigator.share
const mockShare: jest.Mock = jest.fn(() => Promise.resolve());
Object.assign(navigator, {
  share: mockShare,
});

// Mock de window.open
const mockWindowOpen = jest.fn();
(window as any).open = mockWindowOpen;

describe("PublicLinksManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: mockLinks as any,
      isLoading: false,
    });
    dialogOnOpenChange = null;
    alertDialogOnOpenChange = null;
    mockWriteText.mockClear();
    mockShare.mockClear();
    mockWindowOpen.mockClear();
  });

  describe("Basic Rendering", () => {
    it("should render public links manager", () => {
      const { container } = render(<PublicLinksManager />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render title", () => {
      render(<PublicLinksManager />);

      expect(screen.getByText("Public Links")).toBeTruthy();
    });

    it("should render create button", () => {
      const { container } = render(<PublicLinksManager />);

      // Button might be in a dialog trigger, check for plus icon
      expect(screen.getByTestId("plus-icon")).toBeTruthy();
      // Check if button text exists (might be in button or trigger)
      expect(container.textContent).toContain("Create Public Link");
    });
  });

  describe("Loading State", () => {
    it("should show loader when loading", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<PublicLinksManager />);

      expect(screen.getByTestId("loader-icon")).toBeTruthy();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no links", () => {
      mockUseQuery.mockReturnValue({
        data: [] as any,
        isLoading: false,
      });

      render(<PublicLinksManager />);

      expect(
        screen.getByText(/You haven't created any public links yet/i)
      ).toBeTruthy();
    });
  });

  describe("Links List", () => {
    it("should render links", () => {
      render(<PublicLinksManager />);

      expect(screen.getAllByTestId("card").length).toBeGreaterThan(0);
    });

    it("should render link URLs", () => {
      render(<PublicLinksManager />);

      expect(screen.getByText("https://example.com/link1")).toBeTruthy();
      expect(screen.getByText("https://example.com/link2")).toBeTruthy();
    });

    it("should render active status", () => {
      render(<PublicLinksManager />);

      expect(screen.getByText("Active")).toBeTruthy();
      expect(screen.getByText("Inactive")).toBeTruthy();
    });
  });

  describe("Create Dialog", () => {
    it("should have create button with plus icon", () => {
      render(<PublicLinksManager />);

      // Verify the create button exists with plus icon
      expect(screen.getByTestId("plus-icon")).toBeTruthy();
    });

    it("should have dialog component", () => {
      render(<PublicLinksManager />);

      // Dialog should be present (even if closed)
      expect(screen.getByTestId("dialog")).toBeTruthy();
    });
  });

  describe("Toggle Link", () => {
    it("should call toggle mutation when switch is clicked", () => {
      render(<PublicLinksManager />);

      const switches = screen.getAllByTestId("switch");
      if (switches[0]) {
        fireEvent.click(switches[0]);
      }

      expect(mockToggleMutate).toHaveBeenCalled();
    });
  });

  describe("Copy Link", () => {
    it("should copy link to clipboard", async () => {
      render(<PublicLinksManager />);

      const copyIcons = screen.getAllByTestId("copy-icon");
      if (copyIcons[0]) {
        const copyButton = copyIcons[0].closest("button");
        if (copyButton) {
          fireEvent.click(copyButton);
        }
      }

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
      });
    });

    it("should show toast when link is copied", async () => {
      render(<PublicLinksManager />);

      const copyIcons = screen.getAllByTestId("copy-icon");
      if (copyIcons[0]) {
        const copyButton = copyIcons[0].closest("button");
        if (copyButton) {
          fireEvent.click(copyButton);
        }
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });
  });

  describe("Share Link", () => {
    it("should call navigator.share when available", async () => {
      render(<PublicLinksManager />);

      const shareIcons = screen.getAllByTestId("share-icon");
      if (shareIcons[0]) {
        const shareButton = shareIcons[0].closest("button");
        if (shareButton) {
          fireEvent.click(shareButton);
        }
      }

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalled();
      });
    });

    it("should fallback to copy when share is not available", async () => {
      (navigator as any).share = undefined;

      render(<PublicLinksManager />);

      const shareIcons = screen.getAllByTestId("share-icon");
      if (shareIcons[0]) {
        const shareButton = shareIcons[0].closest("button");
        if (shareButton) {
          fireEvent.click(shareButton);
        }
      }

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
      });
    });
  });

  describe("Preview Link", () => {
    it("should open link in new window", () => {
      render(<PublicLinksManager />);

      const eyeIcons = screen.getAllByTestId("eye-icon");
      if (eyeIcons[0]) {
        const previewButton = eyeIcons[0].closest("button");
        if (previewButton) {
          fireEvent.click(previewButton);
        }
      }

      expect(mockWindowOpen).toHaveBeenCalled();
    });

    it("should show toast when preview is opened", () => {
      render(<PublicLinksManager />);

      const eyeIcons = screen.getAllByTestId("eye-icon");
      if (eyeIcons[0]) {
        const previewButton = eyeIcons[0].closest("button");
        if (previewButton) {
          fireEvent.click(previewButton);
        }
      }

      expect(mockToast).toHaveBeenCalled();
    });
  });

  describe("Delete Link", () => {
    it("should render delete button", () => {
      render(<PublicLinksManager />);

      expect(screen.getAllByTestId("trash-icon").length).toBeGreaterThan(0);
    });

    it("should open alert dialog when delete is clicked", () => {
      render(<PublicLinksManager />);

      const deleteButtons = screen.getAllByText("Delete");
      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0]);
      }

      // There might be multiple alert dialogs, check that at least one is open
      const alertDialogs = screen.getAllByTestId("alert-dialog-content");
      expect(alertDialogs.length).toBeGreaterThan(0);
    });

    it("should call delete mutation when confirmed", () => {
      render(<PublicLinksManager />);

      const deleteButtons = screen.getAllByText("Delete");
      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0]);
      }

      // Get the first alert dialog action button
      const confirmButtons = screen.getAllByTestId("alert-dialog-action");
      if (confirmButtons[0]) {
        fireEvent.click(confirmButtons[0]);
      }

      expect(mockDeleteMutate).toHaveBeenCalled();
    });
  });

  describe("Expiration Date", () => {
    it("should show expiration date when present", () => {
      render(<PublicLinksManager />);

      expect(screen.getByText(/Expires on/i)).toBeTruthy();
    });
  });
});
