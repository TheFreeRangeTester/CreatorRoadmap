import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Asegurarse de que el código se ejecute solo en el cliente para evitar errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 h-9 border-border">
          {theme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />
          ) : theme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400" />
          ) : (
            <Laptop className="h-[1.2rem] w-[1.2rem] text-slate-600" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-40 w-10 p-1">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer h-8 justify-center"
        >
          <Sun className="h-4 w-4 text-amber-500" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer h-8 justify-center"
        >
          <Moon className="h-4 w-4 text-blue-400" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer h-8 justify-center"
        >
          <Laptop className="h-4 w-4 text-slate-600" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
