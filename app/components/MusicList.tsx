"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSongStore } from "@/stores/songStore";
import { useMusicPlayerStore } from "@/stores/musicPlayerStore";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ArrowDownToLine, Play } from "lucide-react";

interface MusicListProps {
  musicItem: {
    id: string;
    title: string;
    prompt: string;
    status: "idle" | "pending" | "generating" | "completed" | "failed";
    progress: number;
    progressText?: string;
    result?: any;
    error?: string;
    version: string;
    imageNumber: number;
  };
}

export default function MusicList({ musicItem }: MusicListProps) {
  const progressPercentage = musicItem.progress || 0;
  const showPlayer = useMusicPlayerStore((state) => state.showPlayer);

  // Render if there's a prompt OR if the item is already generating/completed
  if (!musicItem.prompt && musicItem.status === "idle") {
    return null;
  }

  const handlePlayClick = () => {
    showPlayer({
      id: musicItem.id,
      title: musicItem.title,
      imageNumber: musicItem.imageNumber,
    });
  };

  return (
    <div className={`relative rounded-lg ${musicItem.status === 'completed' ? 'music-item-hover' : ''}`}>
      <div
        className="absolute rounded-lg inset-0 bg-[#1C2024] z-0 music-item-progress-bg"
        style={{
          width: `${progressPercentage}%`,
          display: progressPercentage === 100 ? "none" : "block",
        }}
      />
      <div className="flex flex-col gap-4 p-1 relative z-10">
        <div className="flex flex-row gap-2 relative group/actions group/play">
          <div className="rounded-lg bg-[#212529] flex items-center justify-center relative">
            <div className="w-16 rounded-lg h-16 relative overflow-hidden">
              <Image
                src={`/assets/images/generate-${musicItem.imageNumber}.webp`}
                alt="Generate music background"
                fill
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
              
              {/* Play Button Overlay - Only for completed items */}
              {musicItem.status === "completed" && (
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/play:opacity-100 transition-opacity duration-200 z-50 cursor-pointer"
                  onClick={handlePlayClick}
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              )}
              {/* 1. The Black Fade */}
              <motion.div
                className="absolute inset-0 w-full h-full rounded-lg bg-[#111] z-10"
                animate={{
                  opacity:
                    progressPercentage >= 50
                      ? 1 - (progressPercentage - 50) / 50
                      : 1,
                }}
                transition={{
                  duration: 0.5,
                  ease: "linear",
                }}
              />
              {/* 2. The Rotating Light */}
              {musicItem.status !== "completed" && (
                <motion.div
                  className="absolute w-24 h-24 rounded-lg opacity-50 z-20 rotating-light-gradient"
                  style={{
                    x: "-50%",
                    y: "-50%",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </div>

            {/* 3. The Text */}
            {musicItem.status !== "completed" && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium z-30">
                {progressPercentage}%
              </div>
            )}
            {musicItem.status === "completed" && (
              <div className="absolute -top-0.5 -left-1 w-4 h-4 z-40 overflow-visible pointer-events-none">
                {/* 4. The Solid Core Dot */}
                <motion.div
                  className="absolute inset-0 bg-[#6bffac] rounded-full"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{
                    boxShadow: [
                      "0 0 15px rgba(107, 255, 172, 0.6)",
                      "0 0 25px rgba(107, 255, 172, 0.9)",
                      "0 0 15px rgba(107, 255, 172, 0.6)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-[#6bffac] rounded-full"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{
                    scale: [1, 1.6, 0],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center flex-1 min-w-0">
            {" "}
            {/* Ensure this has min-w-0 */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              {" "}
              {/* And this */}
              {musicItem.status === "completed" ? (
                <>
                  <span className="text-white text-md font-semibold truncate block max-w-full">
                    {musicItem.title}
                  </span>
                  <span className="text-white/60 text-sm truncate block max-w-full">
                    {musicItem.prompt || "No prompt available"}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm truncate block max-w-full text-white shimmer-text capitalize">
                    {musicItem.prompt}
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={musicItem.progressText}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="text-white/60 text-sm truncate block max-w-full"
                    >
                      {musicItem.progressText || "Processing..."}
                    </motion.span>
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center">
            {progressPercentage === 100 ? (
              <div className="flex items-center h-full gap-2">
                {/* Action buttons - shown on hover */}
                <div className="hidden group-hover/actions:flex items-center gap-2">
                  <ThumbsUp size={20} className="text-white/40 hover:text-white transition-all cursor-pointer active:scale-90" />
                  <ThumbsDown size={20} className="text-white/40 hover:text-white transition-all cursor-pointer active:scale-90" />
                  <Button size="sm">{musicItem.version}</Button>
                  <ArrowDownToLine size={20} className="text-white/40 hover:text-white transition-colors cursor-pointer" />
                </div>
                {/* Dots icon - always visible */}
                <Image
                  src="/assets/svg/dots.svg"
                  alt="More options"
                  width={20}
                  height={20}
                  className="opacity-40 cursor-pointer"
                />
              </div>
            ) : (
              <Button size="sm">{musicItem.version}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
