import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MobileMenu } from "../../components/mobile-menu";

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
  user: null,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de useLocation
const mockUseLocation = jest.fn(() => ["/", jest.fn()]);

jest.mock("wouter", () => ({
  Link: ({ children, href, onClick, className }: any) => (
    <a
      href={href}
      onClick={onClick}
      className={className}
      data-testid={`link-${href}`}
    >
      {children}
    </a>
  ),
  useLocation: () => mockUseLocation(),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Menu: jest.fn(({ className }) => (
    <div data-testid="menu-icon" className={className} />
  )),
  X: jest.fn(({ className }) => (
    <div data-testid="x-icon" className={className} />
  )),
  LogOut: jest.fn(({ className }) => (
    <div data-testid="logout-icon" className={className} />
  )),
  RefreshCcw: jest.fn(({ className }) => (
    <div data-testid="refresh-icon" className={className} />
  )),
  LogIn: jest.fn(({ className }) => (
    <div data-testid="login-icon" className={className} />
  )),
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    "aria-label": ariaLabel,
  }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

// Mock de ThemeToggle
jest.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

// Mock de LanguageToggle
jest.mock("@/components/language-toggle", () => ({
  LanguageToggle: () => <div data-testid="language-toggle">LanguageToggle</div>,
}));

// Mock de framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, className }: any) => (
      <div
        data-testid="motion-div"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-exit={JSON.stringify(exit)}
        data-transition={JSON.stringify(transition)}
        className={className}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => (
    <div data-testid="animate-presence">{children}</div>
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

// Mock de global.fetch
const mockFetch: jest.Mock = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
  } as Response)
);
(global as any).fetch = mockFetch;

// Mock de window.location
delete (window as any).location;
(window as any).location = { href: "http://localhost:3000" };

