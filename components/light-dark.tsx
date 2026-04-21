"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

export default function LightDarkToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-accent"
    >
      {/* این الگو هیچ Hydration Error تولید نمی‌کند */}
      <SunIcon className="size-5 dark:hidden" />
      <MoonIcon className="size-5 hidden dark:block" />
    </button>
  );
}
