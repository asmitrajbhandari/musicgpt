"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { useSongStore } from "@/stores/songStore";
import { useMusicPlayerStore } from "@/stores/musicPlayerStore";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ArrowDownToLine, Play } from "lucide-react";
import { getSongKeyForId, getSongMapping } from "@/lib/songMapping";
import { updateSongInBackend } from "@/lib/songApi";

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
    completedAt?: number;
    hasBeenPlayed?: boolean;
    liked?: boolean;
    disliked?: boolean;
    downloaded?: boolean;
    userId?: string;
  };
}

export default function MusicList({ musicItem }: MusicListProps) {
  const progressPercentage = musicItem.progress || 0;
  const showPlayer = useMusicPlayerStore((state) => state.showPlayer);
  const { updateMusicItem } = useSongStore();

  // Check if green dot should be shown (reactive)
  const showGreenDot = musicItem.status === 'completed' && 
                       !musicItem.hasBeenPlayed && 
                       musicItem.completedAt && 
                       (Date.now() - musicItem.completedAt) < 60000;

  // Check and remove green dot after 1 minute
  useEffect(() => {
    if (musicItem.completedAt && musicItem.status === 'completed' && !musicItem.hasBeenPlayed) {
      const oneMinuteInMs = 60000;
      const timeSinceCompletion = Date.now() - musicItem.completedAt;
      const remainingTime = oneMinuteInMs - timeSinceCompletion;
      
      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          updateMusicItem(musicItem.id, { hasBeenPlayed: true });
        }, remainingTime);
        
        return () => clearTimeout(timer);
      } else {
        updateMusicItem(musicItem.id, { hasBeenPlayed: true });
      }
    }
  }, [musicItem.completedAt, musicItem.status, musicItem.hasBeenPlayed, musicItem.id, updateMusicItem]);

  // Render if there's a prompt OR if the item is already generating/completed
  if (!musicItem.prompt && musicItem.status === "idle") {
    return null;
  }

  const handlePlayClick = () => {
    // Mark song as played
    updateMusicItem(musicItem.id, { hasBeenPlayed: true });
    
    // Assign song mapping if not already assigned
    if (!musicItem.result?.audio_url) {
      // Get consistent song key for this specific song
      const songKey = getSongKeyForId(musicItem.id);
      const songMapping = getSongMapping(songKey);
      
      if (songMapping) {
        const { updateMusicItem: updateItem } = useSongStore.getState();
        updateItem(musicItem.id, {
          result: {
            audio_url: songMapping.url,
            title: songMapping.title,
            artist: songMapping.artist,
            songKey: songKey,
            duration: songMapping.duration,
            isRandomSong: true
          }
        });
      }
    }
    
    showPlayer({
      id: musicItem.id,
      title: musicItem.result?.title || musicItem.title,
      imageNumber: musicItem.imageNumber,
    });
  };

  const handleThumbsUp = async () => {
    const newLikedState = !musicItem.liked;
    try {
      await updateSongInBackend(musicItem.userId!, musicItem.id, { 
        liked: newLikedState,
        disliked: newLikedState ? false : musicItem.disliked // If liked, remove disliked
      });
      // Update local state
      updateMusicItem(musicItem.id, { 
        liked: newLikedState,
        disliked: newLikedState ? false : musicItem.disliked
      });
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  const handleThumbsDown = async () => {
    const newDislikedState = !musicItem.disliked;
    try {
      await updateSongInBackend(musicItem.userId!, musicItem.id, { 
        disliked: newDislikedState,
        liked: newDislikedState ? false : musicItem.liked // If disliked, remove liked
      });
      // Update local state
      updateMusicItem(musicItem.id, { 
        disliked: newDislikedState,
        liked: newDislikedState ? false : musicItem.liked
      });
    } catch (error) {
      console.error('Failed to update dislike status:', error);
    }
  };

  const handleDownload = async () => {
    if (musicItem.result?.audio_url) {
      // Open audio file in new tab
      window.open(musicItem.result.audio_url, '_blank');
      
      try {
        await updateSongInBackend(musicItem.userId!, musicItem.id, { downloaded: true });
        // Update local state
        updateMusicItem(musicItem.id, { downloaded: true });
      } catch (error) {
        console.error('Failed to update download status:', error);
      }
    }
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
                sizes="(max-width: 768px) 4rem, 4rem"
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
              
              {/* Green Dot Indicator */}
              {showGreenDot && (
                <div className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full z-30" />
              )}
              
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
                  <ThumbsUp 
                    size={20} 
                    className={`transition-all cursor-pointer active:scale-90 ${
                      musicItem.liked 
                        ? 'text-green-500 fill-green-500' 
                        : 'text-white/40 hover:text-white'
                    }`} 
                    onClick={handleThumbsUp}
                  />
                  <ThumbsDown 
                    size={20} 
                    className={`transition-all cursor-pointer active:scale-90 ${
                      musicItem.disliked 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-white/40 hover:text-white'
                    }`} 
                    onClick={handleThumbsDown}
                  />
                  <Button size="sm">{musicItem.version}</Button>
                  <ArrowDownToLine 
                    size={20} 
                    className={`transition-colors cursor-pointer ${
                      musicItem.downloaded 
                        ? 'text-blue-500' 
                        : 'text-white/40 hover:text-white'
                    }`} 
                    onClick={handleDownload}
                  />
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
