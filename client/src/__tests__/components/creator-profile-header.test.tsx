import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreatorProfileHeader from "../../components/creator-profile-header";

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
  Twitter: jest.fn(({ size, className }) => (
    <div data-testid="twitter-icon" data-size={size} className={className} />
  )),
  Instagram: jest.fn(({ size, className }) => (
    <div data-testid="instagram-icon" data-size={size} className={className} />
  )),
  Youtube: jest.fn(({ size, className }) => (
    <div data-testid="youtube-icon" data-size={size} className={className} />
  )),
  Globe: jest.fn(({ size, className }) => (
    <div data-testid="globe-icon" data-size={size} className={className} />
  )),
  ExternalLink: jest.fn(({ size, className }) => (
    <div
      data-testid="external-link-icon"
      data-size={size}
      className={className}
    />
  )),
}));

// Mock de react-icons
jest.mock("react-icons/fa", () => ({
  FaTiktok: jest.fn(({ size, className }) => (
    <div data-testid="tiktok-icon" data-size={size} className={className} />
  )),
}));

jest.mock("react-icons/fa6", () => ({
  FaThreads: jest.fn(({ size, className }) => (
    <div data-testid="threads-icon" data-size={size} className={className} />
  )),
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

// Mock de Link component (wouter)
jest.mock("wouter", () => ({
  Link: ({ href, children }: any) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}));

describe("CreatorProfileHeader", () => {
  const mockCreator = {
    id: 1,
    username: "testcreator",
    profileDescription: null,
    logoUrl: null,
    twitterUrl: null,
    instagramUrl: null,
    youtubeUrl: null,
    tiktokUrl: null,
    threadsUrl: null,
    websiteUrl: null,
    profileBackground: null,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Basic Rendering", () => {
    it("should render creator username", () => {
      render(<CreatorProfileHeader creator={mockCreator} />);

      expect(screen.getByText("testcreator")).toBeTruthy();
    });

    it("should render avatar", () => {
      render(<CreatorProfileHeader creator={mockCreator} />);

      expect(screen.getByTestId("avatar")).toBeTruthy();
    });

    it("should render avatar fallback with initial", () => {
      render(<CreatorProfileHeader creator={mockCreator} />);

      expect(screen.getByTestId("avatar-fallback")).toBeTruthy();
      expect(screen.getByText("T")).toBeTruthy(); // First letter of "testcreator"
    });

    it("should render avatar image when logoUrl is provided", () => {
      const creatorWithLogo = {
        ...mockCreator,
        logoUrl: "https://example.com/logo.png",
      };

      render(<CreatorProfileHeader creator={creatorWithLogo} />);

      const avatarImage = screen.getByTestId("avatar-image");
      expect(avatarImage.getAttribute("src")).toBe(
        "https://example.com/logo.png"
      );
      expect(avatarImage.getAttribute("alt")).toBe("testcreator");
    });
  });

  describe("Profile Description", () => {
    it("should render profile description when provided", () => {
      const creatorWithDescription = {
        ...mockCreator,
        profileDescription: "This is a test description",
      };

      render(<CreatorProfileHeader creator={creatorWithDescription} />);

      expect(screen.getByText("This is a test description")).toBeTruthy();
    });

    it("should not render profile description when null", () => {
      render(<CreatorProfileHeader creator={mockCreator} />);

      expect(screen.queryByText("This is a test description")).toBeNull();
    });

    it("should not render profile description when undefined", () => {
      const creatorWithoutDescription = {
        ...mockCreator,
        profileDescription: undefined,
      };

      render(<CreatorProfileHeader creator={creatorWithoutDescription} />);

      const descriptionContainer = screen.queryByText(/This is a test/);
      expect(descriptionContainer).toBeNull();
    });
  });

  describe("Social Links", () => {
    it("should render Twitter link when twitterUrl is provided", () => {
      const creatorWithTwitter = {
        ...mockCreator,
        twitterUrl: "testuser",
      };

      render(<CreatorProfileHeader creator={creatorWithTwitter} />);

      expect(screen.getByTestId("twitter-icon")).toBeTruthy();
      const twitterLink = screen.getByTestId("twitter-icon").closest("a");
      expect(twitterLink?.getAttribute("href")).toBe(
        "https://www.x.com/testuser"
      );
    });

    it("should render Instagram link when instagramUrl is provided", () => {
      const creatorWithInstagram = {
        ...mockCreator,
        instagramUrl: "testuser",
      };

      render(<CreatorProfileHeader creator={creatorWithInstagram} />);

      expect(screen.getByTestId("instagram-icon")).toBeTruthy();
      const instagramLink = screen.getByTestId("instagram-icon").closest("a");
      expect(instagramLink?.getAttribute("href")).toBe(
        "https://www.instagram.com/testuser"
      );
    });

    it("should render YouTube link when youtubeUrl is provided", () => {
      const creatorWithYoutube = {
        ...mockCreator,
        youtubeUrl: "testuser",
      };

      render(<CreatorProfileHeader creator={creatorWithYoutube} />);

      expect(screen.getByTestId("youtube-icon")).toBeTruthy();
      const youtubeLink = screen.getByTestId("youtube-icon").closest("a");
      expect(youtubeLink?.getAttribute("href")).toBe(
        "https://www.youtube.com/@testuser"
      );
    });

    it("should render TikTok link when tiktokUrl is provided", () => {
      const creatorWithTiktok = {
        ...mockCreator,
        tiktokUrl: "testuser",
      };

      render(<CreatorProfileHeader creator={creatorWithTiktok} />);

      expect(screen.getByTestId("tiktok-icon")).toBeTruthy();
      const tiktokLink = screen.getByTestId("tiktok-icon").closest("a");
      expect(tiktokLink?.getAttribute("href")).toBe(
        "https://www.tiktok.com/@testuser"
      );
    });

    it("should render Threads link when threadsUrl is provided", () => {
      const creatorWithThreads = {
        ...mockCreator,
        threadsUrl: "testuser",
      };

      render(<CreatorProfileHeader creator={creatorWithThreads} />);

      expect(screen.getByTestId("threads-icon")).toBeTruthy();
      const threadsLink = screen.getByTestId("threads-icon").closest("a");
      expect(threadsLink?.getAttribute("href")).toBe(
        "https://www.threads.net/@testuser"
      );
    });

    it("should render website link when websiteUrl is provided", () => {
      const creatorWithWebsite = {
        ...mockCreator,
        websiteUrl: "example.com",
      };

      render(<CreatorProfileHeader creator={creatorWithWebsite} />);

      expect(screen.getByTestId("globe-icon")).toBeTruthy();
      expect(screen.getByTestId("external-link-icon")).toBeTruthy();
      const websiteLink = screen.getByTestId("globe-icon").closest("a");
      expect(websiteLink?.getAttribute("href")).toBe("https://example.com");
    });

    it("should not render social links when URLs are not provided", () => {
      render(<CreatorProfileHeader creator={mockCreator} />);

      expect(screen.queryByTestId("twitter-icon")).toBeNull();
      expect(screen.queryByTestId("instagram-icon")).toBeNull();
      expect(screen.queryByTestId("youtube-icon")).toBeNull();
    });
  });

  describe("URL Formatting", () => {
    it("should remove @ prefix from Twitter URL", () => {
      const creatorWithTwitter = {
        ...mockCreator,
        twitterUrl: "@testuser",
      };

      render(<CreatorProfileHeader creator={creatorWithTwitter} />);

      const twitterLink = screen.getByTestId("twitter-icon").closest("a");
      expect(twitterLink?.getAttribute("href")).toBe(
        "https://www.x.com/testuser"
      );
    });

    it("should handle website URL with http:// prefix", () => {
      const creatorWithWebsite = {
        ...mockCreator,
        websiteUrl: "http://example.com",
      };

      render(<CreatorProfileHeader creator={creatorWithWebsite} />);

      const websiteLink = screen.getByTestId("globe-icon").closest("a");
      expect(websiteLink?.getAttribute("href")).toBe("http://example.com");
    });

    it("should handle website URL with https:// prefix", () => {
      const creatorWithWebsite = {
        ...mockCreator,
        websiteUrl: "https://example.com",
      };

      render(<CreatorProfileHeader creator={creatorWithWebsite} />);

      const websiteLink = screen.getByTestId("globe-icon").closest("a");
      expect(websiteLink?.getAttribute("href")).toBe("https://example.com");
    });

    it("should add https:// prefix to website URL without protocol", () => {
      const creatorWithWebsite = {
        ...mockCreator,
        websiteUrl: "example.com",
      };

      render(<CreatorProfileHeader creator={creatorWithWebsite} />);

      const websiteLink = screen.getByTestId("globe-icon").closest("a");
      expect(websiteLink?.getAttribute("href")).toBe("https://example.com");
    });
  });

  describe("Social Links Attributes", () => {
    it("should set target='_blank' and rel='noopener noreferrer' on social links", () => {
      const creatorWithTwitter = {
        ...mockCreator,
        twitterUrl: "testuser",
      };

      const { container } = render(
        <CreatorProfileHeader creator={creatorWithTwitter} />
      );

      const twitterIcon = screen.getByTestId("twitter-icon");
      const twitterLink = twitterIcon.closest("a");
      expect(twitterLink?.getAttribute("target")).toBe("_blank");
      expect(twitterLink?.getAttribute("rel")).toBe("noopener noreferrer");
    });

    it("should set title attribute on social links", () => {
      const creatorWithTwitter = {
        ...mockCreator,
        twitterUrl: "testuser",
      };

      const { container } = render(
        <CreatorProfileHeader creator={creatorWithTwitter} />
      );

      const twitterIcon = screen.getByTestId("twitter-icon");
      const twitterLink = twitterIcon.closest("a");
      expect(twitterLink?.getAttribute("title")).toBe("Twitter");
    });
  });

  describe("Initials Calculation", () => {
    it("should use first letter of username for avatar fallback", () => {
      render(<CreatorProfileHeader creator={mockCreator} />);

      expect(screen.getByText("T")).toBeTruthy();
    });

    it("should handle single character username", () => {
      const creatorWithShortName = {
        ...mockCreator,
        username: "a",
      };

      render(<CreatorProfileHeader creator={creatorWithShortName} />);

      expect(screen.getByText("A")).toBeTruthy();
    });

    it("should handle username with numbers", () => {
      const creatorWithNumbers = {
        ...mockCreator,
        username: "user123",
      };

      render(<CreatorProfileHeader creator={creatorWithNumbers} />);

      expect(screen.getByText("U")).toBeTruthy();
    });

    it("should handle username with special characters", () => {
      const creatorWithSpecialChars = {
        ...mockCreator,
        username: "_testuser",
      };

      render(<CreatorProfileHeader creator={creatorWithSpecialChars} />);

      expect(screen.getByText("_")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle creator with all social links", () => {
      const creatorWithAllLinks = {
        ...mockCreator,
        twitterUrl: "twitter",
        instagramUrl: "instagram",
        youtubeUrl: "youtube",
        tiktokUrl: "tiktok",
        threadsUrl: "threads",
        websiteUrl: "example.com",
      };

      render(<CreatorProfileHeader creator={creatorWithAllLinks} />);

      expect(screen.getByTestId("twitter-icon")).toBeTruthy();
      expect(screen.getByTestId("instagram-icon")).toBeTruthy();
      expect(screen.getByTestId("youtube-icon")).toBeTruthy();
      expect(screen.getByTestId("tiktok-icon")).toBeTruthy();
      expect(screen.getByTestId("threads-icon")).toBeTruthy();
      expect(screen.getByTestId("globe-icon")).toBeTruthy();
    });

    it("should handle empty username", () => {
      const creatorWithEmptyUsername = {
        ...mockCreator,
        username: "",
      };

      render(<CreatorProfileHeader creator={creatorWithEmptyUsername} />);

      const fallback = screen.getByTestId("avatar-fallback");
      expect(fallback.textContent).toBe("");
    });

    it("should handle very long profile description", () => {
      const longDescription = "A".repeat(500);
      const creatorWithLongDescription = {
        ...mockCreator,
        profileDescription: longDescription,
      };

      render(<CreatorProfileHeader creator={creatorWithLongDescription} />);

      expect(screen.getByText(longDescription)).toBeTruthy();
    });
  });
});
