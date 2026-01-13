import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ModernSidebar } from "../../components/modern-sidebar";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
  Store: jest.fn(({ className }) => (
    <div data-testid="store-icon" className={className} />
  )),
  Activity: jest.fn(({ className }) => (
    <div data-testid="activity-icon" className={className} />
  )),
  Grid3x3: jest.fn(({ className }) => (
    <div data-testid="grid3x3-icon" className={className} />
  )),
  ChevronRight: jest.fn(({ className }) => (
    <div data-testid="chevron-right-icon" className={className} />
  )),
  UserPlus: jest.fn(({ className }) => (
    <div data-testid="user-plus-icon" className={className} />
  )),
}));

// Mock de cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    className,
    title,
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      title={title}
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
    div: ({
      children,
      initial,
      animate,
      transition,
      className,
      layoutId,
    }: any) => (
      <div
        data-testid="motion-div"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        data-layout-id={layoutId}
        className={className}
      >
        {children}
      </div>
    ),
    button: ({ children, onClick, className, whileHover, whileTap }: any) => (
      <button
        data-testid="motion-button"
        onClick={onClick}
        data-while-hover={JSON.stringify(whileHover)}
        data-while-tap={JSON.stringify(whileTap)}
        className={className}
      >
        {children}
      </button>
    ),
    h2: ({ children, initial, animate, className }: any) => (
      <h2
        data-testid="motion-h2"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        className={className}
      >
        {children}
      </h2>
    ),
  },
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
(window as any).location = { href: "http://localhost:3000", pathname: "/" };

