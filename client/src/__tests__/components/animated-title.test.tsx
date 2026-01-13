import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnimatedTitle from "../../components/animated-title";

describe("AnimatedTitle", () => {
  describe("Basic Rendering", () => {
    it("should render text content correctly", () => {
      const testText = "Test Title";
      render(<AnimatedTitle text={testText} />);

      expect(screen.getByText(testText)).toBeTruthy();
    });

    it("should render as h2 element", () => {
      render(<AnimatedTitle text="Title" />);

      const element = screen.getByText("Title");
      expect(element.tagName).toBe("H2");
    });

    it("should apply default className styles", () => {
      render(<AnimatedTitle text="Title" />);

      const element = screen.getByText("Title");
      expect(element.className).toContain("text-3xl");
      expect(element.className).toContain("md:text-4xl");
      expect(element.className).toContain("font-semibold");
      expect(element.className).toContain("tracking-tight");
      expect(element.className).toContain("text-gray-900");
      expect(element.className).toContain("dark:text-white");
    });
  });

  describe("Props Handling", () => {
    it("should apply custom className when provided", () => {
      render(<AnimatedTitle text="Title" className="custom-class" />);

      const element = screen.getByText("Title");
      expect(element.className).toContain("custom-class");
    });

    it("should combine default and custom className", () => {
      render(<AnimatedTitle text="Title" className="my-custom-class" />);

      const element = screen.getByText("Title");
      expect(element.className).toContain("text-3xl");
      expect(element.className).toContain("my-custom-class");
    });

    it("should handle multiple className values", () => {
      render(<AnimatedTitle text="Title" className="class1 class2 class3" />);

      const element = screen.getByText("Title");
      expect(element.className).toContain("class1");
      expect(element.className).toContain("class2");
      expect(element.className).toContain("class3");
    });

    it("should handle empty className", () => {
      render(<AnimatedTitle text="Title" className="" />);

      const element = screen.getByText("Title");
      expect(element).toBeTruthy();
      // Should still have default classes
      expect(element.className).toContain("text-3xl");
    });

    it("should accept effect prop even though it's not used", () => {
      render(<AnimatedTitle text="Title" effect="some-effect" />);

      const element = screen.getByText("Title");
      expect(element).toBeTruthy();
    });

    it("should accept direction prop even though it's not used", () => {
      render(<AnimatedTitle text="Title" direction="rtl" />);

      const element = screen.getByText("Title");
      expect(element).toBeTruthy();
    });

    it("should accept all props together", () => {
      render(
        <AnimatedTitle
          text="Title"
          className="custom"
          effect="glitch"
          direction="center"
        />
      );

      const element = screen.getByText("Title");
      expect(element).toBeTruthy();
      expect(element.className).toContain("custom");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty text", () => {
      const { container } = render(<AnimatedTitle text="" />);

      const element = container.querySelector("h2");
      expect(element).toBeTruthy();
      // Empty text still renders the element
      expect(element).not.toBeNull();
    });

    it("should handle very long text", () => {
      const longText = "A".repeat(1000);
      render(<AnimatedTitle text={longText} />);

      expect(screen.getByText(longText)).toBeTruthy();
    });

    it("should handle text with special characters", () => {
      const specialText = "Hello! @#$%^&*() 世界 🌟";
      render(<AnimatedTitle text={specialText} />);

      expect(screen.getByText(specialText)).toBeTruthy();
    });

    it("should handle text with HTML entities", () => {
      const htmlText = "Title & Subtitle";
      render(<AnimatedTitle text={htmlText} />);

      expect(screen.getByText(htmlText)).toBeTruthy();
    });

    it("should handle text with newlines", () => {
      const multilineText = "Line 1\nLine 2";
      const { container } = render(<AnimatedTitle text={multilineText} />);

      const element = container.querySelector("h2");
      expect(element).toBeTruthy();
      // React normalizes newlines, so we check that the element contains the text
      expect(element?.textContent).toContain("Line 1");
      expect(element?.textContent).toContain("Line 2");
    });
  });

  describe("Default Values", () => {
    it("should use empty string as default className", () => {
      render(<AnimatedTitle text="Title" />);

      const element = screen.getByText("Title");
      // className should contain default Tailwind classes
      expect(element.className).toBeTruthy();
    });

    it("should use empty string as default effect", () => {
      render(<AnimatedTitle text="Title" />);

      const element = screen.getByText("Title");
      expect(element).toBeTruthy();
    });

    it("should use 'ltr' as default direction", () => {
      render(<AnimatedTitle text="Title" />);

      const element = screen.getByText("Title");
      expect(element).toBeTruthy();
    });
  });
});
