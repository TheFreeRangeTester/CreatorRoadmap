import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock de apiRequest - debe estar antes del import del componente
jest.mock("@/lib/queryClient", () => ({
  apiRequest: jest.fn(() =>
    Promise.resolve({
      json: async () => ({ success: true }),
    } as any)
  ),
}));

import ProfileEditor from "../../components/profile-editor";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de useAuth
const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  profileDescription: "Test description",
  logoUrl: "https://example.com/logo.png",
  twitterUrl: "testuser",
  instagramUrl: "testuser",
  youtubeUrl: "testuser",
  tiktokUrl: "testuser",
  threadsUrl: "testuser",
  websiteUrl: "https://example.com",
  profileBackground: "gradient-1",
} as any;

const mockUseAuth = jest.fn(() => ({
  user: mockUser,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de useToast
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de useMutation
const mockMutate = jest.fn();
const mockMutation: any = {
  mutate: mockMutate,
  isPending: false,
};

const mockUseMutation = jest.fn((config?: any) => {
  // Store config for later use
  if (config) {
    mockMutation.onSuccess = config.onSuccess;
    mockMutation.onError = config.onError;
    mockMutation.mutationFn = config.mutationFn;
  }
  return mockMutation;
});

// Mock de useQueryClient
const mockInvalidateQueries = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

jest.mock("@tanstack/react-query", () => ({
  useMutation: (config?: any) => mockUseMutation(config),
  useQueryClient: () => mockQueryClient,
}));

// Mock de apiRequest - debe estar antes del import del componente
jest.mock("@/lib/queryClient", () => ({
  apiRequest: jest.fn(() =>
    Promise.resolve({
      json: async () => ({ success: true }),
    } as any)
  ),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Twitter: jest.fn(({ className }) => (
    <div data-testid="twitter-icon" className={className} />
  )),
  Instagram: jest.fn(({ className }) => (
    <div data-testid="instagram-icon" className={className} />
  )),
  Youtube: jest.fn(({ className }) => (
    <div data-testid="youtube-icon" className={className} />
  )),
  Globe: jest.fn(({ className }) => (
    <div data-testid="globe-icon" className={className} />
  )),
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
  RefreshCw: jest.fn(({ className }) => (
    <div data-testid="refresh-icon" className={className} />
  )),
  Settings: jest.fn(({ className }) => (
    <div data-testid="settings-icon" className={className} />
  )),
  PaintBucket: jest.fn(({ className }) => (
    <div data-testid="paint-bucket-icon" className={className} />
  )),
  CheckIcon: jest.fn(({ className }) => (
    <div data-testid="check-icon" className={className} />
  )),
  Share2: jest.fn(({ className }) => (
    <div data-testid="share-icon" className={className} />
  )),
  Copy: jest.fn(({ className }) => (
    <div data-testid="copy-icon" className={className} />
  )),
}));

// Mock de react-icons
jest.mock("react-icons/fa", () => ({
  FaTiktok: jest.fn(({ className }) => (
    <div data-testid="tiktok-icon" className={className} />
  )),
}));

jest.mock("react-icons/fa6", () => ({
  FaThreads: jest.fn(({ className }) => (
    <div data-testid="threads-icon" className={className} />
  )),
}));

// Mock de Card components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className }: any) => (
    <div data-testid="card-description" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div data-testid="card-footer" className={className}>
      {children}
    </div>
  ),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    type,
    className,
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      type={type}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock de Input component
jest.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, placeholder, name, id, className }: any) => (
    <input
      id={id}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="input"
    />
  ),
}));

// Mock de Textarea component
jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    value,
    onChange,
    placeholder,
    name,
    id,
    className,
    rows,
  }: any) => (
    <textarea
      id={id}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      rows={rows}
      data-testid="textarea"
    />
  ),
}));

// Mock de Avatar components
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: any) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: any) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children, className }: any) => (
    <div data-testid="avatar-fallback" className={className}>
      {children}
    </div>
  ),
}));

// Mock de Label component
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className} data-testid="label">
      {children}
    </label>
  ),
}));

