"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Play, Pause } from "lucide-react";

interface GameOverlayProps {
  gameOver: boolean;
  isPaused: boolean;
  score: number;
  onRestart: () => void;
  onTogglePause: () => void;
}

export function GameOverlay({
  gameOver,
  isPaused,
  score,
  onRestart,
  onTogglePause,
}: GameOverlayProps) {
  return (
    <>
      {/* Pause button */}
      <button
        type="button"
        onClick={onTogglePause}
        disabled={gameOver}
        className="absolute top-4 right-4 glass-dark w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isPaused ? "Resume game" : "Pause game"}
      >
        {isPaused ? (
          <Play className="w-5 h-5 text-primary" />
        ) : (
          <Pause className="w-5 h-5 text-foreground" />
        )}
      </button>

      <AnimatePresence>
        {/* Game Over overlay */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center p-8"
            >
              <h2 className="text-3xl font-bold text-primary mb-2">Game Over</h2>
              <p className="text-muted-foreground mb-2">Final Score</p>
              <p className="text-4xl font-bold text-foreground mb-6">
                {score.toLocaleString()}
              </p>
              <button
                type="button"
                onClick={onRestart}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Paused overlay */}
        {isPaused && !gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center p-8"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">Paused</h2>
              <button
                type="button"
                onClick={onTogglePause}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                <Play className="w-5 h-5" />
                Resume
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
