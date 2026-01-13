import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProfileFAB } from "../../components/profile-fab";

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
} as any;

const mockUseAuth = jest.fn(() => ({
  user: mockUser,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock de wouter Link
jest.mock("wouter", () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className} data-testid={`link-${href}`}>
      {children}
    </a>
  ),
}));

describe("ProfileFAB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockUseAuth.mockReturnValue({ user: mockUser });
  });

  describe("Basic Rendering", () => {
    it("should render profile FAB", () => {
      const { container } = render(<ProfileFAB />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should not render when user is null", () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { container } = render(<ProfileFAB />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render when user is undefined", () => {
      mockUseAuth.mockReturnValue({ user: undefined });

      const { container } = render(<ProfileFAB />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Link", () => {
    it("should render link to profile", () => {
      render(<ProfileFAB />);

      expect(screen.getByTestId("link-/profile")).toBeTruthy();
    });

    it("should have correct href", () => {
      render(<ProfileFAB />);

      const link = screen.getByTestId("link-/profile");
      expect(link.getAttribute("href")).toBe("/profile");
    });
  });

  describe("Button", () => {
    it("should render button", () => {
      render(<ProfileFAB />);

      const link = screen.getByTestId("link-/profile");
      const button = link.querySelector("button");
      expect(button).toBeTruthy();
    });

    it("should have icon size", () => {
      render(<ProfileFAB />);

      const link = screen.getByTestId("link-/profile");
      const button = link.querySelector("button");
      expect(button?.getAttribute("data-size")).toBe("icon");
    });

    it("should have correct classes", () => {
      render(<ProfileFAB />);

      const link = screen.getByTestId("link-/profile");
      const button = link.querySelector("button");
      expect(button?.className).toContain("h-12");
      expect(button?.className).toContain("w-12");
      expect(button?.className).toContain("rounded-full");
    });
  });

  describe("Icon", () => {
    it("should render user icon", () => {
      render(<ProfileFAB />);

      expect(screen.getByTestId("user-icon")).toBeTruthy();
    });

    it("should have correct icon classes", () => {
      render(<ProfileFAB />);

      const icon = screen.getByTestId("user-icon");
      expect(icon.className).toContain("h-5");
      expect(icon.className).toContain("w-5");
    });
  });

  describe("Container", () => {
    it("should have fixed positioning classes", () => {
      const { container } = render(<ProfileFAB />);

      const div = container.firstChild as HTMLElement;
      expect(div?.className).toContain("fixed");
      expect(div?.className).toContain("bottom-20");
      expect(div?.className).toContain("right-4");
    });

    it("should have mobile-only visibility", () => {
      const { container } = render(<ProfileFAB />);

      const div = container.firstChild as HTMLElement;
      expect(div?.className).toContain("md:hidden");
    });

    it("should have z-index class", () => {
      const { container } = render(<ProfileFAB />);

      const div = container.firstChild as HTMLElement;
      expect(div?.className).toContain("z-50");
    });
  });
});
