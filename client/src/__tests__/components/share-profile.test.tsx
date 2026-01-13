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
const mockT = jest.fn((key: string, defaultValue?: string, options?: any) => {
  if (options && typeof defaultValue === "string") {
    return defaultValue.replace(/\{\{(\w+)\}\}/g, (_, name) =>
      String(options[name] || "")
    );
  }
  return defaultValue || key;
});

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

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Share2: jest.fn(({ className }) => (
    <div data-testid="share-icon" className={className} />
  )),
  Copy: jest.fn(({ className }) => (
    <div data-testid="copy-icon" className={className} />
  )),
  Check: jest.fn(({ className }) => (
    <div data-testid="check-icon" className={className} />
  )),
  ExternalLink: jest.fn(({ className }) => (
    <div data-testid="external-link-icon" className={className} />
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

// Mock de Badge component
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <div data-testid="badge" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

// Mock de SharingTipsTooltip
jest.mock("../../components/sharing-tips-tooltip", () => ({
  SharingTipsTooltip: () => (
    <div data-testid="sharing-tips-tooltip">SharingTipsTooltip</div>
  ),
}));

// Mock de navigator.clipboard
const mockWriteText = jest.fn(() => Promise.resolve()) as jest.MockedFunction<
  (text: string) => Promise<void>
>;
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock de navigator.share
const mockShare = jest.fn(() => Promise.resolve()) as jest.MockedFunction<
  (data: any) => Promise<void>
>;
Object.assign(navigator, {
  share: mockShare,
});

// Mock de window.open
const mockWindowOpen = jest.fn();
(window as any).open = mockWindowOpen;

// Mock de window.location
delete (window as any).location;
(window as any).location = { origin: "http://localhost" };

// Mock de setTimeout
jest.useFakeTimers();

import ShareProfile from "../../components/share-profile";

describe("ShareProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string, options?: any) => {
        if (options && typeof defaultValue === "string") {
          return defaultValue.replace(/\{\{(\w+)\}\}/g, (_, name) =>
            String(options[name] || "")
          );
        }
        return defaultValue || key;
      }
    );
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockWriteText.mockClear();
    mockShare.mockClear();
    mockWindowOpen.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe("Basic Rendering", () => {
    it("should render share profile", () => {
      const { container } = render(<ShareProfile />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should not render when user is null", () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { container } = render(<ShareProfile />);

      expect(container.firstChild).toBeNull();
    });

    it("should render card", () => {
      render(<ShareProfile />);

      expect(screen.getByTestId("card")).toBeTruthy();
    });

    it("should render title", () => {
      render(<ShareProfile />);

      expect(mockT).toHaveBeenCalledWith(
        "dashboard.yourPublicProfile",
        "Tu Perfil Público"
      );
    });

    it("should render description", () => {
      render(<ShareProfile />);

      // Description is called with default value
      expect(mockT).toHaveBeenCalledWith(
        "dashboard.shareProfileDesc",
        expect.any(String)
      );
    });

    it("should render profile URL", () => {
      render(<ShareProfile />);

      expect(screen.getByText("http://localhost/testuser")).toBeTruthy();
    });
  });

  describe("Copy Link", () => {
    it("should render copy button", () => {
      render(<ShareProfile />);

      expect(screen.getByTestId("copy-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("dashboard.copyLink", "Copiar enlace");
    });

    it("should copy URL to clipboard when copy button is clicked", async () => {
      render(<ShareProfile />);

      // Find button by copy icon
      const copyIcon = screen.getByTestId("copy-icon");
      const copyButton = copyIcon.closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith("http://localhost/testuser");
      });
    });

    it("should show toast when link is copied", async () => {
      render(<ShareProfile />);

      // Find button by copy icon
      const copyIcon = screen.getByTestId("copy-icon");
      const copyButton = copyIcon.closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });

    it("should show check icon when copied", async () => {
      render(<ShareProfile />);

      // Find button by copy icon
      const copyIcon = screen.getByTestId("copy-icon");
      const copyButton = copyIcon.closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("check-icon")).toBeTruthy();
      });
    });

    it("should reset copied state after 2 seconds", async () => {
      render(<ShareProfile />);

      // Find button by copy icon
      const copyIcon = screen.getByTestId("copy-icon");
      const copyButton = copyIcon.closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("check-icon")).toBeTruthy();
      });

      // Fast-forward time
      jest.advanceTimersByTime(2000);
      jest.runOnlyPendingTimers();

      await waitFor(() => {
        // After 2 seconds, copy icon should be visible again
        const copyIcons = screen.queryAllByTestId("copy-icon");
        expect(copyIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("View Profile", () => {
    it("should render view profile button", () => {
      render(<ShareProfile />);

      expect(screen.getByTestId("external-link-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("dashboard.viewProfile", "Ver perfil");
    });

    it("should open profile in new window when view button is clicked", () => {
      render(<ShareProfile />);

      // Find button by external link icon
      const externalLinkIcon = screen.getByTestId("external-link-icon");
      const viewButton = externalLinkIcon.closest("button");
      if (viewButton) {
        fireEvent.click(viewButton);
      }

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "http://localhost/testuser",
        "_blank"
      );
    });
  });

  describe("Share", () => {
    it("should render share button", () => {
      render(<ShareProfile />);

      expect(screen.getByTestId("share-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith(
        "dashboard.shareProfile",
        "Compartir perfil"
      );
    });

    it("should call navigator.share when share button is clicked and share is available", async () => {
      render(<ShareProfile />);

      // Find button by share icon
      const shareIcon = screen.getByTestId("share-icon");
      const shareButton = shareIcon.closest("button");
      if (shareButton) {
        fireEvent.click(shareButton);
      }

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalled();
      });
    });

    it("should fallback to copy when share is not available", async () => {
      // Store original share
      const originalShare = (navigator as any).share;
      (navigator as any).share = undefined;

      render(<ShareProfile />);

      // Find button by share icon
      const shareIcon = screen.getByTestId("share-icon");
      const shareButton = shareIcon.closest("button");
      if (shareButton) {
        fireEvent.click(shareButton);
      }

      await waitFor(
        () => {
          expect(mockWriteText).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      // Restore share
      (navigator as any).share = originalShare;
    });

    it("should not call copy when share is aborted", async () => {
      mockShare.mockRejectedValueOnce({ name: "AbortError" } as any);

      render(<ShareProfile />);

      // Find button by share icon
      const shareIcon = screen.getByTestId("share-icon");
      const shareButton = shareIcon.closest("button");
      if (shareButton) {
        fireEvent.click(shareButton);
      }

      // Wait for share to be called
      await waitFor(
        () => {
          expect(mockShare).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      // The component checks if error name is "AbortError" and doesn't call handleCopyLink
      // Verify copy was not called (AbortError should not trigger copy)
      // Use a short timeout to check immediately
      expect(mockWriteText).not.toHaveBeenCalled();
    }, 10000);

    it("should fallback to copy when share fails with non-abort error", async () => {
      mockShare.mockRejectedValueOnce({ name: "NotAllowedError" } as any);

      render(<ShareProfile />);

      // Find button by share icon
      const shareIcon = screen.getByTestId("share-icon");
      const shareButton = shareIcon.closest("button");
      if (shareButton) {
        fireEvent.click(shareButton);
      }

      await waitFor(
        () => {
          expect(mockWriteText).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("SharingTipsTooltip", () => {
    it("should render sharing tips tooltip", () => {
      render(<ShareProfile />);

      expect(screen.getByTestId("sharing-tips-tooltip")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should handle clipboard error gracefully", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockWriteText.mockRejectedValueOnce(new Error("Clipboard error") as any);

      render(<ShareProfile />);

      // Find button by copy icon
      const copyIcon = screen.getByTestId("copy-icon");
      const copyButton = copyIcon.closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
