"use client";

import { Moon, Sun, Laptop, ChevronDown, School } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ThemeToggleProps {
  size?: "default" | "sm";
}

export function ThemeToggle({ size = "default" }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={size === "sm" ? "icon-sm" : "icon"} 
          className="rounded-full"
        >
          {theme === "light" && <Sun className="h-[1.1rem] w-[1.1rem]" />}
          {theme === "dark" && <Moon className="h-[1.1rem] w-[1.1rem]" />}
          {theme === "system" && <Laptop className="h-[1.1rem] w-[1.1rem]" />}
          {theme === "tec" && <School className="h-[1.1rem] w-[1.1rem]" />}
          <ChevronDown className="ml-1 h-3 w-3" />
          <span className="sr-only">Seleccionar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
          {theme === "light" && <span className="ml-auto text-xs opacity-60">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Oscuro</span>
          {theme === "dark" && <span className="ml-auto text-xs opacity-60">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("tec")}>
          <School className="mr-2 h-4 w-4" />
          <span>Modo Tec</span>
          {theme === "tec" && <span className="ml-auto text-xs opacity-60">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>Sistema</span>
          {theme === "system" && <span className="ml-auto text-xs opacity-60">✓</span>}
        </DropdownMenuItem>
        {/* Puedes agregar más temas aquí en el futuro */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}