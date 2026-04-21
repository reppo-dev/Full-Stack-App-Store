"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MoonIcon, SunIcon } from "lucide-react";

const LightDarkToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  return (
    <Tooltip>
      <TooltipTrigger
        className="fixed top-1/2 right-2"
        onClick={() => setIsDarkMode((prevValue) => !prevValue)}
      >
        {isDarkMode ? <MoonIcon /> : <SunIcon />}
      </TooltipTrigger>
      <TooltipContent>
        {isDarkMode ? `${(<MoonIcon />)},dark` : `${(<SunIcon />)},light`}
      </TooltipContent>
    </Tooltip>
  );
};

export default LightDarkToggle;
