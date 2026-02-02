"use client";

import { ChevronLeft, ChevronRight, ChevronDown, ChevronsDown } from "lucide-react";

interface TouchControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onDown: () => void;
  onDrop: () => void;
}

export function TouchControls({ onLeft, onRight, onDown, onDrop }: TouchControlsProps) {
  return (
    <div className="flex justify-center gap-4 md:hidden mt-4">
      {/* Left button */}
      <button
        type="button"
        onClick={onLeft}
        className="glass-dark w-14 h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
        aria-label="Move left"
      >
        <ChevronLeft className="w-8 h-8 text-foreground" />
      </button>

      {/* Down button */}
      <button
        type="button"
        onClick={onDown}
        className="glass-dark w-14 h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
        aria-label="Move down"
      >
        <ChevronDown className="w-8 h-8 text-foreground" />
      </button>

      {/* Drop button */}
      <button
        type="button"
        onClick={onDrop}
        className="glass-dark w-14 h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
        aria-label="Hard drop"
      >
        <ChevronsDown className="w-8 h-8 text-primary" />
      </button>

      {/* Right button */}
      <button
        type="button"
        onClick={onRight}
        className="glass-dark w-14 h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
        aria-label="Move right"
      >
        <ChevronRight className="w-8 h-8 text-foreground" />
      </button>
    </div>
  );
}
