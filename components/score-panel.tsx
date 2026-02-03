"use client";

import { motion } from "framer-motion";
import { getBlockColor } from "@/lib/game-logic";

interface ScorePanelProps {
  score: number;
  highScore: number;
  nextValue: number;
}

export function ScorePanel({ score, highScore, nextValue }: ScorePanelProps) {
  const nextColor = getBlockColor(nextValue);

  return (
    <div className="w-full">
      {/* Single line score panel */}
      <div className="glass-dark rounded-lg p-3 flex items-center justify-between gap-4">
        {/* Score */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Score
          </p>
          <motion.p
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-lg font-bold text-foreground tabular-nums truncate"
          >
            {score.toLocaleString()}
          </motion.p>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-white/10" />

        {/* High Score */}
        <div className="flex-1 min-w-0 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Best
          </p>
          <p className="text-lg font-semibold text-primary tabular-nums truncate">
            {highScore.toLocaleString()}
          </p>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-white/10" />

        {/* Next Block */}
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Next
          </p>
          <div
            className={`
              w-10 h-10 rounded-lg
              bg-gradient-to-br ${nextColor.bg}
              flex items-center justify-center
              font-bold text-sm ${nextColor.text}
              shadow-lg ${nextColor.glow}
              relative overflow-hidden
            `}
          >
            {/* Glass effect */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.3) 0%,
                  rgba(255, 255, 255, 0.1) 30%,
                  transparent 50%
                )`,
              }}
            />
            <span className="relative z-10">{nextValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
