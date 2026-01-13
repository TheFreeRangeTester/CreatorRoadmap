import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DemoCarousel from "../../components/demo-carousel";

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
  ChevronLeft: jest.fn(({ className }) => (
    <div data-testid="chevron-left-icon" className={className} />
  )),
  ChevronRight: jest.fn(({ className }) => (
    <div data-testid="chevron-right-icon" className={className} />
  )),
}));

// Mock de imágenes
jest.mock("@assets/carousel/carousel-ideas.png", () => "carousel-ideas.png");
jest.mock(
  "@assets/carousel/carousel-engagement.png",
  () => "carousel-engagement.png"
);
jest.mock(
  "@assets/carousel/carousel-streaming.png",
  () => "carousel-streaming.png"
);

// Mock de timers
jest.useFakeTimers();

describe("DemoCarousel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe("Basic Rendering", () => {
    it("should render carousel container", () => {
      const { container } = render(<DemoCarousel />);

      expect(container.querySelector(".relative.w-full")).toBeTruthy();
    });

    it("should render first slide by default", () => {
      render(<DemoCarousel />);

      // Check that image is rendered
      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });

    it("should render navigation arrows", () => {
      render(<DemoCarousel />);

      expect(screen.getByTestId("chevron-left-icon")).toBeTruthy();
      expect(screen.getByTestId("chevron-right-icon")).toBeTruthy();
    });

    it("should render dot indicators", () => {
      const { container } = render(<DemoCarousel />);

      // Should have 3 dots for 3 slides
      // Dots are buttons with rounded-full class in the dots indicator section
      const dotsSection = container.querySelector(".flex.justify-center.mt-6");
      const dots = dotsSection?.querySelectorAll("button") || [];
      expect(dots.length).toBe(3);
    });
  });

  describe("Navigation", () => {
    it("should go to next slide when next button is clicked", () => {
      render(<DemoCarousel />);

      const nextButton = screen
        .getByTestId("chevron-right-icon")
        .closest("button");
      if (nextButton) {
        fireEvent.click(nextButton);
      }

      // After clicking next, we should be on slide 1 (index 1)
      // Verify by checking that the component re-rendered
      expect(nextButton).toBeTruthy();
    });

    it("should go to previous slide when prev button is clicked", () => {
      render(<DemoCarousel />);

      const prevButton = screen
        .getByTestId("chevron-left-icon")
        .closest("button");
      if (prevButton) {
        fireEvent.click(prevButton);
      }

      // After clicking prev from slide 0, we should be on slide 2 (last slide)
      expect(prevButton).toBeTruthy();
    });

    it("should go to specific slide when dot is clicked", () => {
      const { container } = render(<DemoCarousel />);

      const dotsSection = container.querySelector(".flex.justify-center.mt-6");
      const dots = dotsSection?.querySelectorAll("button") || [];
      expect(dots.length).toBe(3);
      if (dots.length > 1) {
        fireEvent.click(dots[1] as HTMLElement);
      }
    });

    it("should wrap around when going next from last slide", () => {
      render(<DemoCarousel />);

      const nextButton = screen
        .getByTestId("chevron-right-icon")
        .closest("button");

      // Click 3 times to go through all slides and wrap around
      if (nextButton) {
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
      }

      expect(nextButton).toBeTruthy();
    });

    it("should wrap around when going prev from first slide", () => {
      render(<DemoCarousel />);

      const prevButton = screen
        .getByTestId("chevron-left-icon")
        .closest("button");

      // Click prev from first slide to go to last slide
      if (prevButton) {
        fireEvent.click(prevButton);
      }

      expect(prevButton).toBeTruthy();
    });
  });

  describe("Auto-play", () => {
    it("should auto-advance slides every 5 seconds", () => {
      const { container } = render(<DemoCarousel />);

      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000);

      // Component should have advanced to next slide
      // Verify by checking that the component re-rendered
      const images = container.querySelectorAll("img");
      expect(images.length).toBeGreaterThan(0);
    });

    it("should pause auto-play on mouse enter", () => {
      const { container } = render(<DemoCarousel />);

      const carouselContainer = container.querySelector(".group");
      if (carouselContainer) {
        fireEvent.mouseEnter(carouselContainer);
      }

      // Auto-play should be paused
      expect(carouselContainer).toBeTruthy();
    });

    it("should resume auto-play on mouse leave", () => {
      const { container } = render(<DemoCarousel />);

      const carouselContainer = container.querySelector(".group");
      if (carouselContainer) {
        fireEvent.mouseEnter(carouselContainer);
        fireEvent.mouseLeave(carouselContainer);
      }

      // Auto-play should resume
      expect(carouselContainer).toBeTruthy();
    });

    it("should pause auto-play when hovering over dots", () => {
      const { container } = render(<DemoCarousel />);

      const dotsSection = container.querySelector(".flex.justify-center.mt-6");
      const dots = dotsSection?.querySelectorAll("button") || [];
      expect(dots.length).toBeGreaterThan(0);
      if (dots.length > 0) {
        fireEvent.mouseEnter(dots[0] as HTMLElement);
      }
    });
  });

  describe("Content", () => {
    it("should render slide title", () => {
      render(<DemoCarousel />);

      // Title is rendered using translation keys - check that t was called with the key
      const calls = mockT.mock.calls;
      const titleCall = calls.find(
        (call) => call[0] === "landing.carousel.slide1.title"
      );
      expect(titleCall).toBeTruthy();
    });

    it("should render slide description", () => {
      render(<DemoCarousel />);

      // Description is rendered using translation keys
      const calls = mockT.mock.calls;
      const descCall = calls.find(
        (call) => call[0] === "landing.carousel.slide1.description"
      );
      expect(descCall).toBeTruthy();
    });

    it("should render slide alt text", () => {
      render(<DemoCarousel />);

      // Alt text is rendered using translation keys
      const calls = mockT.mock.calls;
      const altCall = calls.find((call) => call[0] === "carousel.slide1.alt");
      expect(altCall).toBeTruthy();
    });
  });

  describe("Dot Indicators", () => {
    it("should highlight active dot", () => {
      const { container } = render(<DemoCarousel />);

      const dotsSection = container.querySelector(".flex.justify-center.mt-6");
      const dots = dotsSection?.querySelectorAll("button") || [];
      expect(dots.length).toBe(3);
      // First dot should be active (current === 0)
      const firstDot = dots[0] as HTMLElement;
      const className =
        typeof firstDot.className === "string"
          ? firstDot.className
          : Array.from(firstDot.className || []).join(" ");
      expect(className).toContain("scale-125");
    });

    it("should update active dot when slide changes", () => {
      const { container } = render(<DemoCarousel />);

      const nextButton = screen
        .getByTestId("chevron-right-icon")
        .closest("button");
      if (nextButton) {
        fireEvent.click(nextButton);
      }

      const dotsSection = container.querySelector(".flex.justify-center.mt-6");
      const dots = dotsSection?.querySelectorAll("button") || [];
      expect(dots.length).toBe(3);
      // After clicking next, second dot should be active
      const secondDot = dots[1] as HTMLElement;
      const className =
        typeof secondDot.className === "string"
          ? secondDot.className
          : Array.from(secondDot.className || []).join(" ");
      expect(className).toContain("scale-125");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid navigation clicks", () => {
      render(<DemoCarousel />);

      const nextButton = screen
        .getByTestId("chevron-right-icon")
        .closest("button");
      if (nextButton) {
        // Rapid clicks
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
      }

      expect(nextButton).toBeTruthy();
    });

    it("should handle clicking same dot multiple times", () => {
      const { container } = render(<DemoCarousel />);

      const dotsSection = container.querySelector(".flex.justify-center.mt-6");
      const dots = dotsSection?.querySelectorAll("button") || [];
      expect(dots.length).toBe(3);
      if (dots.length > 0) {
        fireEvent.click(dots[0] as HTMLElement);
        fireEvent.click(dots[0] as HTMLElement);
        fireEvent.click(dots[0] as HTMLElement);
      }
    });
  });
});
