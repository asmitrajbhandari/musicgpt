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
  const [previousAudioUrl, setPreviousAudioUrl] = useState<string | null>(null);
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

  // Reset audio element when switching between different S3 URLs
  useEffect(() => {
    if (audioUrl && previousAudioUrl && audioUrl !== previousAudioUrl) {
      console.log('Audio URL changed, resetting audio element:', {
        from: previousAudioUrl,
        to: audioUrl
      });
      
      if (audioRef.current) {
        // Stop current playback
        audioRef.current.pause();
        setIsPlaying(false);
        
        // Reset time and duration
        setCurrentTime(0);
        setDuration(0);
        
        // Force complete reset of audio element
        audioRef.current.src = '';
        audioRef.current.load();
        
        // Small delay before setting new source
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            console.log('Audio element reset and new source loaded');
          }
        }, 100);
      }
      
      setPreviousAudioUrl(audioUrl);
    } else if (audioUrl && !previousAudioUrl) {
      // First time setting audio URL
      setPreviousAudioUrl(audioUrl);
    }
  }, [audioUrl, previousAudioUrl]);

  const handlePlayPause = async () => {
    if (!audioRef.current) {
      console.log('Audio element not ready yet');
      return;
    }

    const newPlayingState = !isPlaying;
    
    try {
      if (newPlayingState) {
        // For S3 URLs, ensure proper loading and reset if needed
        if (audioUrl && audioUrl.includes('s3')) {
          console.log('S3 URL detected, preparing for playback...');
          
          // Check if we need to reset due to URL change
          if (audioRef.current.src !== audioUrl) {
            console.log('Audio src mismatch, reloading...');
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          // Wait 1.5 seconds for S3 URL to be ready
          console.log('Waiting 1.5 seconds for S3 URL to be ready...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          console.log('Attempting to play S3 audio...');
          
          // Enhanced retry logic for S3 URLs
          let retryCount = 0;
          const maxRetries = 5;
          const retryDelays = [500, 1000, 2000, 3000, 5000];
          
          while (retryCount < maxRetries) {
            try {
              console.log(`S3 Audio play attempt ${retryCount + 1}/${maxRetries}`);
              
              // Check network state before playing
              if (audioRef.current.networkState === HTMLMediaElement.NETWORK_LOADING) {
                console.log('S3 Audio still loading, waiting...');
                await new Promise(resolve => setTimeout(resolve, 300));
              }
              
              // Clear any previous buffered data for S3 URLs
              if (retryCount > 0 && audioUrl.includes('s3')) {
                console.log('Clearing buffer and reloading for S3 retry...');
                audioRef.current.load();
                await new Promise(resolve => setTimeout(resolve, 300));
              }
              
              await audioRef.current.play();
              setIsPlaying(true);
              localStorage.removeItem(`music-paused-${musicItem.id}`);
              console.log(`S3 Audio started playing successfully on attempt ${retryCount + 1}`);
              break;
            } catch (playError) {
              retryCount++;
              console.log(`S3 Audio play attempt ${retryCount} failed:`, playError);
              
              // Check for 206 Partial Content specific errors
              if (playError instanceof Error && (
                playError.message.includes('206') || 
                playError.message.includes('Partial Content') ||
                playError.message.includes('network') ||
                playError.message.includes('loading')
              )) {
                console.log('Detected possible 206 Partial Content issue, applying special retry strategy...');
                
                // Force complete reload for 206 issues
                audioRef.current.load();
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              
              if (retryCount >= maxRetries) {
                console.error('All S3 retry attempts exhausted, giving up');
                throw playError;
              }
              
              // Progressive delay with reload strategy
              const delay = retryDelays[retryCount - 1] || 1000;
              console.log(`Waiting ${delay}ms before retry ${retryCount + 1}...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              
              // Reload audio source before retry
              console.log('Reloading audio source before retry...');
              audioRef.current.load();
              
              // Additional wait after reload
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
        } else {
          // Non-S3 URLs, play normally
          await audioRef.current.play();
          setIsPlaying(true);
          localStorage.removeItem(`music-paused-${musicItem.id}`);
          console.log('Audio started playing successfully');
        }
      } else {
        // Pause the audio
        audioRef.current.pause();
        setIsPlaying(false);
        localStorage.setItem(`music-paused-${musicItem.id}`, 'true');
        console.log('Audio paused');
      }
    } catch (error) {
      console.error('Failed to play/pause audio:', error);
      setIsPlaying(false);
      localStorage.setItem(`music-paused-${musicItem.id}`, 'true');
      
      // Show user-friendly error for S3 issues
      if (error instanceof Error && error.message.includes('net::ERR_FAILED')) {
        console.warn('S3 network error detected, attempting fallback reload...');
        
        // Fallback: Try to recreate the audio element
        if (audioUrl && audioUrl.includes('s3') && audioRef.current) {
          try {
            console.log('Attempting fallback reload of S3 audio...');
            // Force reload by changing src temporarily
            const originalSrc = audioRef.current.src;
            audioRef.current.src = '';
            audioRef.current.load();
            
            // Wait a bit then restore src
            await new Promise(resolve => setTimeout(resolve, 100));
            audioRef.current.src = originalSrc;
            audioRef.current.load();
            
            console.log('Fallback reload completed, user can try playing again');
          } catch (fallbackError) {
            console.error('Fallback reload also failed:', fallbackError);
          }
        }
      }
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

  // Handle audio element ready state
  const handleAudioReady = () => {
    console.log('Audio element is ready:', audioUrl);
    if (audioRef.current) {
      console.log('Audio ready state:', {
        readyState: audioRef.current.readyState,
        currentTime: audioRef.current.currentTime,
        duration: audioRef.current.duration,
        networkState: audioRef.current.networkState
      });
    }
  };

  // Handle network state changes for S3 URLs
  const handleNetworkStateChange = () => {
    if (audioRef.current && audioUrl.includes('s3')) {
      console.log('S3 Audio network state changed:', {
        networkState: audioRef.current.networkState,
        readyState: audioRef.current.readyState
      });
      
      // Check for 206 Partial Content issues
      if (audioRef.current.networkState === HTMLMediaElement.NETWORK_LOADING) {
        console.log('S3 Audio is loading, checking for partial content issues...');
      }
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
    // This useEffect now only handles the animation controls
    // Actual audio playback is handled directly in handlePlayPause
    if (isPlaying) {
      controls.start({ width: "100%" });
    } else {
      controls.stop();
    }
  }, [isPlaying, controls]);

  // Auto-play when player becomes visible and has audio URL
  useEffect(() => {
    if (isVisible && audioUrl && audioRef.current && !isPlaying) {
      // Only auto-play if this is a new song (not user-paused)
      const hasUserPaused = localStorage.getItem(`music-paused-${musicItem.id}`);
      if (!hasUserPaused) {
        // For S3 URLs, preload the audio and wait 1.5 seconds
        if (audioUrl.includes('s3')) {
          console.log('S3 URL detected for auto-play, preloading and waiting 1.5 seconds...');
          audioRef.current.load();
        }
        
        // Set appropriate delay based on URL type
        const delay = audioUrl.includes('s3') ? 1600 : 100; // 1.5s + 100ms buffer for S3
        
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
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, audioUrl, isPlaying, musicItem.id]);

  // Preload S3 audio when URL becomes available
  useEffect(() => {
    if (audioUrl && audioUrl.includes('s3') && audioRef.current && !isPlaying) {
      console.log('S3 URL available, preloading audio...');
      audioRef.current.load();
    }
  }, [audioUrl]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="music-player"
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[900px] max-w-[900px] music-player-offset left-1/2"
        >
          {/* Close Button */}
          <button
            onClick={hidePlayer}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-50"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative w-full h-20 bg-[#1D2125] rounded-2xl overflow-hidden">
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
            <div className="flex flex-row items-center justify-between h-full px-4 sm:px-6 relative z-0">
              {/* Left Section: Music Info */}
              <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden relative flex-shrink-0">
                  <Image
                    src={`/assets/images/generate-${musicItem.imageNumber}.webp`}
                    alt={musicItem.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="text-white text-sm sm:text-base font-semibold truncate">{musicItem.title}</div>
                  <div className="text-white/60 text-xs sm:text-sm truncate">{artist || 'asmitraj'}</div>
                </div>
              </div>

              {/* Center Section: Controls */}
              <div className="flex flex-row items-center gap-2 sm:gap-4 flex-shrink-0">
                <button
                  onClick={handlePlayPause}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-black fill-black" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-black fill-black" />
                  )}
                </button>
              </div>

              {/* Right Section: Actions */}
              <div className="flex flex-row items-center gap-2 flex-shrink-0">
                <button 
                  onClick={handleHeartClick}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-colors ${
                    isLiked 
                      ? 'bg-white border-white' 
                      : 'border-white/20 hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
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
              crossOrigin="anonymous"
              preload="metadata"
              onEnded={() => setIsPlaying(false)}
              onError={(e) => {
                console.error('Audio playback error:', e);
                if (audioUrl.includes('s3')) {
                  console.warn('S3 Audio error detected, this often resolves on retry');
                }
              }}
              onLoadedMetadata={updateTime}
              onTimeUpdate={updateTime}
              onDurationChange={updateTime}
              onCanPlay={handleAudioReady}
              onCanPlayThrough={() => console.log('Audio can play through without buffering')}
              onLoadStart={() => {
                if (audioUrl.includes('s3')) {
                  console.log('S3 Audio loading started...');
                }
              }}
              onProgress={() => {
                if (audioUrl.includes('s3') && audioRef.current) {
                  console.log('S3 Audio loading progress:', {
                    networkState: audioRef.current.networkState,
                    readyState: audioRef.current.readyState,
                    buffered: audioRef.current.buffered.length
                  });
                  handleNetworkStateChange();
                }
              }}
              onStalled={() => {
                if (audioUrl.includes('s3')) {
                  console.log('S3 Audio stalled, possible 206 Partial Content issue');
                  handleNetworkStateChange();
                }
              }}
              onSuspend={() => {
                if (audioUrl.includes('s3')) {
                  console.log('S3 Audio suspended, possible 206 Partial Content issue');
                  handleNetworkStateChange();
                }
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