// Mock de RadioGroup components
jest.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children, value, onValueChange, className }: any) => (
    <div
      data-testid="radio-group"
      data-value={value}
      className={className}
      onClick={() => onValueChange && onValueChange("gradient-2")}
    >
      {children}
    </div>
  ),
  RadioGroupItem: ({ value, id, className }: any) => (
    <input
      type="radio"
      id={id}
      value={value}
      data-testid={`radio-item-${value}`}
      className={className}
    />
  ),
}));

// Mock de navigator.clipboard
const mockWriteText: jest.Mock = jest.fn(() => Promise.resolve());
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock de window.location
delete (window as any).location;
(window as any).location = { origin: "http://localhost" };

describe("ProfileEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockMutation.isPending = false;
    mockWriteText.mockClear();
  });

  describe("Basic Rendering", () => {
    it("should render profile editor", () => {
      const { container } = render(<ProfileEditor />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render card", () => {
      render(<ProfileEditor />);

      expect(screen.getByTestId("card")).toBeTruthy();
    });

    it("should render settings icon", () => {
      render(<ProfileEditor />);

      expect(screen.getByTestId("settings-icon")).toBeTruthy();
    });

    it("should not render when user is null", () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { container } = render(<ProfileEditor />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Form Fields", () => {
    it("should render logo URL input", () => {
      render(<ProfileEditor />);

      const logoInput = screen.getByLabelText(/profile.logoUrl/i);
      expect(logoInput).toBeTruthy();
    });

    it("should render profile description textarea", () => {
      render(<ProfileEditor />);

      const descriptionTextarea = screen.getByLabelText(/profile.description/i);
      expect(descriptionTextarea).toBeTruthy();
    });

    it("should render social media inputs", () => {
      render(<ProfileEditor />);

      expect(screen.getByTestId("twitter-icon")).toBeTruthy();
      expect(screen.getByTestId("instagram-icon")).toBeTruthy();
      expect(screen.getByTestId("youtube-icon")).toBeTruthy();
      expect(screen.getByTestId("tiktok-icon")).toBeTruthy();
      expect(screen.getByTestId("threads-icon")).toBeTruthy();
      expect(screen.getByTestId("globe-icon")).toBeTruthy();
    });
  });

  describe("Avatar", () => {
    it("should render avatar", () => {
      render(<ProfileEditor />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("should render avatar image when logoUrl is provided", () => {
      render(<ProfileEditor />);

      const avatarImage = screen.getByTestId("avatar-image");
      expect(avatarImage.getAttribute("src")).toBe(
        "https://example.com/logo.png"
      );
    });

    it("should render avatar fallback with initials", () => {
      render(<ProfileEditor />);

      const avatarFallback = screen.getByTestId("avatar-fallback");
      expect(avatarFallback.textContent).toBe("T");
    });
  });

  describe("Form Changes", () => {
    it("should update form data when input changes", () => {
      render(<ProfileEditor />);

      const descriptionTextarea = screen.getByLabelText(/profile.description/i);
      fireEvent.change(descriptionTextarea, {
        target: { name: "profileDescription", value: "New description" },
      });

      expect((descriptionTextarea as HTMLTextAreaElement).value).toBe(
        "New description"
      );
    });

    it("should enable save button when form is dirty", () => {
      render(<ProfileEditor />);

      const descriptionTextarea = screen.getByLabelText(/profile.description/i);
      fireEvent.change(descriptionTextarea, {
        target: { name: "profileDescription", value: "New description" },
      });

      const saveButton = screen.getByText(/common.save/i).closest("button");
      expect((saveButton as HTMLButtonElement).disabled).toBe(false);
    });

    it("should disable save button when form is not dirty", () => {
      render(<ProfileEditor />);

      const saveButton = screen.getByText(/common.save/i).closest("button");
      expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("Form Submission", () => {
    it("should call mutation when form is submitted", () => {
      render(<ProfileEditor />);

      // Make form dirty
      const descriptionTextarea = screen.getByLabelText(/profile.description/i);
      fireEvent.change(descriptionTextarea, {
        target: { name: "profileDescription", value: "New description" },
      });

      // Submit form
      const form = screen.getByTestId("card-content").querySelector("form");
      if (form) {
        fireEvent.submit(form);
      }

      expect(mockMutate).toHaveBeenCalled();
    });

    it("should show loading state when submitting", () => {
      mockMutation.isPending = true;
      render(<ProfileEditor />);

      // Make form dirty
      const descriptionTextarea = screen.getByLabelText(/profile.description/i);
      fireEvent.change(descriptionTextarea, {
        target: { name: "profileDescription", value: "New description" },
      });

      expect(screen.getByTestId("loader-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("common.saving");
    });
  });

  describe("Reset Form", () => {
    it("should render reset button", () => {
      render(<ProfileEditor />);

      expect(mockT).toHaveBeenCalledWith("common.reset");
    });

    it("should disable reset button when form is not dirty", () => {
      render(<ProfileEditor />);

      const resetButton = screen.getByText(/common.reset/i).closest("button");
      expect((resetButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("should enable reset button when form is dirty", () => {
      render(<ProfileEditor />);

      const descriptionTextarea = screen.getByLabelText(/profile.description/i);
      fireEvent.change(descriptionTextarea, {
        target: { name: "profileDescription", value: "New description" },
      });

      const resetButton = screen.getByText(/common.reset/i).closest("button");
      expect((resetButton as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe("Background Selection", () => {
    it("should render background selection section", () => {
      render(<ProfileEditor />);

      expect(screen.getByTestId("paint-bucket-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("profile.background");
    });

    it("should render radio group for background", () => {
      render(<ProfileEditor />);

      expect(screen.getByTestId("radio-group")).toBeTruthy();
    });

    it("should render background options", () => {
      render(<ProfileEditor />);

      expect(screen.getByTestId("radio-item-gradient-1")).toBeTruthy();
      expect(screen.getByTestId("radio-item-gradient-2")).toBeTruthy();
      expect(screen.getByTestId("radio-item-gradient-3")).toBeTruthy();
      expect(screen.getByTestId("radio-item-gradient-4")).toBeTruthy();
      expect(screen.getByTestId("radio-item-pattern-1")).toBeTruthy();
      expect(screen.getByTestId("radio-item-pattern-2")).toBeTruthy();
    });
  });

  describe("Share Profile", () => {
    it("should render share profile section", () => {
      render(<ProfileEditor />);

      expect(screen.getByTestId("share-icon")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("profile.shareProfile");
    });

    it("should display profile URL", () => {
      const { container } = render(<ProfileEditor />);

      // URL is in a code element - check if it contains the username
      const codeElement = container.querySelector("code");
      expect(codeElement?.textContent).toContain("testuser");
    });

    it("should copy URL to clipboard when copy button is clicked", async () => {
      render(<ProfileEditor />);

      // Find copy button by icon
      const copyIcon = screen.getByTestId("copy-icon");
      const copyButton = copyIcon.closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }

      // Wait for async clipboard operation
      await waitFor(
        () => {
          expect(mockWriteText).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      // Verify the URL that was copied (should contain origin and username)
      const calls = mockWriteText.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const copiedUrl = calls[0][0] as string;
      expect(copiedUrl).toContain("testuser");
      expect(copiedUrl).toContain("http://");
    });

    it("should show toast when URL is copied successfully", async () => {
      render(<ProfileEditor />);

      // Find copy button by icon
      const copyIcon = screen.getByTestId("copy-icon");
      const copyButton = copyIcon.closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }

      // Wait for async clipboard operation and toast
      await waitFor(
        () => {
          expect(mockToast).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Translation Calls", () => {
    it("should call translation for edit profile", () => {
      render(<ProfileEditor />);

      expect(mockT).toHaveBeenCalledWith("profile.editProfile");
    });

    it("should call translation for social links", () => {
      render(<ProfileEditor />);

      expect(mockT).toHaveBeenCalledWith("profile.socialLinks");
    });
  });
});