describe("ModernSidebar", () => {
  const mockOnSectionChange = jest.fn();
  const mockOnSuggestClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    (window as any).location.pathname = "/";
  });

  describe("Basic Rendering", () => {
    it("should render sidebar", () => {
      const { container } = render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(container.firstChild).toBeTruthy();
    });

    it("should render all three menu items", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(screen.getByText("Ideas")).toBeTruthy();
      expect(screen.getByText("Tienda")).toBeTruthy();
      expect(screen.getByText("Actividad")).toBeTruthy();
    });

    it("should render icons for all menu items", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(screen.getByTestId("grid3x3-icon")).toBeTruthy();
      expect(screen.getByTestId("store-icon")).toBeTruthy();
      expect(screen.getByTestId("activity-icon")).toBeTruthy();
    });
  });

  describe("Expand/Collapse", () => {
    it("should be expanded by default", () => {
      const { container } = render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar?.className).toContain("w-64");
    });

    it("should collapse when toggle button is clicked", () => {
      const { container } = render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const toggleButton = screen
        .getByTestId("chevron-right-icon")
        .closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        const sidebar = container.firstChild as HTMLElement;
        expect(sidebar?.className).toContain("w-16");
      }
    });

    it("should hide text content when collapsed", () => {
      const { container } = render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const toggleButton = screen
        .getByTestId("chevron-right-icon")
        .closest("button");
      if (toggleButton) {
        fireEvent.click(toggleButton);
        // Text should not be visible when collapsed
        expect(screen.queryByText("Ideas")).toBeNull();
      }
    });
  });

  describe("Active Section", () => {
    it("should highlight ideas section when active", () => {
      const { container } = render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const ideasButton = screen.getByText("Ideas").closest("button");
      expect(ideasButton?.className).toContain("bg-primary/10");
    });

    it("should highlight store section when active", () => {
      const { container } = render(
        <ModernSidebar
          activeSection="store"
          onSectionChange={mockOnSectionChange}
        />
      );

      const storeButton = screen.getByText("Tienda").closest("button");
      expect(storeButton?.className).toContain("bg-primary/10");
    });

    it("should highlight activity section when active", () => {
      const { container } = render(
        <ModernSidebar
          activeSection="activity"
          onSectionChange={mockOnSectionChange}
        />
      );

      const activityButton = screen.getByText("Actividad").closest("button");
      expect(activityButton?.className).toContain("bg-primary/10");
    });
  });

  describe("Click Handlers", () => {
    it("should call onSectionChange with 'ideas' when ideas button is clicked", () => {
      render(
        <ModernSidebar
          activeSection="store"
          onSectionChange={mockOnSectionChange}
        />
      );

      const ideasButton = screen.getByText("Ideas").closest("button");
      if (ideasButton) {
        fireEvent.click(ideasButton);
      }

      expect(mockOnSectionChange).toHaveBeenCalledWith("ideas");
    });

    it("should call onSectionChange with 'store' when store button is clicked", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const storeButton = screen.getByText("Tienda").closest("button");
      if (storeButton) {
        fireEvent.click(storeButton);
      }

      expect(mockOnSectionChange).toHaveBeenCalledWith("store");
    });

    it("should call onSectionChange with 'activity' when activity button is clicked", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const activityButton = screen.getByText("Actividad").closest("button");
      if (activityButton) {
        fireEvent.click(activityButton);
      }

      expect(mockOnSectionChange).toHaveBeenCalledWith("activity");
    });
  });

  describe("User Info", () => {
    it("should display username when user is provided", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
          user={{ username: "testuser" }}
        />
      );

      expect(screen.getByText(/Hola.*testuser/i)).toBeTruthy();
    });

    it("should display explore text when user is not provided", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(mockT).toHaveBeenCalledWith("navigation.explore", "Explorar");
    });
  });

  describe("Suggest Idea Button", () => {
    it("should render suggest idea button when authenticated and not own profile", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
          isAuthenticated={true}
          isOwnProfile={false}
          onSuggestClick={mockOnSuggestClick}
        />
      );

      expect(mockT).toHaveBeenCalledWith("suggest.idea", "Sugerir Idea");
    });

    it("should call onSuggestClick when suggest button is clicked", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
          isAuthenticated={true}
          isOwnProfile={false}
          userPoints={10}
          onSuggestClick={mockOnSuggestClick}
        />
      );

      const suggestButton = screen.getByText("Sugerir Idea").closest("button");
      if (suggestButton) {
        fireEvent.click(suggestButton);
      }

      expect(mockOnSuggestClick).toHaveBeenCalled();
    });

    it("should disable suggest button when userPoints is less than 3", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
          isAuthenticated={true}
          isOwnProfile={false}
          userPoints={2}
          onSuggestClick={mockOnSuggestClick}
        />
      );

      const suggestButton = screen
        .getByText("Sugerir Idea")
        .closest("button") as HTMLButtonElement;
      expect(suggestButton.disabled).toBe(true);
    });

    it("should not render suggest button when isOwnProfile is true", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
          isAuthenticated={true}
          isOwnProfile={true}
          onSuggestClick={mockOnSuggestClick}
        />
      );

      expect(screen.queryByText("Sugerir Idea")).toBeNull();
    });
  });

  describe("Login/Register Section", () => {
    it("should render login and register buttons when not authenticated", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(mockT).toHaveBeenCalledWith("common.login", "Iniciar sesión");
      expect(mockT).toHaveBeenCalledWith("common.register", "Crear cuenta");
    });

    it("should set localStorage and redirect when login button is clicked", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const loginButton = screen.getByText("Iniciar sesión").closest("button");
      if (loginButton) {
        fireEvent.click(loginButton);
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "redirectAfterAuth",
        expect.any(String)
      );
    });

    it("should set localStorage and redirect when register button is clicked", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const registerButton = screen.getByText("Crear cuenta").closest("button");
      if (registerButton) {
        fireEvent.click(registerButton);
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "redirectAfterAuth",
        expect.any(String)
      );
    });

    it("should not render login/register section when authenticated", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
          isAuthenticated={true}
        />
      );

      expect(screen.queryByText("Iniciar sesión")).toBeNull();
      expect(screen.queryByText("Crear cuenta")).toBeNull();
    });
  });

  describe("Settings Section", () => {
    it("should render theme and language toggles", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(screen.getByTestId("theme-toggle")).toBeTruthy();
      expect(screen.getByTestId("language-toggle")).toBeTruthy();
    });

    it("should show settings label when expanded", () => {
      render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(mockT).toHaveBeenCalledWith("common.settings", "Configuración");
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <ModernSidebar
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
          className="custom-class"
        />
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar?.className).toContain("custom-class");
    });
  });
});
