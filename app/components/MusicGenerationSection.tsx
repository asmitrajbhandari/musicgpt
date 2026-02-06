"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useSongStore } from "@/stores/songStore";
import { Button } from "@/components/ui/button";

export default function MusicGenerationSection() {
  const { status, progress, prompt } = useSongStore();
  const progressPercentage = progress || 0;

  return (
      <>
              <div 
                className="absolute rounded-lg inset-0 bg-[#1C2024] z-0"
                style={{
                  width: `${progressPercentage}%`,
                  transition: 'width 0.3s ease-out',
                  display: progressPercentage === 100 ? 'none' : 'block',
                }}
              />
              <div className="flex flex-col gap-4 p-1 relative z-10">
                <div className="flex flex-row gap-2">
                  <div className="rounded-lg bg-[#212529] flex items-center justify-center relative">
                    <div className="w-16 rounded-lg h-16 relative overflow-hidden">
<Image
                      src="/assets/images/generate-1.webp"
                      alt="Generate music background"
                      fill
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    />
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
                    {status !== "completed" && (
                      <motion.div
                        className="absolute top-1/2 left-1/2 w-24 h-24 rounded-lg opacity-50 z-20"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(132, 36, 241, .9), rgba(85, 23, 241, 0) 80%)",
                          left: "50%",
                          top: "50%",
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
                    {status !== "completed" && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium z-30">
                        {progressPercentage}%
                      </div>
                    )}
                    {status === "completed" && (
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
                  <div className="flex items-center flex-1">
                    <div className="text-white text-sm">
                      create a funky house song with female voice
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button size="sm">v1</Button>
                  </div>
                </div>
              </div>
              </>
  );
}
