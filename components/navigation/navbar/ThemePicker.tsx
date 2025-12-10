"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsClient } from "@uidotdev/usehooks";
import { useTheme } from "next-themes";

const ThemePicker = () => {
  const isClient = useIsClient();
  const { setTheme, resolvedTheme: theme, systemTheme } = useTheme();

  const displayTheme = theme === "system" ? systemTheme : theme;

  return isClient ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Select theme" size="icon" variant="outline">
          {displayTheme?.includes("light") && (
            <SunIcon aria-hidden="true" size={18} />
          )}
          {displayTheme?.includes("dark") && (
            <MoonIcon aria-hidden="true" size={18} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-32">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <SunIcon aria-hidden="true" size={18} />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <MoonIcon aria-hidden="true" size={18} />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <MonitorIcon aria-hidden="true" size={18} />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;
};

export default ThemePicker;
