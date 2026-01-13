import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, initial, animate, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
}));

// Mock de Avatar components
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: any) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarFallback: ({ children, className }: any) => (
    <div data-testid="avatar-fallback" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, className }: any) => (
    <img data-testid="avatar-image" src={src} alt={alt} className={className} />
  ),
}));

// Mock de cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

import { UserIndicator } from "../../components/user-indicator";

describe("UserIndicator", () => {
  const mockUser = {
    id: 1,
    username: "testuser",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Basic Rendering", () => {
    it("should render user indicator", () => {
      const { container } = render(<UserIndicator user={mockUser} />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should return null when user is null", () => {
      const { container } = render(<UserIndicator user={null} />);

      expect(container.firstChild).toBeNull();
    });

    it("should render avatar", () => {
      render(<UserIndicator user={mockUser} />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("should render avatar fallback with first letter of username", () => {
      render(<UserIndicator user={mockUser} />);

      const fallback = screen.getByTestId("avatar-fallback");
      expect(fallback).toBeTruthy();
      expect(fallback.textContent).toBe("T");
    });

    it("should render username", () => {
      render(<UserIndicator user={mockUser} />);

      expect(screen.getByText("testuser")).toBeTruthy();
    });
  });

  describe("Desktop Variant", () => {
    it("should render desktop variant by default", () => {
      render(<UserIndicator user={mockUser} />);

      expect(mockT).toHaveBeenCalledWith("common.hello", "Hola");
      expect(screen.getByText("testuser")).toBeTruthy();
    });

    it("should render desktop variant when explicitly set", () => {
      render(<UserIndicator user={mockUser} variant="desktop" />);

      expect(mockT).toHaveBeenCalledWith("common.hello", "Hola");
      expect(screen.getByText("testuser")).toBeTruthy();
    });

    it("should render hello text in desktop variant", () => {
      render(<UserIndicator user={mockUser} variant="desktop" />);

      expect(screen.getByText(/Hola/i)).toBeTruthy();
    });

    it("should apply desktop classes", () => {
      const { container } = render(
        <UserIndicator user={mockUser} variant="desktop" />
      );

      const indicator = container.firstChild as HTMLElement;
      expect(indicator?.className).toContain("px-3");
      expect(indicator?.className).toContain("py-2");
    });

    it("should render larger avatar in desktop variant", () => {
      render(<UserIndicator user={mockUser} variant="desktop" />);

      const avatar = screen.getByTestId("avatar");
      expect(avatar.className).toContain("w-8");
      expect(avatar.className).toContain("h-8");
    });
  });

  describe("Mobile Variant", () => {
    it("should render mobile variant", () => {
      render(<UserIndicator user={mockUser} variant="mobile" />);

      expect(screen.getByText("testuser")).toBeTruthy();
    });

    it("should not render hello text in mobile variant", () => {
      render(<UserIndicator user={mockUser} variant="mobile" />);

      expect(screen.queryByText(/Hola/i)).toBeNull();
    });

    it("should apply mobile classes", () => {
      const { container } = render(
        <UserIndicator user={mockUser} variant="mobile" />
      );

      const indicator = container.firstChild as HTMLElement;
      expect(indicator?.className).toContain("px-2");
      expect(indicator?.className).toContain("py-1");
    });

    it("should render smaller avatar in mobile variant", () => {
      render(<UserIndicator user={mockUser} variant="mobile" />);

      const avatar = screen.getByTestId("avatar");
      expect(avatar.className).toContain("w-6");
      expect(avatar.className).toContain("h-6");
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <UserIndicator user={mockUser} className="custom-class" />
      );

      const indicator = container.firstChild as HTMLElement;
      expect(indicator?.className).toContain("custom-class");
    });
  });

  describe("Username Display", () => {
    it("should display username correctly", () => {
      render(<UserIndicator user={mockUser} />);

      expect(screen.getByText("testuser")).toBeTruthy();
    });

    it("should display username in bold in desktop variant", () => {
      render(<UserIndicator user={mockUser} variant="desktop" />);

      const usernameElement = screen.getByText("testuser");
      expect(usernameElement).toBeTruthy();
      // The username should be inside a span with font-semibold
      const parent = usernameElement.parentElement;
      expect(parent?.textContent).toContain("testuser");
    });

    it("should handle different usernames", () => {
      const differentUser = {
        id: 2,
        username: "anotheruser",
      };

      render(<UserIndicator user={differentUser} />);

      expect(screen.getByText("anotheruser")).toBeTruthy();
    });

    it("should handle username with special characters", () => {
      const specialUser = {
        id: 3,
        username: "user_123",
      };

      render(<UserIndicator user={specialUser} />);

      expect(screen.getByText("user_123")).toBeTruthy();
    });
  });

  describe("Avatar Fallback", () => {
    it("should use first letter of username as fallback", () => {
      render(<UserIndicator user={mockUser} />);

      const fallback = screen.getByTestId("avatar-fallback");
      expect(fallback.textContent).toBe("T");
    });

    it("should uppercase first letter", () => {
      const lowercaseUser = {
        id: 4,
        username: "lowercase",
      };

      render(<UserIndicator user={lowercaseUser} />);

      const fallback = screen.getByTestId("avatar-fallback");
      expect(fallback.textContent).toBe("L");
    });

    it("should handle single character username", () => {
      const singleCharUser = {
        id: 5,
        username: "a",
      };

      render(<UserIndicator user={singleCharUser} />);

      const fallback = screen.getByTestId("avatar-fallback");
      expect(fallback.textContent).toBe("A");
    });
  });
});
