import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EmptyState from "../../components/empty-state";

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
  Lightbulb: jest.fn(({ className }) => (
    <div data-testid="lightbulb-icon" className={className} />
  )),
  PlusCircle: jest.fn(({ className }) => (
    <div data-testid="plus-circle-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="button">
      {children}
    </button>
  ),
}));

// Mock de Link component (wouter)
jest.mock("wouter", () => ({
  Link: ({ href, children }: any) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}));

describe("EmptyState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Basic Rendering", () => {
    it("should render empty state container", () => {
      const { container } = render(<EmptyState />);

      const containerElement = container.querySelector(".bg-white");
      expect(containerElement).toBeTruthy();
    });

    it("should render lightbulb icon", () => {
      render(<EmptyState />);

      expect(screen.getByTestId("lightbulb-icon")).toBeTruthy();
    });

    it("should render title", () => {
      render(<EmptyState />);

      expect(screen.getByText("No ideas yet")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("ideas.noIdeasYet", "No ideas yet");
    });

    it("should render description", () => {
      render(<EmptyState />);

      expect(
        screen.getByText("Get started by creating a new idea.")
      ).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith(
        "ideas.getStarted",
        "Get started by creating a new idea."
      );
    });
  });

  describe("With onAddIdea callback", () => {
    it("should render button with onClick when onAddIdea is provided", () => {
      const mockOnAddIdea = jest.fn();
      render(<EmptyState onAddIdea={mockOnAddIdea} />);

      expect(screen.getByTestId("button")).toBeTruthy();
      expect(screen.queryByTestId("link")).toBeNull();
    });

    it("should call onAddIdea when button is clicked", () => {
      const mockOnAddIdea = jest.fn();
      render(<EmptyState onAddIdea={mockOnAddIdea} />);

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      expect(mockOnAddIdea).toHaveBeenCalledTimes(1);
    });

    it("should render 'Add an idea' text when onAddIdea is provided", () => {
      const mockOnAddIdea = jest.fn();
      render(<EmptyState onAddIdea={mockOnAddIdea} />);

      expect(screen.getByText("Add an idea")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("ideas.addIdea", "Add an idea");
    });

    it("should render plus circle icon in button", () => {
      const mockOnAddIdea = jest.fn();
      render(<EmptyState onAddIdea={mockOnAddIdea} />);

      expect(screen.getByTestId("plus-circle-icon")).toBeTruthy();
    });
  });

  describe("Without onAddIdea callback", () => {
    it("should render link when onAddIdea is not provided", () => {
      render(<EmptyState />);

      expect(screen.getByTestId("link")).toBeTruthy();
      expect(screen.queryByTestId("button")).toBeTruthy(); // Button is inside Link
    });

    it("should render link to /auth", () => {
      render(<EmptyState />);

      const link = screen.getByTestId("link");
      expect(link.getAttribute("href")).toBe("/auth");
    });

    it("should render 'Login to add an idea' text when onAddIdea is not provided", () => {
      render(<EmptyState />);

      expect(screen.getByText("Login to add an idea")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith(
        "ideas.loginToAdd",
        "Login to add an idea"
      );
    });

    it("should render plus circle icon in link button", () => {
      render(<EmptyState />);

      expect(screen.getByTestId("plus-circle-icon")).toBeTruthy();
    });
  });

  describe("Styling", () => {
    it("should apply correct container classes", () => {
      const { container } = render(<EmptyState />);

      const containerElement = container.querySelector(".bg-white");
      const className =
        typeof containerElement?.className === "string"
          ? containerElement.className
          : Array.from(containerElement?.className || []).join(" ");
      expect(className).toContain("bg-white");
      expect(className).toContain("dark:bg-gray-800");
      expect(className).toContain("p-8");
      expect(className).toContain("rounded-lg");
    });

    it("should apply dark mode classes to button", () => {
      const mockOnAddIdea = jest.fn();
      render(<EmptyState onAddIdea={mockOnAddIdea} />);

      const button = screen.getByTestId("button");
      const className =
        typeof button.className === "string"
          ? button.className
          : Array.from(button.className || []).join(" ");
      expect(className).toContain("dark:text-white");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined onAddIdea", () => {
      render(<EmptyState onAddIdea={undefined} />);

      // Should render link when onAddIdea is undefined
      expect(screen.getByTestId("link")).toBeTruthy();
    });

    it("should handle multiple rapid clicks on button", () => {
      const mockOnAddIdea = jest.fn();
      render(<EmptyState onAddIdea={mockOnAddIdea} />);

      const button = screen.getByTestId("button");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnAddIdea).toHaveBeenCalledTimes(3);
    });
  });
});
