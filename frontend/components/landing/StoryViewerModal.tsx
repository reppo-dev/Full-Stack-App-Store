"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface StoryData {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  image: string;
  link: string;
  buttonText: string;
  gradient: string;
  category: string;
  featuredPrice?: string;
}

interface StoryViewerModalProps {
  stories: StoryData[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export default function StoryViewerModal({
  stories,
  initialIndex,
  isOpen,
  onClose,
}: StoryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      elapsedRef.current = 0;
      setIsPaused(false);
    }
  }, [isOpen, initialIndex]);

  // Handle progress timer
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = 50; // update every 50ms
    const timer = setInterval(() => {
      elapsedRef.current += interval;
      const pct = Math.min(100, (elapsedRef.current / STORY_DURATION) * 100);
      setProgress(pct);

      if (elapsedRef.current >= STORY_DURATION) {
        // Advance to next story
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          elapsedRef.current = 0;
          setProgress(0);
        } else {
          // Finished all stories -> close
          onClose();
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentIndex, stories.length, onClose]);

  // Handle keyboard events (ESC, Left, Right)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, stories.length]);

  if (!isOpen || !stories[currentIndex]) return null;

  const currentStory = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      elapsedRef.current = 0;
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      elapsedRef.current = 0;
      setProgress(0);
    } else {
      elapsedRef.current = 0;
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 select-none animate-in fade-in">
      {/* Navigation Arrows for Desktop */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={currentIndex === 0}
        aria-label="Previous story"
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next story"
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white items-center justify-center transition-all"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Main Story Container Frame */}
      <div
        className="relative w-full max-w-sm sm:max-w-md h-[88vh] max-h-[780px] rounded-3xl overflow-hidden shadow-2xl bg-slate-950 flex flex-col justify-between border border-white/15"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Story Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={currentStory.image}
            alt={currentStory.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95" />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        {/* Top Header & Progress Bar */}
        <div className="relative z-20 p-4 space-y-3">
          {/* Multi-story Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((s, idx) => {
              let fillWidth = "0%";
              if (idx < currentIndex) fillWidth = "100%";
              else if (idx === currentIndex) fillWidth = `${progress}%`;

              return (
                <div
                  key={s.id}
                  className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                    style={{ width: fillWidth }}
                  />
                </div>
              );
            })}
          </div>

          {/* Story Profile & Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-9 w-9 rounded-full bg-gradient-to-tr ${currentStory.gradient} p-0.5`}
              >
                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                  DS
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-bold tracking-tight">
                    {currentStory.category}
                  </span>
                  {currentStory.badge && (
                    <Badge className="bg-amber-400 text-amber-950 font-extrabold text-[10px] px-1.5 py-0">
                      {currentStory.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-white/70 block">
                  Today's Special Highlights
                </span>
              </div>
            </div>

            {/* Action Buttons: Pause & Close */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? (
                  <Play className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tap areas for Prev / Next on Mobile */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          />
          <div className="w-1/3 h-full" />
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          />
        </div>

        {/* Story Bottom Content & CTA */}
        <div className="relative z-20 p-5 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white leading-tight drop-shadow-md">
              {currentStory.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed drop-shadow-sm">
              {currentStory.subtitle}
            </p>
          </div>

          {currentStory.featuredPrice && (
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-xs font-semibold text-white">
                Starting from <span className="text-amber-300 font-bold">{currentStory.featuredPrice}</span>
              </span>
            </div>
          )}

          {/* Action CTA Button */}
          <Link
            href={currentStory.link}
            onClick={() => onClose()}
            className="block w-full"
          >
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 group">
              <ShoppingBag className="h-4 w-4" />
              {currentStory.buttonText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
