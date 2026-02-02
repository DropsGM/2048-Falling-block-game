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
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-primary tracking-wider">
          2048
        </h1>
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          Falling Blocks
        </p>
      </div>

      {/* Score */}
      <div className="glass-dark rounded-xl p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Score
        </p>
        <motion.p
          key={score}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-foreground tabular-nums"
        >
          {score.toLocaleString()}
        </motion.p>
      </div>

      {/* High Score */}
      <div className="glass-dark rounded-xl p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Best
        </p>
        <p className="text-xl font-semibold text-primary tabular-nums">
          {highScore.toLocaleString()}
        </p>
      </div>

      {/* Next Block */}
      <div className="glass-dark rounded-xl p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Next
        </p>
        <div className="flex justify-center">
          <div
            className={`
              w-12 h-12 rounded-lg
              bg-gradient-to-br ${nextColor.bg}
              flex items-center justify-center
              font-bold ${nextColor.text}
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

      {/* Controls hint */}
      <div className="glass-dark rounded-xl p-4 mt-auto hidden md:block">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Controls
        </p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p><span className="text-foreground">{"<-"} {"->"}</span> Move</p>
          <p><span className="text-foreground">Down</span> Fast Fall</p>
          <p><span className="text-foreground">Space</span> Drop</p>
          <p><span className="text-foreground">P</span> Pause</p>
        </div>
      </div>
    </div>
  );
}
