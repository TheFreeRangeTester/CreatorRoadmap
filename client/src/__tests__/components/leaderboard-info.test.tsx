import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LeaderboardInfo from "../../components/leaderboard-info";

// Mock de useTranslation
const mockT = jest.fn((key: string) => key);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

describe("LeaderboardInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation((key: string) => key);
  });

  describe("Basic Rendering", () => {
    it("should render leaderboard info component", () => {
      const { container } = render(<LeaderboardInfo />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render title", () => {
      render(<LeaderboardInfo />);

      expect(mockT).toHaveBeenCalledWith("dashboard.topIdeas");
      expect(screen.getByText("dashboard.topIdeas")).toBeTruthy();
    });

    it("should render description", () => {
      render(<LeaderboardInfo />);

      expect(mockT).toHaveBeenCalledWith("dashboard.voteDescription");
      expect(screen.getByText("dashboard.voteDescription")).toBeTruthy();
    });
  });

  describe("Structure", () => {
    it("should have correct container structure", () => {
      const { container } = render(<LeaderboardInfo />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv?.className).toContain("flex");
      expect(mainDiv?.className).toContain("justify-between");
      expect(mainDiv?.className).toContain("items-center");
      expect(mainDiv?.className).toContain("mb-6");
    });

    it("should have heading with correct classes", () => {
      const { container } = render(<LeaderboardInfo />);

      const heading = container.querySelector("h2");
      expect(heading?.className).toContain("text-2xl");
      expect(heading?.className).toContain("font-bold");
      expect(heading?.className).toContain("text-neutral-800");
      expect(heading?.className).toContain("dark:text-white");
    });

    it("should have paragraph with correct classes", () => {
      const { container } = render(<LeaderboardInfo />);

      const paragraph = container.querySelector("p");
      expect(paragraph?.className).toContain("text-sm");
      expect(paragraph?.className).toContain("text-neutral-500");
      expect(paragraph?.className).toContain("dark:text-neutral-400");
    });
  });

  describe("Translation Calls", () => {
    it("should call translation function for title", () => {
      render(<LeaderboardInfo />);

      expect(mockT).toHaveBeenCalledWith("dashboard.topIdeas");
    });

    it("should call translation function for description", () => {
      render(<LeaderboardInfo />);

      expect(mockT).toHaveBeenCalledWith("dashboard.voteDescription");
    });

    it("should call translation function exactly twice", () => {
      render(<LeaderboardInfo />);

      expect(mockT).toHaveBeenCalledTimes(2);
    });
  });
});
