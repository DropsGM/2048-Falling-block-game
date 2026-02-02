"use client";

import { motion } from "framer-motion";
import { type Block, getBlockColor, CELL_SIZE } from "@/lib/game-logic";

interface GameBlockProps {
  block: Block;
  isCurrent?: boolean;
}

export function GameBlock({ block, isCurrent = false }: GameBlockProps) {
  const color = getBlockColor(block.value);
  const size = CELL_SIZE - 4;

  return (
    <motion.div
      initial={
        block.isNew
          ? { scale: 0, opacity: 0 }
          : block.merging
            ? { scale: 1.3 }
            : false
      }
      animate={{
        scale: 1,
        opacity: 1,
        x: block.x * CELL_SIZE + 2,
        y: block.y * CELL_SIZE + 2,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8,
      }}
      className="absolute"
      style={{ width: size, height: size }}
    >
      {/* 3D Block Container */}
      <div
        className={`
          relative w-full h-full rounded-xl
          transform-gpu perspective-500
          ${isCurrent ? "animate-pulse-glow" : ""}
        `}
      >
        {/* Main block face */}
        <div
          className={`
            absolute inset-0 rounded-xl
            bg-gradient-to-br ${color.bg}
            shadow-lg ${color.glow}
            overflow-hidden
          `}
        >
          {/* Glass reflection overlay */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: `linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.4) 0%,
                rgba(255, 255, 255, 0.1) 30%,
                transparent 50%,
                rgba(0, 0, 0, 0.1) 100%
              )`,
            }}
          />

          {/* Inner glow */}
          <div
            className="absolute inset-2 rounded-lg opacity-50"
            style={{
              background: `radial-gradient(
                ellipse at 30% 30%,
                rgba(255, 255, 255, 0.3) 0%,
                transparent 50%
              )`,
            }}
          />

          {/* Number */}
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              font-bold ${color.text}
              ${block.value >= 1000 ? "text-sm" : block.value >= 100 ? "text-lg" : "text-xl"}
              drop-shadow-md
            `}
            style={{
              textShadow:
                block.value >= 256
                  ? "0 0 10px rgba(255,255,255,0.5)"
                  : "none",
            }}
          >
            {block.value}
          </div>

          {/* Bottom edge (3D effect) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 rounded-b-xl"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(0,0,0,0.2))",
            }}
          />

          {/* Right edge (3D effect) */}
          <div
            className="absolute top-0 right-0 bottom-0 w-1 rounded-r-xl"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(0,0,0,0.15))",
            }}
          />
        </div>

        {/* Outer glow for high value blocks */}
        {block.value >= 128 && (
          <motion.div
            className={`absolute -inset-1 rounded-xl opacity-30 blur-sm bg-gradient-to-br ${color.bg}`}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
