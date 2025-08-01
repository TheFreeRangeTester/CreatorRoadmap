import { Link } from "wouter";
import logoPng from "@/assets/logo.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <img src={logoPng} alt="Logo" className="h-8 w-8 object-contain" />
      {showText && (
        <h1 className="ml-2 text-xl font-bold text-neutral-800 dark:text-white">
          Fanlist
        </h1>
      )}
    </Link>
  );
}
