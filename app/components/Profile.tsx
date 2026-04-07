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
import { useUserStore } from "@/stores/userStore";
import { useWarningStore } from "@/stores/warningStore";
import { useInvalidPromptStore } from "@/stores/invalidPromptStore";
import { motion, AnimatePresence } from "framer-motion";
import { updateProfileInBackend } from "@/lib/profileApi";
import { GPT_CONSTANTS } from "@/app/utils/gptConstants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isValidPrompt } from "@/lib/utils/promptValidator";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import AuthModal from "@/components/auth/AuthModal";
import TopUpModal from "@/components/auth/TopUpModal";

export default function Profile() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isSettingsView, setIsSettingsView] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { musicItems } = useSongStore();
  const { userProfile, updateUserProfile, uploadProfilePicture } = useUserStore();
  const { showServerBusyWarning } = useWarningStore();
  const { invalidPrompts } = useInvalidPromptStore();
  const { user, loading, signOut, updateUserDisplayName, refreshUserProfile } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();

  // Initialize display name when user profile changes
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
    }
  }, [userProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsView(true);
  };

  const handleBackToProfile = () => {
    setIsSettingsView(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewURL(url);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      let photoURL = userProfile?.photoURL || user?.photoURL;
      
      if (profilePicture) {
        // Use Express backend API for profile picture upload
        console.log('Uploading profile picture via Express API');
        photoURL = await uploadProfilePicture(user.uid, profilePicture);
      }
      
      // Use Express backend API via Zustand store
      await updateUserProfile(user.uid, displayName, photoURL || undefined);
      
      // Immediately update local state for instant UI feedback
      updateUserDisplayName(displayName);
      
      // Small delay to ensure backend update is processed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh the user profile from backend
      await refreshUserProfile();
      
      // Reset form
      setProfilePicture(null);
      setPreviewURL('');
      
      // Go back to profile view
      setIsSettingsView(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // If not logged in, show Sign In button
  if (!loading && !user) {
    return (
      <>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="text-sm font-semibold leading-tight text-white px-4 rounded-full border-1 border-white/20 hover:bg-alpha-light-10 transition-all active:scale-95 backdrop-blur-profileCircleGlow"
        >
          Sign in
        </button>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <Button
              size="sm"
              variant="default"
              className="profile-gradient-ring focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {userProfile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
            </Button>
            {/* Notification Badge */}
            {!creditsLoading && credits < 100 && (
              <div className="absolute top-0 right-0 w-4 h-4 bg-[#6BFFAC] rounded-full flex items-center justify-center text-black text-xs">
                2
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-black/20 backdrop-blur-xl border border-white/10 w-[402px] h-[639px] rounded-2xl mr-[6px] p-0 flex flex-col overflow-hidden"
          align="end"
          sideOffset={12}
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              className="flex flex-col h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              key={isSettingsView ? 'settings' : 'profile'}
            >
            {isSettingsView ? (
            // Settings View
            <div className="flex flex-col h-full">
              {/* Settings Header */}
              <div className="p-4 border-b border-white/10" style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.03)'
              }}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToProfile}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <ChevronRight width={20} height={20} className="rotate-180" />
                  </button>
                  <h2 className="text-white text-lg font-medium">Settings</h2>
                </div>
              </div>

              {/* Settings Content */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Profile Picture Section */}
                  <div className="space-y-3">
                    <label className="text-white/60 text-sm font-medium">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden" style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}>
                          {previewURL ? (
                            <img src={previewURL} alt="Preview" className="w-full h-full object-cover" />
                          ) : user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xl">
                              {userProfile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                            </span>
                          )}
                        </div>
                        <label
                          htmlFor="profile-picture"
                          className="absolute bottom-0 right-0 w-6 h-6 bg-[#6BFFAC] rounded-full flex items-center justify-center cursor-pointer"
                        >
                          <span className="text-black text-xs">+</span>
                        </label>
                        <input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-white/60 text-sm">
                          Upload a new profile picture
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Display Name Section */}
                  <div className="space-y-3">
                    <label htmlFor="display-name" className="text-white/60 text-sm font-medium">
                      Display Name
                    </label>
                    <input
                      id="display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/25 transition-colors"
                      placeholder="Enter your name"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>

                  {/* Update Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="w-full bg-[#6BFFAC] text-black hover:bg-[#5FE69C] transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            // Original Profile View
            <>
              {/* FIXED: Added flex-1 */}
              <ScrollArea className="flex-1">
                {/* FIXED: Added the p-4 here so the scrollable area has the padding */}
                <div className="flex flex-col gap-4 p-4">
                  {/* Profile Button */}
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-3">
                      <div className="profile-gradient-ring w-14 h-14 flex flex-col items-center justify-center text-white font-medium">
                        <span className="text-xl">
                          {userProfile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-xl font-medium text-white">
                          {userProfile?.displayName || ''}
                        </span>
                        <span className="text-xs text-white/60">
                          @{user?.email?.split('@')[0] || 'user'}
                        </span>
                      </div>
                    </div>

                    {/* Settings Button */}
                    <div className="flex items-center justify-center">
                      <Settings
                        width={20}
                        height={20}
                        className="text-white/60 hover:text-white cursor-pointer"
                        onClick={handleSettingsClick}
                      />
                    </div>
                  </div>

                  {/* Credits Row */}
                  <section className="flex flex-row items-center justify-between bg-[#212529] rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#E4E6E8] text-sm font-semibold">
                        {creditsLoading ? 'Loading...' : `${credits} credits`}
                      </span>
                      <Info
                        width={16}
                        height={16}
                        className="text-white/60 hover:cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-center hover:cursor-pointer">
                      <span 
                        className="text-white/60 text-sm font-medium"
                        onClick={() => setIsTopUpModalOpen(true)}
                      >
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
                  {(credits < 50) && (
                    <section className="flex flex-row rounded-lg p-4 bg-[#D89C3A]/[0.08] gap-1">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <TriangleAlert
                            width={16}
                            height={16}
                            className="text-[#D89C3A]"
                          />
                          <span className="text-[#D89C3A] text-sm">
                            {GPT_CONSTANTS.ERROR_CONSTANTS.INSUFFICIENT_CREDITS}
                          </span>
                        </div>
                        <div className="text-[#E4E6E8] text-sm">
                          You need 50 credits to generate songs. Current: {credits}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Button onClick={() => setIsTopUpModalOpen(true)}>
                          {GPT_CONSTANTS.PROFILE.TOP_UP}
                        </Button>
                      </div>
                    </section>
                  )}

                  {/* Sign Out Button */}
                  <section className="flex flex-row rounded-lg p-4 bg-[#212529]">
                    <Button 
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Sign Out
                    </Button>
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
            </>
          )}
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => setIsAuthModalOpen(false)} 
    />
    <TopUpModal 
      isOpen={isTopUpModalOpen} 
      onClose={() => setIsTopUpModalOpen(false)} 
    />
  </>
  );
}
