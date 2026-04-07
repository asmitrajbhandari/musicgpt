"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Pause, Heart, X } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import RoundedButton from "./ui/rounded-button";
import CircleButton from "./ui/circle-button";
import { useMusicPlayerStore } from "@/stores/musicPlayerStore";
import { useSongStore } from "@/stores/songStore";
import { updateSongInBackend } from "@/lib/songApi";

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const controls = useAnimation();
  const hidePlayer = useMusicPlayerStore((state) => state.hidePlayer);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const { musicItems } = useSongStore();
  
  // Get the actual music item with result data
  const currentMusicItem = musicItems.find(item => item.id === musicItem.id);
  const audioUrl = currentMusicItem?.result?.audio_url;
  const artist = currentMusicItem?.result?.artist;
  const isLiked = currentMusicItem?.liked || false;

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    // Save pause state to localStorage
    if (newPlayingState) {
      localStorage.removeItem(`music-paused-${musicItem.id}`);
    } else {
      localStorage.setItem(`music-paused-${musicItem.id}`, 'true');
    }
  };

  const handleHeartClick = async () => {
    const { updateMusicItem } = useSongStore.getState();
    const newLikedState = !isLiked;
    
    try {
      // Update backend first
      await updateSongInBackend(currentMusicItem?.userId!, musicItem.id, { 
        liked: newLikedState,
        disliked: newLikedState ? false : currentMusicItem?.disliked // If liked, remove disliked
      });
      
      // Update local state
      updateMusicItem(musicItem.id, { 
        liked: newLikedState,
        disliked: newLikedState ? false : currentMusicItem?.disliked
      });
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update current time and duration from audio element
  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
      
      // Update progress bar based on actual audio progress
      const progress = duration > 0 ? (audioRef.current.currentTime / duration) * 100 : 0;
      controls.set({ width: `${progress}%` });
    }
  };

  // Handle progress bar click for navigation
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercentage = clickX / rect.width;
      const newTime = clickPercentage * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Update progress bar
      const progress = (newTime / duration) * 100;
      controls.set({ width: `${progress}%` });
    }
  };

  // Handle progress bar hover for time preview
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const hoverX = e.clientX - rect.left;
      const hoverPercentage = hoverX / rect.width;
      const newHoverTime = hoverPercentage * duration;
      
      setHoverPosition(hoverX);
      setHoverTime(newHoverTime);
      setIsHovering(true);
    }
  };

  const handleProgressLeave = () => {
    setIsHovering(false);
  };

  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.play();
      }
    } else {
      controls.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, controls]);

  // Auto-play when player becomes visible and has audio URL
  useEffect(() => {
    if (isVisible && audioUrl && audioRef.current && !isPlaying) {
      // Only auto-play if this is a new song (not user-paused)
      const hasUserPaused = localStorage.getItem(`music-paused-${musicItem.id}`);
      if (!hasUserPaused) {
        // Small delay to ensure audio is ready
        const timer = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play()
              .then(() => {
                setIsPlaying(true);
                console.log('Audio started playing successfully');
              })
              .catch((error) => {
                console.error('Failed to play audio:', error);
                setIsPlaying(false);
              });
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, audioUrl, isPlaying, musicItem.id]);

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
            {/* Progress Bar with Hover and Click */}
            <div 
              ref={progressBarRef}
              className="absolute top-0 left-0 w-full h-[2px] bg-gray-700 cursor-pointer z-10"
              onClick={handleProgressClick}
              onMouseMove={handleProgressHover}
              onMouseLeave={handleProgressLeave}
            >
              {/* Progress Fill */}
              <motion.div
                className="absolute top-0 left-0 h-[2px] progress-bar-gradient pointer-events-none"
                initial={{ width: "0%" }}
                animate={controls}
                transition={{ duration: 0.1 }}
              />
              
              {/* Hover Tooltip */}
              {isHovering && (
                <div 
                  className="absolute top-6 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-50"
                  style={{ left: `${hoverPosition}px` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

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
                  <div className="text-white/60 text-xs">{artist || 'asmitraj'}</div>
                </div>
              </div>

              {/* Center Section: Controls */}
              <div className="flex flex-row items-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-black fill-black" />
                  ) : (
                    <Play className="w-5 h-5 text-black fill-black" />
                  )}
                </button>
              </div>

              {/* Time Display */}
              <div className="flex flex-row items-center gap-2">
                <span className="text-white/60 text-xs">{formatTime(currentTime)}</span>
                <span className="text-white/40 text-xs">/</span>
                <span className="text-white/60 text-xs">{formatTime(duration)}</span>
              </div>

              {/* Right Section: Actions */}
              <div className="flex flex-row items-center gap-2">
                <button 
                  onClick={handleHeartClick}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                    isLiked 
                      ? 'bg-white border-white' 
                      : 'border-white/20 hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-5 h-5 transition-colors ${
                    isLiked 
                      ? 'text-black fill-black' 
                      : 'text-white/60'
                  }`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Hidden Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onError={(e) => console.error('Audio playback error:', e)}
              onLoadedMetadata={updateTime}
              onTimeUpdate={updateTime}
              onDurationChange={updateTime}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
