import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AchievementsContainer from "../../components/achievements-container";
import { AchievementType } from "../../components/achievement-animation";

// Mock del hook useAchievements
const mockRegisterLogin = jest.fn();
const mockHideAchievement = jest.fn();
const mockShowAchievement = jest.fn();

const mockUseAchievements = jest.fn();

jest.mock("@/hooks/use-achievements", () => ({
  useAchievements: () => mockUseAchievements(),
}));

// Mock de AchievementAnimation
jest.mock("../../components/achievement-animation", () => ({
  __esModule: true,
  default: jest.fn(({ type, show, onComplete, message }) => {
    if (!show) return null;
    return (
      <div data-testid="achievement-animation">
        <div data-testid="achievement-type">{type}</div>
        {message && <div data-testid="achievement-message">{message}</div>}
        <button data-testid="complete-button" onClick={onComplete}>
          Complete
        </button>
      </div>
    );
  }),
  AchievementType: {
    FIRST_VOTE: "first_vote",
    TEN_VOTES: "ten_votes",
    FIFTY_VOTES: "fifty_votes",
    VOTED_TOP_IDEA: "voted_top_idea",
    SUGGESTED_IDEA: "suggested_idea",
    STREAK_VOTES: "streak_votes",
  },
}));

describe("AchievementsContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegisterLogin.mockClear();
    mockHideAchievement.mockClear();
    mockShowAchievement.mockClear();
  });

  describe("Component Mounting", () => {
    it("should call registerLogin when component mounts", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: null,
        showAnimation: false,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(mockRegisterLogin).toHaveBeenCalledTimes(1);
    });

    it("should not render anything when there is no current achievement", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: null,
        showAnimation: false,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      const { container } = render(<AchievementsContainer />);

      expect(container.firstChild).toBe(null);
      expect(screen.queryByTestId("achievement-animation")).toBeNull();
    });

    it("should not render anything when showAnimation is false", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.FIRST_VOTE,
        showAnimation: false,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      const { container } = render(<AchievementsContainer />);

      expect(container.firstChild).toBe(null);
      expect(screen.queryByTestId("achievement-animation")).toBeNull();
    });
  });

  describe("Rendering AchievementAnimation", () => {
    it("should render AchievementAnimation when there is a current achievement and showAnimation is true", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.FIRST_VOTE,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.getByTestId("achievement-animation")).toBeTruthy();
      expect(screen.getByTestId("achievement-type").textContent).toBe(
        "first_vote"
      );
    });

    it("should pass correct props to AchievementAnimation", () => {
      const testMessage = "Mensaje de prueba";
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.TEN_VOTES,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: testMessage,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.getByTestId("achievement-type").textContent).toBe(
        "ten_votes"
      );
      expect(screen.getByTestId("achievement-message").textContent).toBe(
        testMessage
      );
    });

    it("should pass hideAchievement as onComplete callback", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.FIRST_VOTE,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      const completeButton = screen.getByTestId("complete-button");
      completeButton.click();

      expect(mockHideAchievement).toHaveBeenCalledTimes(1);
    });
  });

  describe("All Achievement Types", () => {
    it("should render AchievementAnimation for FIRST_VOTE", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.FIRST_VOTE,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.getByTestId("achievement-type").textContent).toBe(
        "first_vote"
      );
    });

    it("should render AchievementAnimation for TEN_VOTES", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.TEN_VOTES,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.getByTestId("achievement-type").textContent).toBe(
        "ten_votes"
      );
    });

    it("should render AchievementAnimation for FIFTY_VOTES", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.FIFTY_VOTES,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.getByTestId("achievement-type").textContent).toBe(
        "fifty_votes"
      );
    });

    it("should render AchievementAnimation for VOTED_TOP_IDEA", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.VOTED_TOP_IDEA,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.getByTestId("achievement-type").textContent).toBe(
        "voted_top_idea"
      );
    });

    it("should render AchievementAnimation for SUGGESTED_IDEA", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.SUGGESTED_IDEA,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.getByTestId("achievement-type").textContent).toBe(
        "suggested_idea"
      );
    });

    it("should render AchievementAnimation for STREAK_VOTES", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.STREAK_VOTES,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.getByTestId("achievement-type").textContent).toBe(
        "streak_votes"
      );
    });
  });

  describe("Message Handling", () => {
    it("should pass message to AchievementAnimation when provided", () => {
      const customMessage = "Logro personalizado";
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.FIRST_VOTE,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: customMessage,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.getByTestId("achievement-message").textContent).toBe(
        customMessage
      );
    });

    it("should not render message element when message is undefined", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.FIRST_VOTE,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      render(<AchievementsContainer />);

      expect(screen.queryByTestId("achievement-message")).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid changes in currentAchievement", () => {
      const { rerender } = render(<AchievementsContainer />);

      // First render - no achievement
      mockUseAchievements.mockReturnValue({
        currentAchievement: null,
        showAnimation: false,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      rerender(<AchievementsContainer />);
      expect(screen.queryByTestId("achievement-animation")).toBeNull();

      // Second render - with achievement
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.FIRST_VOTE,
        showAnimation: true,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      rerender(<AchievementsContainer />);
      expect(screen.getByTestId("achievement-animation")).toBeTruthy();

      // Third render - achievement hidden
      mockUseAchievements.mockReturnValue({
        currentAchievement: AchievementType.FIRST_VOTE,
        showAnimation: false,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      rerender(<AchievementsContainer />);
      expect(screen.queryByTestId("achievement-animation")).toBeNull();
    });

    it("should call registerLogin only once per mount", () => {
      mockUseAchievements.mockReturnValue({
        currentAchievement: null,
        showAnimation: false,
        hideAchievement: mockHideAchievement,
        registerLogin: mockRegisterLogin,
        message: undefined,
        showAchievement: mockShowAchievement,
      });

      const { rerender } = render(<AchievementsContainer />);

      expect(mockRegisterLogin).toHaveBeenCalledTimes(1);

      // Rerender should not call registerLogin again
      rerender(<AchievementsContainer />);
      expect(mockRegisterLogin).toHaveBeenCalledTimes(1);
    });
  });
});
