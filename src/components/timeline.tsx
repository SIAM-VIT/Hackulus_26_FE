"use client";

import Image from "next/image";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Lightbulb,
  Star,
  Utensils,
  UtensilsCrossed,
  Code,
  Trophy,
  Power,
  ChevronDown,
  X,
  Check,
} from "lucide-react";

const HACKATHON_PHASES = [
  "Participants Reach",
  "Ideation",
  "Track and Problem Statement submission",
  "Lunch",
  "Begin Hacking",
  "Review 1",
  "Dinner",
  "Begin Hacking",
  "Review 2",
  "Final Review",
];

const PHASE_ICONS: Record<string, React.ReactNode> = {
  "Participants Reach": <Users className="w-3.5 h-3.5" />,
  "Ideation": <Lightbulb className="w-3.5 h-3.5" />,
  "Track and Problem Statement submission": <Star className="w-3.5 h-3.5" />,
  "Review 0": <Star className="w-3.5 h-3.5" />,
  "Lunch": <Utensils className="w-3.5 h-3.5" />,
  "Begin Hacking": <Code className="w-3.5 h-3.5" />,
  "Review 1": <Star className="w-3.5 h-3.5" />,
  "Dinner": <UtensilsCrossed className="w-3.5 h-3.5" />,
  "Review 2": <Star className="w-3.5 h-3.5" />,
  "Final Review": <Trophy className="w-3.5 h-3.5" />,
};

interface TimelineProps {
  currentPhase: string;
  teamName?: string;
  onClose?: () => void;
  className?: string;
}

export default function Timeline({ currentPhase, teamName, onClose, className = "" }: TimelineProps) {
  const { logout, user } = useAuth();
  
  // Normalize string for matching just in case
  const normalizedCurrentPhase = (currentPhase || "").toLowerCase().trim();
  let matchedIndex = HACKATHON_PHASES.findIndex(
    (p) => p.toLowerCase() === normalizedCurrentPhase
  );
  if (matchedIndex === -1) {
    if (
      normalizedCurrentPhase.includes("review 0") ||
      normalizedCurrentPhase.includes("review0") ||
      normalizedCurrentPhase.includes("track and problem") ||
      normalizedCurrentPhase.includes("problem statement")
    ) {
      matchedIndex = HACKATHON_PHASES.findIndex(
        (p) =>
          p.toLowerCase().includes("track and problem") ||
          p.toLowerCase().includes("review 0")
      );
    }
  }
  const currentIndex = matchedIndex === -1 ? 2 : matchedIndex;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className={`w-[18rem] max-w-[85vw] sm:w-[18rem] bg-[#11152B] relative flex flex-col h-full max-h-[100dvh] overflow-hidden text-white border-r border-[#ffffff10] flex-shrink-0 select-none z-50 ${className}`}>
      
      {/* ── LOGO ─────────────────────────────────────────────── */}
      <div className="pt-4 sm:pt-6 pb-4 sm:pb-5 px-5 sm:px-6 flex items-center justify-between border-b border-[#ffffff10] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Image
            src="/final-logo.webp"
            alt="Hackulus Logo"
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
          />
          <span className="font-extrabold tracking-wider text-sm sm:text-base">HACKULUS</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Close timeline"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── TIMELINE HEADER ───────────────────────────────────── */}
      <div className="px-5 sm:px-6 py-3 sm:py-4 flex items-center gap-2 flex-shrink-0">
        <span className="text-[#F67C1B] font-black text-lg sm:text-xl italic">/</span>
        <h2 className="text-lg sm:text-xl font-bold tracking-wide">Timeline</h2>
        <div className="w-2 h-2 rounded-full bg-[#F67C1B] ml-auto"></div>
      </div>

      {/* ── CONNECTED TIMELINE LIST ───────────────────────────── */}
      <div className="flex-1 px-3 sm:px-4 py-2 overflow-y-auto space-y-1 touch-pan-y [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#ffffff20] [&::-webkit-scrollbar-thumb]:rounded-full">
        {HACKATHON_PHASES.map((phase, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFirst = index === 0;
          const isLast = index === HACKATHON_PHASES.length - 1;

          return (
            <div key={`${phase}-${index}`} className="flex items-stretch gap-2.5 relative group min-h-[38px]">
              
              {/* Left Indicator Column with Continuous Connector Line */}
              <div className="flex flex-col items-center flex-shrink-0 w-6 relative">
                {/* Top Connector Segment */}
                <div
                  className={`w-[2px] flex-1 transition-colors duration-300 ${
                    isFirst
                      ? "opacity-0"
                      : isPassed || isCurrent
                      ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                      : "bg-white/10"
                  }`}
                />

                {/* Node Icon Circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 z-10 ${
                    isCurrent
                      ? "bg-gradient-to-r from-[#FF512F] to-[#F09819] text-white shadow-lg shadow-[#F09819]/50 ring-2 ring-white/70 scale-105"
                      : isPassed
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/40"
                      : "bg-[#1C2340] text-white/30 border border-white/10"
                  }`}
                >
                  {isPassed ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    PHASE_ICONS[phase]
                  )}
                </div>

                {/* Bottom Connector Segment */}
                <div
                  className={`w-[2px] flex-1 transition-colors duration-300 ${
                    isLast
                      ? "opacity-0"
                      : isPassed
                      ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                      : isCurrent
                      ? "bg-gradient-to-b from-[#F09819] to-white/10"
                      : "bg-white/10"
                  }`}
                />
              </div>

              {/* Phase Content Pill */}
              <div
                className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-all duration-300 text-xs sm:text-[13.5px] self-center ${
                  isCurrent
                    ? "bg-gradient-to-r from-[#FF512F] to-[#F09819] text-white shadow-md shadow-[#F09819]/25 font-bold"
                    : isPassed
                    ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300/95 font-medium hover:bg-emerald-500/15"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5 font-normal"
                }`}
              >
                <span className="leading-tight break-words">{phase}</span>
                
                {isCurrent && (
                  <span className="text-[10px] font-bold text-white bg-black/30 border border-white/20 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0 animate-pulse">
                    Live
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ── PROFILE & LOGOUT BOTTOM AREA ──────────────────────── */}
      <div className="mt-auto px-5 sm:px-6 py-4 sm:py-5 border-t border-[#ffffff10] bg-[#11152B] flex-shrink-0">
        
        {/* Profile Card */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 cursor-pointer group">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black flex-shrink-0 flex items-center justify-center border border-white/20 shadow-sm">
              <span className="text-white text-xs sm:text-sm font-bold">
                {getInitials(user?.name || "User")}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs sm:text-[14px] leading-tight truncate">
                {user?.name || "John Doe"}
              </span>
              <span className="text-[#ffffff70] text-[11px] sm:text-[12px] leading-tight truncate">
                {teamName || "Team Neural Ninjas"}
              </span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2 sm:py-2.5 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 active:scale-[0.98] transition-all duration-200 text-[#FF512F] text-xs sm:text-[14px] font-semibold"
        >
          <Power className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Decorative Dots Pattern */}
      <div className="absolute bottom-3 left-3 grid grid-cols-3 gap-1.5 opacity-20 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-[#F67C1B]"></div>
        ))}
      </div>

    </div>
  );
}
