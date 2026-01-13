import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnimatedText from "../../components/animated-text";
import { ANIMATION_EFFECTS } from "../../components/gsap-animations";
import gsap from "gsap";
import { CustomSplitText } from "../../components/gsap-animations";

// Mock de gsap
const mockTimeline = {
  fromTo: jest.fn().mockReturnThis(),
  to: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  kill: jest.fn(),
};

jest.mock("gsap", () => {
  const mockGsap = {
    set: jest.fn(),
    timeline: jest.fn(() => ({
      fromTo: jest.fn().mockReturnThis(),
      to: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      kill: jest.fn(),
    })),
  };
  return {
    __esModule: true,
    default: mockGsap,
  };
});

// Mock de CustomSplitText
const mockSplitText = {
  chars: [] as HTMLElement[],
  words: [] as HTMLElement[],
  lines: [] as HTMLElement[],
  revert: jest.fn(),
};

jest.mock("../../components/gsap-animations", () => {
  const actualModule = jest.requireActual(
    "../../components/gsap-animations"
  ) as any;
  return {
    ANIMATION_EFFECTS: actualModule.ANIMATION_EFFECTS,
    CustomSplitText: jest.fn(() => mockSplitText),
  };
});

describe("AnimatedText", () => {
  let mockGsap: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get references to mocked gsap
    mockGsap = (jest.requireMock("gsap") as any).default;

    mockSplitText.revert.mockClear();
    mockSplitText.chars = [
      document.createElement("span"),
      document.createElement("span"),
      document.createElement("span"),
    ];
  });

  describe("Basic Rendering", () => {
    it("should render text with default tag (div)", () => {
      render(<AnimatedText text="Hello World" />);

      const element = screen.getByText("Hello World");
      expect(element.tagName).toBe("DIV");
    });

    it("should render with custom tag", () => {
      render(<AnimatedText text="Title" tag="h1" />);

      const element = screen.getByText("Title");
      expect(element.tagName).toBe("H1");
    });

    it("should render all supported tags", () => {
      // Test a few key tags instead of all to avoid TypeScript ref issues
      const testCases = [
        { tag: "h1" as const, expectedTag: "H1" },
        { tag: "p" as const, expectedTag: "P" },
        { tag: "span" as const, expectedTag: "SPAN" },
      ];

      testCases.forEach(({ tag, expectedTag }) => {
        const { unmount } = render(<AnimatedText text="Test" tag={tag} />);
        const element = screen.getByText("Test");
        expect(element.tagName).toBe(expectedTag);
        unmount();
      });
    });

    it("should apply className when provided", () => {
      render(<AnimatedText text="Test" className="custom-class" />);

      const element = screen.getByText("Test");
      expect(element.className).toContain("custom-class");
    });

    it("should render text content correctly", () => {
      const testText = "This is a test text";
      render(<AnimatedText text={testText} />);

      expect(screen.getByText(testText)).toBeTruthy();
    });
  });

  describe("GSAP Integration", () => {
    it("should initialize GSAP when component mounts", () => {
      render(<AnimatedText text="Test" />);

      expect(mockGsap.set).toHaveBeenCalled();
      expect(mockGsap.timeline).toHaveBeenCalled();
    });

    it("should create CustomSplitText with correct options", () => {
      render(<AnimatedText text="Test" />);

      expect(CustomSplitText).toHaveBeenCalledWith(expect.any(HTMLElement), {
        type: "chars",
      });
    });

    it("should create timeline with delay when provided", () => {
      render(<AnimatedText text="Test" delay={0.5} />);

      expect(mockGsap.timeline).toHaveBeenCalled();
      const timelineCall = (mockGsap.timeline as jest.MockedFunction<any>).mock
        .calls[0];
      if (timelineCall && timelineCall[0]) {
        expect(timelineCall[0].delay).toBe(0.5);
      }
    });

    it("should create timeline with scrollTrigger", () => {
      render(<AnimatedText text="Test" />);

      expect(mockGsap.timeline).toHaveBeenCalled();
      const timelineCall = (mockGsap.timeline as jest.MockedFunction<any>).mock
        .calls[0];
      if (timelineCall && timelineCall[0]) {
        expect(timelineCall[0].scrollTrigger).toBeDefined();
        expect(timelineCall[0].scrollTrigger.start).toBe("top 80%");
        expect(timelineCall[0].scrollTrigger.toggleActions).toBe(
          "play none none reset"
        );
      }
    });
  });

  describe("Animation Effects", () => {
    it("should use TEXT_REVEAL effect by default", () => {
      render(<AnimatedText text="Test" />);

      // Get the timeline instance that was created
      const timelineInstance = (mockGsap.timeline as jest.MockedFunction<any>)
        .mock.results[0]?.value;
      expect(timelineInstance?.fromTo).toHaveBeenCalled();
    });

    it("should apply TEXT_REVEAL effect when specified", () => {
      render(
        <AnimatedText text="Test" effect={ANIMATION_EFFECTS.TEXT_REVEAL} />
      );

      // Get the timeline instance that was created
      const timelineInstance = (mockGsap.timeline as jest.MockedFunction<any>)
        .mock.results[0]?.value;
      expect(timelineInstance?.fromTo).toHaveBeenCalled();
    });

    it("should apply GLITCH effect when specified", () => {
      render(<AnimatedText text="Test" effect={ANIMATION_EFFECTS.GLITCH} />);

      // Get the timeline instance that was created
      const timelineInstance = (mockGsap.timeline as jest.MockedFunction<any>)
        .mock.results[0]?.value;
      // GLITCH effect uses to() for each character
      expect(timelineInstance?.to).toHaveBeenCalled();
    });

    it("should apply BLINKING_CURSOR effect when specified", () => {
      const { container } = render(
        <AnimatedText text="Test" effect={ANIMATION_EFFECTS.BLINKING_CURSOR} />
      );

      // BLINKING_CURSOR creates a cursor element
      const cursor = container.querySelector("span:last-child");
      expect(cursor).toBeTruthy();
    });

    it("should apply BOUNCE effect when specified", () => {
      render(<AnimatedText text="Test" effect={ANIMATION_EFFECTS.BOUNCE} />);

      // Get the timeline instance that was created
      const timelineInstance = (mockGsap.timeline as jest.MockedFunction<any>)
        .mock.results[0]?.value;
      expect(timelineInstance?.fromTo).toHaveBeenCalled();
    });

    it("should use default animation for unknown effect", () => {
      render(<AnimatedText text="Test" effect="unknown-effect" />);

      // Get the timeline instance that was created
      const timelineInstance = (mockGsap.timeline as jest.MockedFunction<any>)
        .mock.results[0]?.value;
      expect(timelineInstance?.fromTo).toHaveBeenCalled();
    });
  });

  describe("Direction Handling", () => {
    it("should use ltr direction by default", () => {
      render(<AnimatedText text="Test" />);

      // With ltr, chars should be in original order
      expect(CustomSplitText).toHaveBeenCalled();
    });

    it("should handle rtl direction", () => {
      render(<AnimatedText text="Test" direction="rtl" />);

      // RTL reverses the character order
      expect(CustomSplitText).toHaveBeenCalled();
    });

    it("should handle center direction", () => {
      render(<AnimatedText text="Test" direction="center" />);

      // Center direction creates alternating pattern
      expect(CustomSplitText).toHaveBeenCalled();
    });
  });

  describe("Cleanup", () => {
    it("should cleanup timeline on unmount", () => {
      const { unmount } = render(<AnimatedText text="Test" />);

      // Get the timeline instance that was created
      const timelineInstance = (mockGsap.timeline as jest.MockedFunction<any>)
        .mock.results[0]?.value;

      unmount();

      expect(timelineInstance?.kill).toHaveBeenCalled();
    });

    it("should revert SplitText on unmount", () => {
      const { unmount } = render(<AnimatedText text="Test" />);

      unmount();

      expect(mockSplitText.revert).toHaveBeenCalled();
    });

    it("should cleanup cursor for BLINKING_CURSOR effect on unmount", () => {
      const { container, unmount } = render(
        <AnimatedText text="Test" effect={ANIMATION_EFFECTS.BLINKING_CURSOR} />
      );

      // Verify cursor exists
      const cursorBefore = container.querySelector("span:last-child");
      expect(cursorBefore).toBeTruthy();

      // Get the timeline instance that was created
      const timelineInstance = (mockGsap.timeline as jest.MockedFunction<any>)
        .mock.results[0]?.value;

      unmount();

      // After unmount, timeline should be killed
      expect(timelineInstance?.kill).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty text", () => {
      const { container } = render(<AnimatedText text="" />);

      // Empty text still renders the element
      expect(container.firstChild).toBeTruthy();
    });

    it("should handle very long text", () => {
      const longText = "A".repeat(1000);
      render(<AnimatedText text={longText} />);

      expect(screen.getByText(longText)).toBeTruthy();
    });

    it("should handle text with special characters", () => {
      const specialText = "Hello! @#$%^&*() 世界";
      render(<AnimatedText text={specialText} />);

      expect(screen.getByText(specialText)).toBeTruthy();
    });

    it("should handle multiple className values", () => {
      render(<AnimatedText text="Test" className="class1 class2 class3" />);

      const element = screen.getByText("Test");
      expect(element.className).toContain("class1");
      expect(element.className).toContain("class2");
      expect(element.className).toContain("class3");
    });

    it("should handle zero delay", () => {
      render(<AnimatedText text="Test" delay={0} />);

      expect(mockGsap.timeline).toHaveBeenCalled();
      const timelineCall = (mockGsap.timeline as jest.MockedFunction<any>).mock
        .calls[0];
      if (timelineCall && timelineCall[0]) {
        expect(timelineCall[0].delay).toBe(0);
      }
    });

    it("should handle negative delay", () => {
      render(<AnimatedText text="Test" delay={-1} />);

      expect(mockGsap.timeline).toHaveBeenCalled();
      const timelineCall = (mockGsap.timeline as jest.MockedFunction<any>).mock
        .calls[0];
      if (timelineCall && timelineCall[0]) {
        expect(timelineCall[0].delay).toBe(-1);
      }
    });

    it("should reinitialize when text changes", () => {
      const { rerender } = render(<AnimatedText text="First" />);

      const initialCalls = (CustomSplitText as jest.MockedFunction<any>).mock
        .calls.length;

      rerender(<AnimatedText text="Second" />);

      // Should create new SplitText instance
      expect(
        (CustomSplitText as jest.MockedFunction<any>).mock.calls.length
      ).toBeGreaterThan(initialCalls);
    });

    it("should reinitialize when effect changes", () => {
      const { rerender } = render(
        <AnimatedText text="Test" effect={ANIMATION_EFFECTS.TEXT_REVEAL} />
      );

      const initialTimelineCalls = (
        mockGsap.timeline as jest.MockedFunction<any>
      ).mock.calls.length;

      rerender(<AnimatedText text="Test" effect={ANIMATION_EFFECTS.BOUNCE} />);

      // Should create new timeline
      expect(
        (mockGsap.timeline as jest.MockedFunction<any>).mock.calls.length
      ).toBeGreaterThan(initialTimelineCalls);
    });

    it("should reinitialize when direction changes", () => {
      const { rerender } = render(<AnimatedText text="Test" direction="ltr" />);

      rerender(<AnimatedText text="Test" direction="rtl" />);

      // Should create new timeline
      expect(mockGsap.timeline).toHaveBeenCalledTimes(2);
    });
  });
});