describe("MobileMenu", () => {
  const mockOnLogout = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockUseAuth.mockReturnValue({ user: null });
    mockUseLocation.mockReturnValue(["/", jest.fn()]);
    mockFetch.mockClear();
  });

  describe("Basic Rendering", () => {
    it("should render menu button", () => {
      render(<MobileMenu />);

      expect(screen.getByTestId("menu-icon")).toBeTruthy();
    });

    it("should render menu button with correct aria-label", () => {
      render(<MobileMenu />);

      const button = screen.getByLabelText("Menu");
      expect(button).toBeTruthy();
    });

    it("should toggle menu icon when clicked", () => {
      render(<MobileMenu />);

      const button = screen.getByTestId("menu-icon").closest("button");
      if (button) {
        fireEvent.click(button);
        // After clicking, the menu icon should be replaced with X icon
        const xIcons = screen.queryAllByTestId("x-icon");
        expect(xIcons.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Menu Toggle", () => {
    it("should open menu when button is clicked", async () => {
      render(<MobileMenu />);

      const button = screen.getByTestId("menu-icon").closest("button");
      if (button) {
        fireEvent.click(button);
        await waitFor(() => {
          expect(screen.getByTestId("motion-div")).toBeTruthy();
        });
      }
    });

    it("should close menu when X button is clicked", async () => {
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(screen.getByTestId("motion-div")).toBeTruthy();
        });

        // Find close button by looking for X icon in the menu header
        const xIcons = screen.getAllByTestId("x-icon");
        const closeButton = xIcons[xIcons.length - 1]?.closest("button");
        if (closeButton) {
          fireEvent.click(closeButton);
          await waitFor(() => {
            expect(screen.queryByTestId("motion-div")).toBeNull();
          });
        }
      }
    });
  });

  describe("Unauthenticated State", () => {
    it("should render login button when user is not logged in", async () => {
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(mockT).toHaveBeenCalledWith("landing.cta.login");
        });
      }
    });

    it("should render register button when user is not logged in", async () => {
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(mockT).toHaveBeenCalledWith("landing.cta.register");
        });
      }
    });

    it("should set localStorage when login button is clicked", async () => {
      mockUseLocation.mockReturnValue(["/dashboard", jest.fn()]);
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          const loginLink = screen.getByTestId(
            "link-/auth?direct=true&returnTo=%2Fdashboard"
          );
          const loginButton = loginLink.querySelector("button");
          if (loginButton) {
            fireEvent.click(loginButton);
          }
        });

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          "redirectAfterAuth",
          "/dashboard"
        );
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          "attemptingCreatorLogin",
          "true"
        );
      }
    });
  });

  describe("Authenticated State", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser });
    });

    it("should render username when user is logged in", async () => {
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(screen.getByText("testuser")).toBeTruthy();
        });
      }
    });

    it("should render logout button when user is logged in", async () => {
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(mockT).toHaveBeenCalledWith("common.logout", "Cerrar sesión");
        });
      }
    });

    it("should call onLogout when logout button is clicked and onLogout is provided", async () => {
      render(<MobileMenu onLogout={mockOnLogout} />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          const logoutButton = screen
            .getByText("Cerrar sesión")
            .closest("button");
          if (logoutButton) {
            fireEvent.click(logoutButton);
          }
        });

        await waitFor(() => {
          expect(mockOnLogout).toHaveBeenCalled();
        });
      }
    });
  });

  describe("Creator Role", () => {
    beforeEach(() => {
      const creatorUser = {
        ...mockUser,
        userRole: "creator" as const,
      };
      mockUseAuth.mockReturnValue({ user: creatorUser });
    });

    it("should render dashboard button for creators", async () => {
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(screen.getByTestId("link-/dashboard")).toBeTruthy();
        });
      }
    });

    it("should render profile button when isCreatorProfile and username matches", async () => {
      const creatorUser = {
        ...mockUser,
        userRole: "creator" as const,
        username: "testuser",
      };
      mockUseAuth.mockReturnValue({ user: creatorUser });

      render(<MobileMenu isCreatorProfile={true} username="testuser" />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(screen.getByTestId("link-/profile")).toBeTruthy();
        });
      }
    });

    it("should not render profile button when username does not match", async () => {
      const creatorUser = {
        ...mockUser,
        userRole: "creator" as const,
        username: "testuser",
      };
      mockUseAuth.mockReturnValue({ user: creatorUser });

      render(<MobileMenu isCreatorProfile={true} username="otheruser" />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(screen.queryByTestId("link-/profile")).toBeNull();
        });
      }
    });
  });

  describe("Refresh Button", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser });
    });

    it("should render refresh button when isCreatorProfile and onRefresh are provided", async () => {
      render(<MobileMenu isCreatorProfile={true} onRefresh={mockOnRefresh} />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(mockT).toHaveBeenCalledWith("common.refresh", "Refresh");
        });
      }
    });

    it("should call onRefresh when refresh button is clicked", async () => {
      render(<MobileMenu isCreatorProfile={true} onRefresh={mockOnRefresh} />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          const refreshButton = screen.getByText("Refresh").closest("button");
          if (refreshButton) {
            fireEvent.click(refreshButton);
          }
        });

        expect(mockOnRefresh).toHaveBeenCalled();
      }
    });

    it("should not render refresh button when onRefresh is not provided", async () => {
      render(<MobileMenu isCreatorProfile={true} />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(screen.queryByText("Refresh")).toBeNull();
        });
      }
    });
  });

  describe("Toggles", () => {
    it("should render language toggle", async () => {
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(screen.getByTestId("language-toggle")).toBeTruthy();
        });
      }
    });

    it("should render theme toggle", async () => {
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          expect(screen.getByTestId("theme-toggle")).toBeTruthy();
        });
      }
    });
  });

  describe("Transparent Mode", () => {
    it("should apply transparent styles when transparent is true", () => {
      render(<MobileMenu transparent={true} />);

      const button = screen.getByTestId("menu-icon").closest("button");
      expect(button?.className).toContain("bg-white/20");
      expect(button?.className).toContain("text-white");
    });
  });

  describe("Default Logout", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser });
    });

    it("should call fetch when logout is clicked without onLogout prop", async () => {
      render(<MobileMenu />);

      const toggleButton = screen.getByTestId("menu-icon").closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        await waitFor(() => {
          const logoutButton = screen
            .getByText("Cerrar sesión")
            .closest("button");
          if (logoutButton) {
            fireEvent.click(logoutButton);
          }
        });

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalled();
          const callArgs = (mockFetch as jest.Mock).mock.calls[0];
          expect(callArgs[0]).toBe("/api/auth/logout");
          const options = callArgs[1] as any;
          expect(options?.method).toBe("POST");
          expect(options?.credentials).toBe("include");
        });
      }
    });
  });
});
