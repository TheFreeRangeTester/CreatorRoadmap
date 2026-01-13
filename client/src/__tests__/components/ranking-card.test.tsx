import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock de gsap - debe estar antes del import del componente
const mockGsapFromTo = jest.fn();
jest.mock("gsap", () => ({
  gsap: {
    fromTo: mockGsapFromTo,
  },
}));

import RankingCard from "../../components/ranking-card";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de gsap ya está definido arriba

// Mock de framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      transition,
      whileHover,
      className,
    }: any) => (
      <div
        data-testid="motion-div"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        data-while-hover={JSON.stringify(whileHover)}
        className={className}
      >
        {children}
      </div>
    ),
  },
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronUp: jest.fn(({ className }) => (
    <div data-testid="chevron-up-icon" className={className} />
  )),
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
  ThumbsUp: jest.fn(({ className }) => (
    <div data-testid="thumbs-up-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    "aria-label": ariaLabel,
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

// Mock de Card component
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
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
(window as any).location = { href: "http://localhost:3000" };

describe("RankingCard", () => {
  const mockIdea = {
    id: 1,
    title: "Test Idea",
    description: "Test Description",
    votes: 10,
  };

  const mockOnVote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockLocalStorage.setItem.mockClear();
    mockGsapFromTo.mockClear();
  });

  describe("Basic Rendering", () => {
    it("should render ranking card", () => {
      const { container } = render(<RankingCard rank={1} idea={mockIdea} />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render idea title", () => {
      render(<RankingCard rank={1} idea={mockIdea} />);

      expect(screen.getByText("Test Idea")).toBeTruthy();
    });

    it("should render idea description", () => {
      render(<RankingCard rank={1} idea={mockIdea} />);

      expect(screen.getByText("Test Description")).toBeTruthy();
    });

    it("should render votes count", () => {
      render(<RankingCard rank={1} idea={mockIdea} />);

      expect(screen.getByText("10")).toBeTruthy();
    });
  });

  describe("Rank Display", () => {
    it("should display rank number for ranks > 3", () => {
      render(<RankingCard rank={4} idea={mockIdea} />);

      expect(screen.getByText("#4")).toBeTruthy();
    });

    it("should not display rank number for top 3", () => {
      render(<RankingCard rank={1} idea={mockIdea} />);

      expect(screen.queryByText("#1")).toBeNull();
    });

    it("should display trophy emoji for rank 1", () => {
      const { container } = render(<RankingCard rank={1} idea={mockIdea} />);

      expect(container.textContent).toContain("🏆");
    });

    it("should display silver medal emoji for rank 2", () => {
      const { container } = render(<RankingCard rank={2} idea={mockIdea} />);

      expect(container.textContent).toContain("🥈");
    });

    it("should display bronze medal emoji for rank 3", () => {
      const { container } = render(<RankingCard rank={3} idea={mockIdea} />);

      expect(container.textContent).toContain("🥉");
    });
  });

  describe("Vote Button - Not Logged In", () => {
    it("should render vote button when not logged in", () => {
      render(<RankingCard rank={1} idea={mockIdea} isLoggedIn={false} />);

      expect(screen.getByTestId("chevron-up-icon")).toBeTruthy();
    });

    it("should redirect to auth when vote button is clicked and not logged in", () => {
      // Mock window.location.href setter
      const originalLocation = (window as any).location;
      delete (window as any).location;
      (window as any).location = { href: "http://localhost:3000" };

      render(<RankingCard rank={1} idea={mockIdea} isLoggedIn={false} />);

      const button = screen
        .getByLabelText(/common.loginToVote/i)
        .closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "redirectAfterAuth",
        expect.any(String)
      );

      // Restore location
      (window as any).location = originalLocation;
    });
  });

  describe("Vote Button - Logged In", () => {
    it("should render vote button when logged in and not voted", () => {
      render(
        <RankingCard
          rank={1}
          idea={mockIdea}
          isLoggedIn={true}
          isVoted={false}
        />
      );

      expect(screen.getByTestId("chevron-up-icon")).toBeTruthy();
    });

    it("should call onVote when vote button is clicked", () => {
      render(
        <RankingCard
          rank={1}
          idea={mockIdea}
          isLoggedIn={true}
          isVoted={false}
          onVote={mockOnVote}
        />
      );

      const button = screen.getByLabelText("Votar").closest("button");
      if (button) {
        fireEvent.click(button);
      }

      expect(mockOnVote).toHaveBeenCalledWith(1);
    });

    it("should disable button when voting", () => {
      render(
        <RankingCard
          rank={1}
          idea={mockIdea}
          isLoggedIn={true}
          isVoting={true}
        />
      );

      const button = screen.getByLabelText("Votar").closest("button");
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    it("should show loader when voting", () => {
      render(
        <RankingCard
          rank={1}
          idea={mockIdea}
          isLoggedIn={true}
          isVoting={true}
        />
      );

      expect(screen.getByTestId("loader-icon")).toBeTruthy();
    });

    it("should show thumbs up when vote is successful", () => {
      render(
        <RankingCard
          rank={1}
          idea={mockIdea}
          isLoggedIn={true}
          isSuccessVote={true}
        />
      );

      expect(screen.getByTestId("thumbs-up-icon")).toBeTruthy();
    });

    it("should show disabled button when already voted", () => {
      render(
        <RankingCard
          rank={1}
          idea={mockIdea}
          isLoggedIn={true}
          isVoted={true}
        />
      );

      const button = screen.getByLabelText("Ya votado").closest("button");
      expect((button as HTMLButtonElement).disabled).toBe(true);
      expect(screen.getByTestId("thumbs-up-icon")).toBeTruthy();
    });
  });

  describe("Gradient Classes", () => {
    it("should apply gold gradient for rank 1", () => {
      const { container } = render(<RankingCard rank={1} idea={mockIdea} />);

      const rankDiv = container.querySelector(".bg-gradient-to-r");
      expect(rankDiv?.className).toContain("from-yellow-400");
    });

    it("should apply purple gradient for rank 2", () => {
      const { container } = render(<RankingCard rank={2} idea={mockIdea} />);

      const rankDiv = container.querySelector(".bg-gradient-to-r");
      expect(rankDiv?.className).toContain("from-purple-400");
    });

    it("should apply rose gradient for rank 3", () => {
      const { container } = render(<RankingCard rank={3} idea={mockIdea} />);

      const rankDiv = container.querySelector(".bg-gradient-to-r");
      expect(rankDiv?.className).toContain("from-rose-400");
    });

    it("should apply default gradient for rank > 3", () => {
      const { container } = render(<RankingCard rank={4} idea={mockIdea} />);

      const rankDiv = container.querySelector(".bg-gradient-to-r");
      expect(rankDiv?.className).toContain("from-gray-400");
    });
  });

  describe("Animation", () => {
    it("should render motion.div with animation props", () => {
      render(<RankingCard rank={1} idea={mockIdea} />);

      const motionDiv = screen.getByTestId("motion-div");
      expect(motionDiv).toBeTruthy();
      expect(motionDiv.getAttribute("data-initial")).toBeTruthy();
      expect(motionDiv.getAttribute("data-animate")).toBeTruthy();
    });

    it("should call gsap.fromTo for top 3 ranks", () => {
      render(<RankingCard rank={1} idea={mockIdea} />);

      // gsap.fromTo is called in a ref callback, so we need to wait a bit
      // But since it's called synchronously in the ref, it should be called
      expect(mockGsapFromTo).toHaveBeenCalled();
    });
  });

  describe("Card Structure", () => {
    it("should render card component", () => {
      render(<RankingCard rank={1} idea={mockIdea} />);

      expect(screen.getByTestId("card")).toBeTruthy();
    });

    it("should have correct card classes", () => {
      render(<RankingCard rank={1} idea={mockIdea} />);

      const card = screen.getByTestId("card");
      expect(card.className).toContain("overflow-hidden");
      expect(card.className).toContain("shadow-md");
    });
  });
});
