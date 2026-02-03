"use client";

import React from "react"

import { motion } from "framer-motion";
import { Zap, Flame, Skull, Trophy, Info } from "lucide-react";

export type Difficulty = "easy" | "medium" | "hard";

interface DifficultyOption {
  id: Difficulty;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  stats: {
    speed: string;
    blocks: string;
    grid: string;
  };
}

const difficulties: DifficultyOption[] = [
  {
    id: "easy",
    name: "Easy",
    description: "Relaxed pace for beginners",
    icon: <Zap className="w-8 h-8" />,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 to-emerald-600/10",
    stats: {
      speed: "Slow",
      blocks: "2, 4",
      grid: "5 x 8",
    },
  },
  {
    id: "medium",
    name: "Medium",
    description: "Balanced challenge",
    icon: <Flame className="w-8 h-8" />,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-amber-600/10",
    stats: {
      speed: "Normal",
      blocks: "2, 4, 8",
      grid: "5 x 10",
    },
  },
  {
    id: "hard",
    name: "Hard",
    description: "For true masters only",
    icon: <Skull className="w-8 h-8" />,
    color: "text-rose-400",
    bgGradient: "from-rose-500/20 to-rose-600/10",
    stats: {
      speed: "Fast",
      blocks: "2, 4, 8, 16",
      grid: "6 x 12",
    },
  },
];

interface HomeScreenProps {
  highScores: Record<Difficulty, number>;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

export function HomeScreen({ highScores, onSelectDifficulty }: HomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(100, 149, 237, 0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 60%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center mb-10"
      >
        {/* Logo / Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            2048
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground tracking-widest uppercase">
          Falling Blocks
        </p>
        
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />
      </motion.div>

      {/* Difficulty Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 w-full max-w-md space-y-4"
      >
        <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-wider">
          Select Difficulty
        </p>

        {difficulties.map((difficulty, index) => (
          <motion.button
            key={difficulty.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectDifficulty(difficulty.id)}
            className={`w-full p-4 rounded-xl glass-dark bg-gradient-to-r ${difficulty.bgGradient} 
              border border-white/10 hover:border-white/20 transition-all duration-300
              group cursor-pointer text-left`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`${difficulty.color} transition-transform group-hover:scale-110`}>
                {difficulty.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${difficulty.color}`}>
                    {difficulty.name}
                  </h3>
                  {highScores[difficulty.id] > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                      <span>{highScores[difficulty.id].toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {difficulty.description}
                </p>
              </div>

              {/* Arrow indicator */}
              <motion.div
                className="text-muted-foreground/50 group-hover:text-foreground/70 transition-colors"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              whileHover={{ height: "auto", opacity: 1 }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Speed</span>
                  <p className="text-foreground/80 font-medium">{difficulty.stats.speed}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Blocks</span>
                  <p className="text-foreground/80 font-medium">{difficulty.stats.blocks}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Grid</span>
                  <p className="text-foreground/80 font-medium">{difficulty.stats.grid}</p>
                </div>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative z-10 mt-10 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-3">
          <Info className="w-4 h-4" />
          <span>How to Play</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/70">
          <span className="glass px-3 py-1.5 rounded-full">
            <kbd className="font-mono">←</kbd> <kbd className="font-mono">→</kbd> Move
          </span>
          <span className="glass px-3 py-1.5 rounded-full">
            <kbd className="font-mono">↓</kbd> Fast Fall
          </span>
          <span className="glass px-3 py-1.5 rounded-full">
            <kbd className="font-mono">Space</kbd> Drop
          </span>
          <span className="glass px-3 py-1.5 rounded-full">
            <kbd className="font-mono">P</kbd> Pause
          </span>
        </div>
      </motion.div>

      {/* PWA hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="relative z-10 mt-8 text-xs text-muted-foreground/50"
      >
        Add to home screen for offline play
      </motion.p>
    </div>
  );
}
