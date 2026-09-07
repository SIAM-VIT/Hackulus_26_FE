"use client";

import Image from "next/image";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Lightbulb,
  Star,
  Utensils,
  Mic,
  UtensilsCrossed,
  Code,
  Trophy,
  Power,
  ChevronDown,
} from "lucide-react";

const HACKATHON_PHASES = [
  "Participants Reach",
  "Ideation",
  "Review 1",
  "Lunch",
  "Speaker Sessions",
  "Review 2",
  "Dinner",
  "Begin Hacking",
  "Final Review",
];

const PHASE_ICONS: Record<string, React.ReactNode> = {
  "Participants Reach": <Users className="w-4 h-4" />,
  "Ideation": <Lightbulb className="w-4 h-4" />,
  "Review 1": <Star className="w-4 h-4" />,
  "Lunch": <Utensils className="w-4 h-4" />,
  "Speaker Sessions": <Mic className="w-4 h-4" />,
  "Review 2": <Star className="w-4 h-4" />,
  "Dinner": <UtensilsCrossed className="w-4 h-4" />,
  "Begin Hacking": <Code className="w-4 h-4" />,
  "Final Review": <Trophy className="w-4 h-4" />,
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
  const normalizedCurrentPhase = currentPhase.toLowerCase();
  const currentIndex = HACKATHON_PHASES.findIndex(
    (p) => p.toLowerCase() === normalizedCurrentPhase
  ) === -1 ? 2 : HACKATHON_PHASES.findIndex(
    (p) => p.toLowerCase() === normalizedCurrentPhase
  ); // default to Review 1 for demo if missing

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className={`w-[18rem] bg-[#11152B] relative flex flex-col h-full overflow-hidden text-white border-r border-[#ffffff10] flex-shrink-0 ${className}`}>
      
      {/* ── LOGO ─────────────────────────────────────────────── */}
      <div className="pt-6 pb-5 px-6 flex items-center justify-between border-b border-[#ffffff10]">
        <div className="flex items-center gap-3">
          <Image
            src="/final-logo.webp"
            alt="Hackulus Logo"
            width={48}
            height={48}
            className="w-10 h-10 object-contain"
          />
          <span className="font-extrabold tracking-wider text-base">HACKULUS</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── TIMELINE HEADER ───────────────────────────────────── */}
      <div className="px-6 py-4 flex items-center gap-2">
        <span className="text-[#F67C1B] font-black text-xl italic">/</span>
        <h2 className="text-xl font-bold tracking-wide">Timeline</h2>
        <div className="w-2 h-2 rounded-full bg-[#F67C1B] ml-auto"></div>
      </div>

      {/* ── TIMELINE LIST ─────────────────────────────────────── */}
      <div className="flex-1 px-4 overflow-y-auto space-y-1.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#ffffff20] [&::-webkit-scrollbar-thumb]:rounded-full">
        {HACKATHON_PHASES.map((phase, index) => {
          const isCurrent = index === currentIndex;

          return (
            <div
              key={phase}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-[15px] ${
                isCurrent
                  ? "bg-gradient-to-r from-[#FF512F] to-[#F09819] text-white shadow-lg shadow-[#F09819]/20"
                  : "text-[#ffffff80] hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex-shrink-0">
                {PHASE_ICONS[phase]}
              </div>
              <span>{phase}</span>
            </div>
          );
        })}
      </div>

      {/* ── PROFILE & LOGOUT BOTTOM AREA ──────────────────────── */}
      <div className="mt-auto px-6 py-6 pb-8 border-t border-[#ffffff10] bg-[#11152B]">
        
        {/* Profile Card */}
        <div className="flex items-center justify-between mb-6 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-sm">
              <span className="text-white text-sm font-bold">
                {getInitials(user?.name || "User")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[15px] leading-tight">
                {user?.name || "John Doe"}
              </span>
              <span className="text-[#ffffff70] text-[13px] leading-tight">
                {teamName || "Team Neural Ninjas"}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 text-[#FF512F] text-[15px] font-semibold"
        >
          <Power className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Decorative Dots Pattern (Bottom Left corner in Figma sidebar) */}
      <div className="absolute bottom-4 left-4 grid grid-cols-3 gap-1.5 opacity-20 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-[#F67C1B]"></div>
        ))}
      </div>

    </div>
  );
}
