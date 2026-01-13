import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DemoDialog from "../../components/demo-dialog";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de Dialog components
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? (
      <div data-testid="dialog" onClick={() => onOpenChange(false)}>
        {children}
      </div>
    ) : null,
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
}));

// Mock de imagen
jest.mock("@assets/DemoGIF.gif", () => "demo-gif.gif");

describe("DemoDialog", () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Visibility", () => {
    it("should not render when open is false", () => {
      render(<DemoDialog open={false} onOpenChange={mockOnOpenChange} />);

      expect(screen.queryByTestId("dialog")).toBeNull();
    });

    it("should render when open is true", () => {
      render(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByTestId("dialog")).toBeTruthy();
    });
  });

  describe("Content", () => {
    it("should render title", () => {
      render(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByTestId("dialog-title")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("landing.demo.title");
    });

    it("should render description", () => {
      render(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByTestId("dialog-description")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("landing.demo.description");
    });

    it("should render demo image", () => {
      render(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
      const demoImage = images.find(
        (img) => img.getAttribute("src") === "demo-gif.gif"
      );
      expect(demoImage).toBeTruthy();
    });

    it("should render image alt text", () => {
      render(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      expect(mockT).toHaveBeenCalledWith("landing.demo.alt");
    });

    it("should render details text", () => {
      render(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      expect(mockT).toHaveBeenCalledWith("landing.demo.details");
    });
  });

  describe("Dialog Structure", () => {
    it("should render dialog content with correct className", () => {
      const { container } = render(
        <DemoDialog open={true} onOpenChange={mockOnOpenChange} />
      );

      const dialogContent = screen.getByTestId("dialog-content");
      const className =
        typeof dialogContent.className === "string"
          ? dialogContent.className
          : Array.from(dialogContent.className || []).join(" ");
      expect(className).toContain("sm:max-w-3xl");
    });

    it("should render dialog header", () => {
      render(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByTestId("dialog-header")).toBeTruthy();
    });
  });

  describe("Dialog Close", () => {
    it("should call onOpenChange when dialog is closed", () => {
      render(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      const dialog = screen.getByTestId("dialog");
      fireEvent.click(dialog);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid open/close changes", () => {
      const { rerender } = render(
        <DemoDialog open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByTestId("dialog")).toBeTruthy();

      rerender(<DemoDialog open={false} onOpenChange={mockOnOpenChange} />);

      expect(screen.queryByTestId("dialog")).toBeNull();

      rerender(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByTestId("dialog")).toBeTruthy();
    });

    it("should handle onOpenChange callback", () => {
      render(<DemoDialog open={true} onOpenChange={mockOnOpenChange} />);

      const dialog = screen.getByTestId("dialog");
      fireEvent.click(dialog);

      expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
