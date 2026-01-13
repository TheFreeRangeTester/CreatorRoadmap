import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LandingHeader } from "../../components/landing-header";

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

const mockLogoutMutation = {
  mutateAsync: jest.fn(() => Promise.resolve()),
  isPending: false,
};

const mockUseAuth = jest.fn(() => ({
  user: null,
  logoutMutation: mockLogoutMutation,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
  LogOut: jest.fn(({ className }) => (
    <div data-testid="logout-icon" className={className} />
  )),
}));

// Mock de Logo
jest.mock("@/components/logo", () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

// Mock de ThemeToggle
jest.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

// Mock de LanguageToggle
jest.mock("@/components/language-toggle", () => ({
  LanguageToggle: () => <div data-testid="language-toggle">LanguageToggle</div>,
}));

// Mock de MobileMenu
jest.mock("@/components/mobile-menu", () => ({
  MobileMenu: ({ onLogout }: any) => (
    <div data-testid="mobile-menu">
      {onLogout && <button onClick={onLogout}>Logout</button>}
    </div>
  ),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, variant }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

// Mock de wouter Link
jest.mock("wouter", () => ({
  Link: ({ children, href }: any) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
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

describe("LandingHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockUseAuth.mockReturnValue({
      user: null,
      logoutMutation: mockLogoutMutation,
    });
    mockLogoutMutation.isPending = false;
  });

  describe("Basic Rendering", () => {
    it("should render header", () => {
      const { container } = render(<LandingHeader />);

      expect(container.querySelector("header")).toBeTruthy();
    });

    it("should render logo", () => {
      render(<LandingHeader />);

      expect(screen.getByTestId("logo")).toBeTruthy();
    });

    it("should apply custom className", () => {
      const { container } = render(<LandingHeader className="custom-class" />);

      const header = container.querySelector("header");
      expect(header?.className).toContain("custom-class");
    });
  });

  describe("Unauthenticated State", () => {
    it("should render login button when user is not logged in", () => {
      render(<LandingHeader />);

      expect(mockT).toHaveBeenCalledWith("landing.cta.login");
      expect(screen.getByTestId("link-/auth?direct=true")).toBeTruthy();
    });

    it("should render register button when user is not logged in", () => {
      render(<LandingHeader />);

      expect(mockT).toHaveBeenCalledWith("landing.cta.register");
      expect(
        screen.getByTestId("link-/auth?direct=true&register=true")
      ).toBeTruthy();
    });

    it("should set localStorage when login button is clicked", () => {
      render(<LandingHeader />);

      const loginLink = screen.getByTestId("link-/auth?direct=true");
      const loginButton = loginLink.querySelector("button");
      if (loginButton) {
        fireEvent.click(loginButton);
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "attemptingCreatorLogin",
        "true"
      );
    });
  });

  describe("Authenticated State", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        logoutMutation: mockLogoutMutation,
      });
    });

    it("should render username when user is logged in", () => {
      render(<LandingHeader />);

      expect(screen.getByTestId("user-icon")).toBeTruthy();
      expect(screen.getByText("testuser")).toBeTruthy();
    });

    it("should render logout button when user is logged in", () => {
      render(<LandingHeader />);

      expect(screen.getByTestId("logout-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("common.logout");
    });

    it("should call logoutMutation when logout button is clicked", async () => {
      render(<LandingHeader />);

      // Find logout button by icon (more specific)
      const logoutIcon = screen.getByTestId("logout-icon");
      const logoutButton = logoutIcon.closest("button");
      if (logoutButton) {
        fireEvent.click(logoutButton);
        // Wait for async operation
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      expect(mockLogoutMutation.mutateAsync).toHaveBeenCalled();
    });

    it("should show loading state when logout is pending", () => {
      mockLogoutMutation.isPending = true;
      render(<LandingHeader />);

      expect(mockT).toHaveBeenCalledWith("common.saving");
    });

    it("should disable logout button when logout is pending", () => {
      mockLogoutMutation.isPending = true;
      render(<LandingHeader />);

      // Find logout button by icon
      const logoutIcon = screen.getByTestId("logout-icon");
      const logoutButton = logoutIcon.closest("button") as HTMLButtonElement;
      expect(logoutButton.disabled).toBe(true);
    });
  });

  describe("Creator Role", () => {
    beforeEach(() => {
      const creatorUser = {
        ...mockUser,
        userRole: "creator" as const,
      };
      mockUseAuth.mockReturnValue({
        user: creatorUser,
        logoutMutation: mockLogoutMutation,
      });
    });

    it("should render dashboard button for creators", () => {
      render(<LandingHeader />);

      expect(screen.getByTestId("link-/dashboard")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("navigation.dashboard");
    });

    it("should not render dashboard button for non-creators", () => {
      const audienceUser = {
        ...mockUser,
        userRole: "audience" as const,
      };
      mockUseAuth.mockReturnValue({
        user: audienceUser,
        logoutMutation: mockLogoutMutation,
      });

      render(<LandingHeader />);

      expect(screen.queryByTestId("link-/dashboard")).toBeNull();
    });
  });

  describe("Toggles", () => {
    it("should render language toggle", () => {
      render(<LandingHeader />);

      expect(screen.getByTestId("language-toggle")).toBeTruthy();
    });

    it("should render theme toggle", () => {
      render(<LandingHeader />);

      expect(screen.getByTestId("theme-toggle")).toBeTruthy();
    });
  });

  describe("Mobile Menu", () => {
    it("should render mobile menu", () => {
      render(<LandingHeader />);

      expect(screen.getByTestId("mobile-menu")).toBeTruthy();
    });

    it("should pass onLogout to mobile menu when user is logged in", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        logoutMutation: mockLogoutMutation,
      });

      render(<LandingHeader />);

      const mobileMenu = screen.getByTestId("mobile-menu");
      const logoutButton = mobileMenu.querySelector("button");
      expect(logoutButton).toBeTruthy();
    });

    it("should not pass onLogout to mobile menu when user is not logged in", () => {
      render(<LandingHeader />);

      const mobileMenu = screen.getByTestId("mobile-menu");
      const logoutButton = mobileMenu.querySelector("button");
      expect(logoutButton).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle logout error", async () => {
      const originalLocation = (window as any).location;
      const mockLocation = { href: "http://localhost:3000" };
      delete (window as any).location;
      (window as any).location = mockLocation;

      mockLogoutMutation.mutateAsync.mockRejectedValueOnce(
        new Error("Logout failed")
      );
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockUseAuth.mockReturnValue({
        user: mockUser,
        logoutMutation: mockLogoutMutation,
      });

      render(<LandingHeader />);

      // Find logout button by icon
      const logoutIcon = screen.getByTestId("logout-icon");
      const logoutButton = logoutIcon.closest("button");
      if (logoutButton) {
        fireEvent.click(logoutButton);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();

      // Restore location
      (window as any).location = originalLocation;
    });
  });
});
