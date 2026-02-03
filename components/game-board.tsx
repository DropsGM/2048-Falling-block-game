"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type Block, type Difficulty, DIFFICULTY_CONFIGS, CELL_SIZE } from "@/lib/game-logic";
import { GameBlock } from "./game-block";

interface GameBoardProps {
  grid: (Block | null)[][];
  currentBlock: Block | null;
  difficulty: Difficulty;
}

export function GameBoard({ grid, currentBlock, difficulty }: GameBoardProps) {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const boardWidth = config.gridWidth * CELL_SIZE;
  const boardHeight = config.gridHeight * CELL_SIZE;

  // Collect all blocks from grid
  const gridBlocks: Block[] = [];
  for (let y = 0; y < config.gridHeight; y++) {
    for (let x = 0; x < config.gridWidth; x++) {
      const block = grid[y][x];
      if (block) {
        gridBlocks.push(block);
      }
    }
  }

  return (
    <div className="relative">
      {/* Board container with glass effect */}
      <div
        className="relative rounded-2xl overflow-hidden glass-dark"
        style={{
          width: boardWidth + 16,
          height: boardHeight + 16,
          padding: 8,
        }}
      >
        {/* Grid background */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            width: boardWidth,
            height: boardHeight,
            background: "linear-gradient(180deg, rgba(15, 15, 30, 0.9) 0%, rgba(10, 10, 25, 0.95) 100%)",
          }}
        >
          {/* Grid lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            style={{ width: boardWidth, height: boardHeight }}
          >
            {/* Vertical lines */}
            {Array.from({ length: config.gridWidth + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * CELL_SIZE}
                y1={0}
                x2={i * CELL_SIZE}
                y2={boardHeight}
                stroke="white"
                strokeWidth="1"
              />
            ))}
            {/* Horizontal lines */}
            {Array.from({ length: config.gridHeight + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * CELL_SIZE}
                x2={boardWidth}
                y2={i * CELL_SIZE}
                stroke="white"
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* Danger zone indicator at top */}
          <div
            className="absolute top-0 left-0 right-0 h-[56px] pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, transparent 100%)",
            }}
          />

          {/* Blocks container */}
          <div className="absolute inset-0">
            <AnimatePresence mode="popLayout">
              {/* Grid blocks */}
              {gridBlocks.map((block) => (
                <GameBlock key={block.id} block={block} />
              ))}

              {/* Current falling block */}
              {currentBlock && (
                <GameBlock
                  key={currentBlock.id}
                  block={currentBlock}
                  isCurrent
                />
              )}
            </AnimatePresence>
          </div>

          {/* Ambient glow effects */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Border glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: "inset 0 0 30px rgba(212, 175, 55, 0.1), 0 0 40px rgba(0, 0, 0, 0.5)",
          }}
        />
      </div>

      {/* Decorative corner accents */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-primary/30 rounded-tl" />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-primary/30 rounded-tr" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-primary/30 rounded-bl" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-primary/30 rounded-br" />
    </div>
  );
}
