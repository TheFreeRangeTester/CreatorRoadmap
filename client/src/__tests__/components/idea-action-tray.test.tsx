import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IdeaActionTray } from "../../components/idea-action-tray";

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
  Pencil: jest.fn(({ className }) => (
    <div data-testid="pencil-icon" className={className} />
  )),
  Trash2: jest.fn(({ className }) => (
    <div data-testid="trash-icon" className={className} />
  )),
  FileText: jest.fn(({ className }) => (
    <div data-testid="file-text-icon" className={className} />
  )),
  CheckCircle2: jest.fn(({ className }) => (
    <div data-testid="check-circle-icon" className={className} />
  )),
  Youtube: jest.fn(({ className }) => (
    <div data-testid="youtube-icon" className={className} />
  )),
  LucideIcon: jest.fn(),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    className,
    "aria-label": ariaLabel,
    "data-testid": testId,
  }: any) => (
    <button
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {children}
    </button>
  ),
}));

// Mock de Tooltip components
jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

describe("IdeaActionTray", () => {
  const mockIdeaId = 1;
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnOpenScript = jest.fn();
  const mockOnComplete = jest.fn();
  const mockOnAnalyzeYouTube = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Basic Rendering", () => {
    it("should render container", () => {
      const { container } = render(<IdeaActionTray ideaId={mockIdeaId} />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render with card variant by default", () => {
      const { container } = render(<IdeaActionTray ideaId={mockIdeaId} />);

      const tray = container.firstChild as HTMLElement;
      const className =
        typeof tray.className === "string"
          ? tray.className
          : Array.from(tray.className || []).join(" ");
      expect(className).toContain("justify-center");
    });
  });

  describe("Action Buttons", () => {
    it("should render edit button when onEdit is provided", () => {
      render(<IdeaActionTray ideaId={mockIdeaId} onEdit={mockOnEdit} />);

      expect(screen.getByTestId(`button-edit-${mockIdeaId}`)).toBeTruthy();
      expect(screen.getByTestId("pencil-icon")).toBeTruthy();
    });

    it("should render delete button when onDelete is provided", () => {
      render(<IdeaActionTray ideaId={mockIdeaId} onDelete={mockOnDelete} />);

      expect(screen.getByTestId(`button-delete-${mockIdeaId}`)).toBeTruthy();
      expect(screen.getByTestId("trash-icon")).toBeTruthy();
    });

    it("should render script button when onOpenScript is provided", () => {
      render(
        <IdeaActionTray ideaId={mockIdeaId} onOpenScript={mockOnOpenScript} />
      );

      expect(screen.getByTestId(`button-script-${mockIdeaId}`)).toBeTruthy();
      expect(screen.getByTestId("file-text-icon")).toBeTruthy();
    });

    it("should render complete button when onComplete is provided", () => {
      render(
        <IdeaActionTray ideaId={mockIdeaId} onComplete={mockOnComplete} />
      );

      expect(screen.getByTestId(`button-complete-${mockIdeaId}`)).toBeTruthy();
      expect(screen.getByTestId("check-circle-icon")).toBeTruthy();
    });

    it("should render YouTube button when onAnalyzeYouTube is provided", () => {
      render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          onAnalyzeYouTube={mockOnAnalyzeYouTube}
        />
      );

      expect(screen.getByTestId(`button-youtube-${mockIdeaId}`)).toBeTruthy();
      expect(screen.getByTestId("youtube-icon")).toBeTruthy();
    });

    it("should render all buttons when all callbacks are provided", () => {
      render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onOpenScript={mockOnOpenScript}
          onComplete={mockOnComplete}
          onAnalyzeYouTube={mockOnAnalyzeYouTube}
        />
      );

      expect(screen.getByTestId(`button-edit-${mockIdeaId}`)).toBeTruthy();
      expect(screen.getByTestId(`button-delete-${mockIdeaId}`)).toBeTruthy();
      expect(screen.getByTestId(`button-script-${mockIdeaId}`)).toBeTruthy();
      expect(screen.getByTestId(`button-complete-${mockIdeaId}`)).toBeTruthy();
      expect(screen.getByTestId(`button-youtube-${mockIdeaId}`)).toBeTruthy();
    });
  });

  describe("Button Click Handlers", () => {
    it("should call onEdit when edit button is clicked", () => {
      render(<IdeaActionTray ideaId={mockIdeaId} onEdit={mockOnEdit} />);

      const editButton = screen.getByTestId(`button-edit-${mockIdeaId}`);
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it("should call onDelete when delete button is clicked", () => {
      render(<IdeaActionTray ideaId={mockIdeaId} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByTestId(`button-delete-${mockIdeaId}`);
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("should call onOpenScript when script button is clicked", () => {
      render(
        <IdeaActionTray ideaId={mockIdeaId} onOpenScript={mockOnOpenScript} />
      );

      const scriptButton = screen.getByTestId(`button-script-${mockIdeaId}`);
      fireEvent.click(scriptButton);

      expect(mockOnOpenScript).toHaveBeenCalledTimes(1);
    });

    it("should call onComplete when complete button is clicked", () => {
      render(
        <IdeaActionTray ideaId={mockIdeaId} onComplete={mockOnComplete} />
      );

      const completeButton = screen.getByTestId(
        `button-complete-${mockIdeaId}`
      );
      fireEvent.click(completeButton);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it("should call onAnalyzeYouTube when YouTube button is clicked", () => {
      render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          onAnalyzeYouTube={mockOnAnalyzeYouTube}
        />
      );

      const youtubeButton = screen.getByTestId(`button-youtube-${mockIdeaId}`);
      fireEvent.click(youtubeButton);

      expect(mockOnAnalyzeYouTube).toHaveBeenCalledTimes(1);
    });
  });

  describe("Badges", () => {
    it("should show badge on YouTube button when hasYouTubeData is true", () => {
      const { container } = render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          onAnalyzeYouTube={mockOnAnalyzeYouTube}
          hasYouTubeData={true}
        />
      );

      const badge = container.querySelector(".bg-green-500.rounded-full");
      expect(badge).toBeTruthy();
    });

    it("should not show badge on YouTube button when hasYouTubeData is false", () => {
      const { container } = render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          onAnalyzeYouTube={mockOnAnalyzeYouTube}
          hasYouTubeData={false}
        />
      );

      const badge = container.querySelector(".bg-green-500.rounded-full");
      expect(badge).toBeNull();
    });

    it("should show badge on script button when hasScript is true", () => {
      const { container } = render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          onOpenScript={mockOnOpenScript}
          hasScript={true}
        />
      );

      const badge = container.querySelector(".bg-green-500.rounded-full");
      expect(badge).toBeTruthy();
    });

    it("should not show badge on script button when hasScript is false", () => {
      const { container } = render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          onOpenScript={mockOnOpenScript}
          hasScript={false}
        />
      );

      const badge = container.querySelector(".bg-green-500.rounded-full");
      expect(badge).toBeNull();
    });
  });

  describe("Variants", () => {
    it("should apply card variant styles", () => {
      const { container } = render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          variant="card"
          onEdit={mockOnEdit}
        />
      );

      const tray = container.firstChild as HTMLElement;
      const className =
        typeof tray.className === "string"
          ? tray.className
          : Array.from(tray.className || []).join(" ");
      expect(className).toContain("justify-center");
    });

    it("should apply list variant styles", () => {
      const { container } = render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          variant="list"
          onEdit={mockOnEdit}
        />
      );

      const tray = container.firstChild as HTMLElement;
      const className =
        typeof tray.className === "string"
          ? tray.className
          : Array.from(tray.className || []).join(" ");
      expect(className).toContain("justify-end");
    });

    it("should apply compact variant styles", () => {
      const { container } = render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          variant="compact"
          onEdit={mockOnEdit}
        />
      );

      const tray = container.firstChild as HTMLElement;
      const className =
        typeof tray.className === "string"
          ? tray.className
          : Array.from(tray.className || []).join(" ");
      expect(className).toContain("justify-end");
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <IdeaActionTray ideaId={mockIdeaId} className="custom-class" />
      );

      const tray = container.firstChild as HTMLElement;
      const className =
        typeof tray.className === "string"
          ? tray.className
          : Array.from(tray.className || []).join(" ");
      expect(className).toContain("custom-class");
    });
  });

  describe("Translations", () => {
    it("should use translation for edit label", () => {
      render(<IdeaActionTray ideaId={mockIdeaId} onEdit={mockOnEdit} />);

      expect(mockT).toHaveBeenCalledWith("ideas.edit", "Editar");
    });

    it("should use translation for delete label", () => {
      render(<IdeaActionTray ideaId={mockIdeaId} onDelete={mockOnDelete} />);

      expect(mockT).toHaveBeenCalledWith("ideas.delete", "Eliminar");
    });

    it("should use translation for script label", () => {
      render(
        <IdeaActionTray ideaId={mockIdeaId} onOpenScript={mockOnOpenScript} />
      );

      expect(mockT).toHaveBeenCalledWith("ideas.script", "Script");
    });

    it("should use translation for complete label", () => {
      render(
        <IdeaActionTray ideaId={mockIdeaId} onComplete={mockOnComplete} />
      );

      expect(mockT).toHaveBeenCalledWith("ideas.complete", "Completar");
    });

    it("should use translation for analyze label", () => {
      render(
        <IdeaActionTray
          ideaId={mockIdeaId}
          onAnalyzeYouTube={mockOnAnalyzeYouTube}
        />
      );

      expect(mockT).toHaveBeenCalledWith("ideas.analyze", "Analizar");
    });
  });

  describe("Edge Cases", () => {
    it("should render nothing when no callbacks are provided", () => {
      const { container } = render(<IdeaActionTray ideaId={mockIdeaId} />);

      // Container should exist but be empty
      expect(container.firstChild).toBeTruthy();
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });

    it("should handle multiple rapid clicks", () => {
      render(<IdeaActionTray ideaId={mockIdeaId} onEdit={mockOnEdit} />);

      const editButton = screen.getByTestId(`button-edit-${mockIdeaId}`);
      fireEvent.click(editButton);
      fireEvent.click(editButton);
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(3);
    });

    it("should use correct ideaId in testId", () => {
      render(<IdeaActionTray ideaId={123} onEdit={mockOnEdit} />);

      expect(screen.getByTestId("button-edit-123")).toBeTruthy();
    });
  });
});
