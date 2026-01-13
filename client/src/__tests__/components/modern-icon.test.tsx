import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ModernIcon, IconBadge } from "../../components/modern-icon";

// Mock de lucide-react icon
const MockIcon = jest.fn(({ className }) => (
  <div data-testid="mock-icon" className={className} />
));

// Mock de framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      whileHover,
      whileTap,
      transition,
      animate,
      className,
    }: any) => (
      <div
        data-testid="motion-div"
        data-while-hover={JSON.stringify(whileHover)}
        data-while-tap={JSON.stringify(whileTap)}
        data-transition={JSON.stringify(transition)}
        data-animate={JSON.stringify(animate)}
        className={className}
      >
        {children}
      </div>
    ),
  },
}));

describe("ModernIcon", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render icon", () => {
      const { container } = render(<ModernIcon icon={MockIcon as any} />);

      expect(container.querySelector('[data-testid="mock-icon"]')).toBeTruthy();
    });

    it("should apply default size (md)", () => {
      render(<ModernIcon icon={MockIcon as any} />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("h-5");
      expect(icon?.className).toContain("w-5");
    });

    it("should apply default variant (primary)", () => {
      render(<ModernIcon icon={MockIcon as any} />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("text-primary");
    });
  });

  describe("Size Variants", () => {
    it("should apply sm size", () => {
      render(<ModernIcon icon={MockIcon as any} size="sm" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("h-4");
      expect(icon?.className).toContain("w-4");
    });

    it("should apply md size", () => {
      render(<ModernIcon icon={MockIcon as any} size="md" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("h-5");
      expect(icon?.className).toContain("w-5");
    });

    it("should apply lg size", () => {
      render(<ModernIcon icon={MockIcon as any} size="lg" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("h-6");
      expect(icon?.className).toContain("w-6");
    });

    it("should apply xl size", () => {
      render(<ModernIcon icon={MockIcon as any} size="xl" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("h-8");
      expect(icon?.className).toContain("w-8");
    });
  });

  describe("Variant Colors", () => {
    it("should apply primary variant", () => {
      render(<ModernIcon icon={MockIcon as any} variant="primary" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("text-primary");
    });

    it("should apply secondary variant", () => {
      render(<ModernIcon icon={MockIcon as any} variant="secondary" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("text-muted-foreground");
    });

    it("should apply success variant", () => {
      render(<ModernIcon icon={MockIcon as any} variant="success" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("text-green-500");
    });

    it("should apply warning variant", () => {
      render(<ModernIcon icon={MockIcon as any} variant="warning" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("text-yellow-500");
    });

    it("should apply error variant", () => {
      render(<ModernIcon icon={MockIcon as any} variant="error" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("text-red-500");
    });
  });

  describe("Animation", () => {
    it("should render without animation by default", () => {
      const { container } = render(<ModernIcon icon={MockIcon as any} />);

      expect(container.querySelector('[data-testid="motion-div"]')).toBeNull();
    });

    it("should render with motion.div when animated is true", () => {
      const { container } = render(
        <ModernIcon icon={MockIcon as any} animated={true} />
      );

      expect(
        container.querySelector('[data-testid="motion-div"]')
      ).toBeTruthy();
    });

    it("should have hover and tap animations when animated", () => {
      const { container } = render(
        <ModernIcon icon={MockIcon as any} animated={true} />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      const whileHover = JSON.parse(
        motionDiv?.getAttribute("data-while-hover") || "{}"
      );
      const whileTap = JSON.parse(
        motionDiv?.getAttribute("data-while-tap") || "{}"
      );

      expect(whileHover.scale).toBe(1.1);
      expect(whileHover.rotate).toBe(5);
      expect(whileTap.scale).toBe(0.95);
    });

    it("should have spring transition when animated", () => {
      const { container } = render(
        <ModernIcon icon={MockIcon as any} animated={true} />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      const transition = JSON.parse(
        motionDiv?.getAttribute("data-transition") || "{}"
      );

      expect(transition.type).toBe("spring");
      expect(transition.stiffness).toBe(400);
      expect(transition.damping).toBe(10);
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className", () => {
      render(<ModernIcon icon={MockIcon as any} className="custom-class" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("custom-class");
    });
  });
});

describe("IconBadge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render icon badge", () => {
      const { container } = render(<IconBadge icon={MockIcon as any} />);

      expect(container.querySelector('[data-testid="mock-icon"]')).toBeTruthy();
    });

    it("should apply default size (md)", () => {
      const { container } = render(<IconBadge icon={MockIcon as any} />);

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("h-10");
      expect(motionDiv?.className).toContain("w-10");
    });

    it("should have gradient background", () => {
      const { container } = render(<IconBadge icon={MockIcon as any} />);

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("bg-gradient-to-br");
      expect(motionDiv?.className).toContain("from-primary");
      expect(motionDiv?.className).toContain("to-primary/80");
    });

    it("should have rounded-full and shadow", () => {
      const { container } = render(<IconBadge icon={MockIcon as any} />);

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("rounded-full");
      expect(motionDiv?.className).toContain("shadow-lg");
    });
  });

  describe("Size Variants", () => {
    it("should apply sm size", () => {
      const { container } = render(
        <IconBadge icon={MockIcon as any} size="sm" />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("h-8");
      expect(motionDiv?.className).toContain("w-8");
    });

    it("should apply md size", () => {
      const { container } = render(
        <IconBadge icon={MockIcon as any} size="md" />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("h-10");
      expect(motionDiv?.className).toContain("w-10");
    });

    it("should apply lg size", () => {
      const { container } = render(
        <IconBadge icon={MockIcon as any} size="lg" />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("h-12");
      expect(motionDiv?.className).toContain("w-12");
    });

    it("should apply xl size", () => {
      const { container } = render(
        <IconBadge icon={MockIcon as any} size="xl" />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("h-16");
      expect(motionDiv?.className).toContain("w-16");
    });
  });

  describe("Icon Size in Badge", () => {
    it("should apply correct icon size for sm badge", () => {
      render(<IconBadge icon={MockIcon as any} size="sm" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("h-4");
      expect(icon?.className).toContain("w-4");
    });

    it("should apply correct icon size for md badge", () => {
      render(<IconBadge icon={MockIcon as any} size="md" />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("h-5");
      expect(icon?.className).toContain("w-5");
    });

    it("should apply white color to icon", () => {
      render(<IconBadge icon={MockIcon as any} />);

      const icon = document.querySelector('[data-testid="mock-icon"]');
      expect(icon?.className).toContain("text-white");
    });
  });

  describe("Gradient", () => {
    it("should apply default gradient", () => {
      const { container } = render(<IconBadge icon={MockIcon as any} />);

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("from-primary");
      expect(motionDiv?.className).toContain("to-primary/80");
    });

    it("should apply custom gradient", () => {
      const { container } = render(
        <IconBadge
          icon={MockIcon as any}
          gradient="from-blue-500 to-purple-500"
        />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("from-blue-500");
      expect(motionDiv?.className).toContain("to-purple-500");
    });
  });

  describe("Pulse Animation", () => {
    it("should not pulse by default", () => {
      const { container } = render(<IconBadge icon={MockIcon as any} />);

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      const animate = JSON.parse(
        motionDiv?.getAttribute("data-animate") || "{}"
      );
      expect(animate).toEqual({});
    });

    it("should pulse when pulse is true", () => {
      const { container } = render(
        <IconBadge icon={MockIcon as any} pulse={true} />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      const animate = JSON.parse(
        motionDiv?.getAttribute("data-animate") || "{}"
      );
      expect(Array.isArray(animate.scale)).toBe(true);
      expect(animate.scale).toEqual([1, 1.05, 1]);
    });

    it("should have pulse transition when pulse is true", () => {
      const { container } = render(
        <IconBadge icon={MockIcon as any} pulse={true} />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      const transition = JSON.parse(
        motionDiv?.getAttribute("data-transition") || "{}"
      );
      expect(transition.duration).toBe(2);
      // Infinity is serialized as null in JSON, so we check for the presence of repeat
      expect(transition.repeat).toBeDefined();
      expect(transition.ease).toBe("easeInOut");
    });
  });

  describe("Hover and Tap Animations", () => {
    it("should have hover animation", () => {
      const { container } = render(<IconBadge icon={MockIcon as any} />);

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      const whileHover = JSON.parse(
        motionDiv?.getAttribute("data-while-hover") || "{}"
      );
      expect(whileHover.scale).toBe(1.1);
    });

    it("should have tap animation", () => {
      const { container } = render(<IconBadge icon={MockIcon as any} />);

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      const whileTap = JSON.parse(
        motionDiv?.getAttribute("data-while-tap") || "{}"
      );
      expect(whileTap.scale).toBe(0.95);
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <IconBadge icon={MockIcon as any} className="custom-class" />
      );

      const motionDiv = container.querySelector('[data-testid="motion-div"]');
      expect(motionDiv?.className).toContain("custom-class");
    });
  });
});
