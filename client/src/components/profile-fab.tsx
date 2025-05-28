import { User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

export const ProfileFAB = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <div className="fixed bottom-20 right-4 md:hidden z-50">
      <Link href="/profile">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
        >
          <User className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
};
