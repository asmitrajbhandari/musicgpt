"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  TrendingUp,
  ChevronRight,
  Info,
  TriangleAlert,
  TriangleAlert as LucideTriangleAlert,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MusicList from "./MusicList";
import Image from "next/image";
import { useSongStore } from "@/stores/songStore";
import { useWarningStore } from "@/stores/warningStore";
import { useInvalidPromptStore } from "@/stores/invalidPromptStore";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isValidPrompt } from "@/lib/utils/promptValidator";

export default function Profile() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { musicItems } = useSongStore();
  const { showServerBusyWarning } = useWarningStore();
  const { invalidPrompts } = useInvalidPromptStore();

  return (
    <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Button
            size="sm"
            variant="default"
            className="profile-gradient-ring focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          >
            A
          </Button>
          {/* Notification Badge */}
          <div className="absolute top-0 right-0 w-4 h-4 bg-[#6BFFAC] rounded-full flex items-center justify-center text-black text-xs">
            2
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-[#16191C] backdrop-blur-[40px] border border-[#1D2125] w-[402px] h-[639px] rounded-2xl mr-[6px] p-0 flex flex-col overflow-hidden"
        align="end"
        sideOffset={12}
      >
        {/* FIXED: Added flex-1 */}
        <ScrollArea className="flex-1">
          {/* FIXED: Added the p-4 here so the scrollable area has the padding */}
          <div className="flex flex-col gap-4 p-4">
            {/* Profile Button */}
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-3">
                <div className="profile-gradient-ring w-14 h-14 flex flex-col items-center justify-center text-white font-medium">
                  <span className="text-xl">A</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-xl font-medium text-white">Asmit</span>
                  <span className="text-xs text-white/60">@asmitraj</span>
                </div>
              </div>

              {/* Settings Button */}
              <div className="flex items-center justify-center">
                <Settings
                  width={20}
                  height={20}
                  className="text-white/60 hover:text-white"
                />
              </div>
            </div>

            {/* Credits Row */}
            <section className="flex flex-row items-center justify-between bg-[#212529] rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-[#E4E6E8] text-sm font-semibold">
                  120/500 credits
                </span>
                <Info
                  width={16}
                  height={16}
                  className="text-white/60 hover:cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-center hover:cursor-pointer">
                <span className="text-white/60 text-sm font-medium">
                  Top Up
                </span>
                <ChevronRight
                  width={16}
                  height={16}
                  className="text-white/60"
                />
              </div>
            </section>
            <div className="border-t border-[#303438]"></div>

            {/* Credits Section */}
            <section className="flex flex-row rounded-lg p-4 bg-[#D89C3A]/[0.08] gap-1">
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <TriangleAlert
                    width={16}
                    height={16}
                    className="text-[#D89C3A]"
                  />
                  <span className="text-[#D89C3A] text-sm">
                    Insufficient credits
                  </span>
                </div>
                <div className="text-[#E4E6E8] text-sm">
                  Your credit balance : 0
                </div>
              </div>

              <div className="flex items-center">
                <Button>Top Up</Button>
              </div>
            </section>

            {/* Music generation Section - Only show valid prompts */}
            <section className="flex flex-col gap-4 relative rounded-lg">
              {musicItems
                .filter((item) => isValidPrompt(item.prompt))
                .slice()
                .reverse()
                .map((item) => (
                  <MusicList key={item.id} musicItem={item} />
                ))}
            </section>

            {/* Warning Section - Show when more than 2 items are processing */}
            {showServerBusyWarning && (
              <section className="flex flex-col gap-2 rounded-lg p-4 bg-[#EE0D37]/[0.08]">
                <div className="flex items-center gap-2">
                  <LucideTriangleAlert
                    width={16}
                    height={16}
                    className="text-[#EE0D37]"
                  />
                  <span className="text-white text-sm text-[#EE0D37]">
                    Oops! Server busy.
                  </span>
                </div>
                <div className="text-white/60 text-sm">
                  4.9K users in the queue.{" "}
                  <span className="underline cursor-pointer hover:text-white transition-colors">
                    Retry
                  </span>
                  .
                </div>
              </section>
            )}

            {/* Invalid Prompt Sections - Show from invalid prompts store */}
            {invalidPrompts.map((prompt, index) => (
              <section key={`invalid-${index}`} className="flex flex-row gap-2">
                <div className="w-[60px] h-[60px] min-w-[60px] flex-shrink-0 rounded-lg bg-[#D89C3A] flex items-center justify-center">
                  <Image
                    src="/assets/images/smiling-face.png"
                    alt="Invalid prompt icon"
                    width={36}
                    height={36}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-semibold">
                    Invalid Prompt
                  </span>
                  <span className="text-white/30 text-sm">
                    Your prompt does not seem to be valid. Please provide a
                    prompt related to song.
                  </span>
                </div>
              </section>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
