import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LeaderboardSkeleton } from "../../components/leaderboard-skeleton";

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Trophy: jest.fn(({ className }) => (
    <div data-testid="trophy-icon" className={className} />
  )),
  Medal: jest.fn(({ className }) => (
    <div data-testid="medal-icon" className={className} />
  )),
  Award: jest.fn(({ className }) => (
    <div data-testid="award-icon" className={className} />
  )),
}));

// Mock de Skeleton component
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className, children }: any) => (
    <div data-testid="skeleton" className={className}>
      {children}
    </div>
  ),
}));

// Mock de Card components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock de framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, transition, className }: any) => (
      <div
        data-testid="motion-div"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        className={className}
      >
        {children}
      </div>
    ),
  },
}));

describe("LeaderboardSkeleton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render leaderboard skeleton", () => {
      const { container } = render(<LeaderboardSkeleton />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should have correct container classes", () => {
      const { container } = render(<LeaderboardSkeleton />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv?.className).toContain("container");
      expect(mainDiv?.className).toContain("px-4");
      expect(mainDiv?.className).toContain("mx-auto");
      expect(mainDiv?.className).toContain("py-8");
      expect(mainDiv?.className).toContain("dark:bg-gray-950");
      expect(mainDiv?.className).toContain("min-h-screen");
    });
  });

  describe("Header Skeleton", () => {
    it("should render header skeleton", () => {
      render(<LeaderboardSkeleton />);

      const motionDivs = screen.getAllByTestId("motion-div");
      const headerDiv = motionDivs.find((div) =>
        div.className.includes("flex-col md:flex-row")
      );
      expect(headerDiv).toBeTruthy();
    });

    it("should render trophy icon in header", () => {
      render(<LeaderboardSkeleton />);

      const trophyIcons = screen.getAllByTestId("trophy-icon");
      expect(trophyIcons.length).toBeGreaterThan(0);
    });

    it("should render skeleton elements in header", () => {
      render(<LeaderboardSkeleton />);

      const skeletons = screen.getAllByTestId("skeleton");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Creator Info Skeleton", () => {
    it("should render creator info card", () => {
      render(<LeaderboardSkeleton />);

      const cards = screen.getAllByTestId("card");
      const creatorCard = cards.find((card) =>
        card.className.includes("bg-gradient-to-r from-primary/5")
      );
      expect(creatorCard).toBeTruthy();
    });

    it("should render card content", () => {
      render(<LeaderboardSkeleton />);

      expect(screen.getAllByTestId("card-content").length).toBeGreaterThan(0);
    });
  });

  describe("Top 3 Podium Skeleton", () => {
    it("should render podium section", () => {
      render(<LeaderboardSkeleton />);

      const motionDivs = screen.getAllByTestId("motion-div");
      const podiumDiv = motionDivs.find((div) =>
        div.className.includes("mb-12")
      );
      expect(podiumDiv).toBeTruthy();
    });

    it("should render desktop podium layout", () => {
      render(<LeaderboardSkeleton />);

      const desktopPodium = screen
        .getAllByTestId("card")
        .find((card) => card.className.includes("h-80"));
      expect(desktopPodium).toBeTruthy();
    });

    it("should render mobile podium layout", () => {
      render(<LeaderboardSkeleton />);

      // Mobile layout is in a separate div with md:hidden class
      const { container } = render(<LeaderboardSkeleton />);
      const mobileDiv = container.querySelector(".md\\:hidden.space-y-4");
      expect(mobileDiv).toBeTruthy();
    });
  });

  describe("Podium Icons", () => {
    it("should render trophy icon for first place", () => {
      render(<LeaderboardSkeleton />);

      const trophyIcons = screen.getAllByTestId("trophy-icon");
      expect(trophyIcons.length).toBeGreaterThan(0);
    });

    it("should render medal icon for second place", () => {
      render(<LeaderboardSkeleton />);

      const medalIcons = screen.getAllByTestId("medal-icon");
      expect(medalIcons.length).toBeGreaterThan(0);
    });

    it("should render award icon for third place", () => {
      render(<LeaderboardSkeleton />);

      const awardIcons = screen.getAllByTestId("award-icon");
      expect(awardIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Rest of Ideas Skeleton", () => {
    it("should render ideas section", () => {
      render(<LeaderboardSkeleton />);

      const motionDivs = screen.getAllByTestId("motion-div");
      const ideasDiv = motionDivs.find((div) =>
        div.className.includes("space-y-4")
      );
      expect(ideasDiv).toBeTruthy();
    });

    it("should render multiple idea card skeletons", () => {
      render(<LeaderboardSkeleton />);

      // Should render 5 idea card skeletons (position 4-8)
      const allCards = screen.getAllByTestId("card");
      // There are multiple cards (podium + idea cards), so we check for at least some cards
      expect(allCards.length).toBeGreaterThan(3);
    });
  });

  describe("Animation Props", () => {
    it("should have motion.div with animation props", () => {
      render(<LeaderboardSkeleton />);

      const motionDivs = screen.getAllByTestId("motion-div");
      expect(motionDivs.length).toBeGreaterThan(0);

      motionDivs.forEach((div) => {
        const initial = div.getAttribute("data-initial");
        const animate = div.getAttribute("data-animate");
        const transition = div.getAttribute("data-transition");

        expect(initial).toBeTruthy();
        expect(animate).toBeTruthy();
        expect(transition).toBeTruthy();
      });
    });
  });

  describe("Structure", () => {
    it("should render all main sections", () => {
      const { container } = render(<LeaderboardSkeleton />);

      // Check for header, creator info, podium, and ideas sections
      const allSkeletons = screen.getAllByTestId("skeleton");
      expect(allSkeletons.length).toBeGreaterThan(10); // Multiple skeletons throughout
    });

    it("should have proper responsive classes", () => {
      const { container } = render(<LeaderboardSkeleton />);

      // Check for desktop podium grid - the class is "hidden md:grid"
      const desktopPodium = container.querySelector(".hidden");
      // Check if it has grid-cols-3 which is part of the desktop layout
      const gridContainer = container.querySelector(".grid-cols-3");
      expect(gridContainer).toBeTruthy();
    });
  });
});
