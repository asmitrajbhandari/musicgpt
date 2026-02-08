"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Shuffle, SkipBack, Play, Pause, SkipForward, RotateCcw, Heart, X } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import RoundedButton from "./ui/rounded-button";
import CircleButton from "./ui/circle-button";
import { useMusicPlayerStore } from "@/stores/musicPlayerStore";

interface MusicPlayerProps {
  musicItem: {
    id: string;
    title: string;
    imageNumber: number;
  };
  isVisible: boolean;
  onClose?: () => void;
}

export default function MusicPlayer({ musicItem, isVisible }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const controls = useAnimation();
  const hidePlayer = useMusicPlayerStore((state) => state.hidePlayer);

  useEffect(() => {
    if (isPlaying) {
      controls.start({
        width: "100%",
        transition: {
          duration: 30,
          ease: "linear",
          repeat: Infinity,
        },
      });
    } else {
      controls.stop();
    }
  }, [isPlaying, controls]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="music-player"
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 z-50 w-[900px] music-player-offset"
        >
          {/* Close Button */}
          <button
            onClick={hidePlayer}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-50"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative w-[900px] h-20 bg-[#1D2125] rounded-2xl overflow-hidden">
            {/* Animated Progress Bar */}
            <motion.div
              className="absolute top-0 left-0 h-[2px] z-10 progress-bar-gradient"
              initial={{ width: "0%" }}
              animate={controls}
            />

            {/* Main Content */}
            <div className="flex flex-row items-center justify-between h-full px-6 relative z-0">
              {/* Left Section: Music Info */}
              <div className="flex flex-row items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden relative flex-shrink-0">
                  <Image
                    src={`/assets/images/generate-${musicItem.imageNumber}.webp`}
                    alt={musicItem.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="text-white text-sm font-semibold">{musicItem.title}</div>
                  <div className="text-white/60 text-xs">asmitraj</div>
                </div>
              </div>

              {/* Center Section: Controls */}
              <div className="flex flex-row items-center gap-4">
                <button className="text-white/60 hover:text-white transition-colors">
                  <Shuffle className="w-5 h-5" />
                </button>
                <button className="text-white/60 hover:text-white transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-black fill-black" />
                  ) : (
                    <Play className="w-5 h-5 text-black fill-black" />
                  )}
                </button>
                <button className="text-white/60 hover:text-white transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
                <button className="text-white/60 hover:text-white transition-colors">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Right Section: Actions */}
              <div className="flex flex-row items-center gap-2">
                <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Heart className="w-5 h-5 text-white/60" />
                </button>
                <button className="px-4 py-2 rounded-full bg-transparent border border-[#3a3e42] hover:bg-[#1d2125] transition-all duration-200 active:scale-95">
                  <span className="text-white text-sm text-white/60">Share</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
