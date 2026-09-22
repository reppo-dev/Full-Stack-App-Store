"use client";

import React, { useState } from "react";
import {
  Zap,
  Tag,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Gamepad2,
  Gift,
} from "lucide-react";
import StoryViewerModal from "./StoryViewerModal";
import { Story } from "@/features/ui/api/ui.client";

interface QuickAccessStoriesProps {
  stories?: Story[];
}

export default function QuickAccessStories({ stories = [] }: QuickAccessStoriesProps) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  if (stories.length === 0) return null;

  const handleOpenStory = (index: number) => {
    setSelectedStoryIndex(index);
  };

  const handleCloseStory = () => {
    setSelectedStoryIndex(null);
  };

  const getIcon = (name: string | null) => {
    switch (name) {
      case "Tag": return Tag;
      case "Smartphone": return Smartphone;
      case "Laptop": return Laptop;
      case "Headphones": return Headphones;
      case "Watch": return Watch;
      case "Gamepad2": return Gamepad2;
      case "Gift": return Gift;
      case "Zap":
      default:
        return Zap;
    }
  };

  // Convert DB Story to StoryItem format for Modal
  const mappedStories = stories.map(story => ({
    id: story.id.toString(),
    title: story.title,
    subtitle: story.subtitle || "",
    badge: story.badge || undefined,
    category: story.category || "",
    image: story.image_url,
    link: story.link_url || "/products",
    buttonText: story.button_text || "Shop Now",
    gradient: story.gradient_class || "from-amber-400 to-orange-500",
    icon: getIcon(story.icon_name),
    featuredPrice: story.featured_price || undefined,
  }));

  return (
    <>
      <section className="w-full py-5 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-7 min-w-max px-4">
          {mappedStories.map((story, index) => {
            const Icon = story.icon;
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => handleOpenStory(index)}
                className="flex flex-col items-center gap-2 group transition-transform hover:-translate-y-1 focus:outline-hidden cursor-pointer"
              >
                <div className="relative">
                  {/* Dynamic Gradient Ring Outer Border */}
                  <div
                    className={`p-0.5 rounded-full bg-gradient-to-tr ${story.gradient} shadow-xs group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-card p-0.5 flex items-center justify-center">
                      <div
                        className={`w-full h-full rounded-full bg-gradient-to-tr ${story.gradient} flex items-center justify-center text-white shadow-inner`}
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
                      </div>
                    </div>
                  </div>

                  {story.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-background tracking-tighter uppercase">
                      {story.badge}
                    </span>
                  )}
                </div>

                <span className="text-[11px] sm:text-xs font-semibold text-foreground/85 group-hover:text-blue-600 transition-colors text-center max-w-[80px] truncate">
                  {story.category}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Story Viewer Modal */}
      <StoryViewerModal
        stories={mappedStories}
        initialIndex={selectedStoryIndex ?? 0}
        isOpen={selectedStoryIndex !== null}
        onClose={handleCloseStory}
      />
    </>
  );
}
