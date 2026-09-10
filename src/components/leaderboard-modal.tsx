"use client";

import React, { useEffect, useState } from "react";
import { easeOut, motion } from "framer-motion";
import { Trophy, Award, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export interface LeaderboardEntry {
  team_id: number;
  team_name: string;
  status: string;
  track_name: string;
  reviews_count: number;
  review1_score?: number;
  review2_score?: number;
  total_score: number;
  scores_breakdown: {
    innovation: number;
    technical_complexity: number;
    feasibility: number;
    ui_ux: number;
    presentation: number;
    progress: number;
  };
}

interface LeaderboardModalProps {
  onClose: () => void;
  isAdmin?: boolean;
}

export default function LeaderboardModal({ onClose, isAdmin }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [roundFilter, setRoundFilter] = useState<string>("all");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const endpoint = isAdmin ? "/admin/leaderboard" : "/reviews/leaderboard";
        const params: Record<string, string> = {};
        if (roundFilter !== "all") {
          params.round_name = roundFilter;
        }
        const res = await api.get(endpoint, { params });
        setLeaderboard(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load leaderboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [isAdmin, roundFilter]);

  const filtered = leaderboard.filter(
    (item) =>
      item.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.track_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="w-full p-6 rounded-2xl shadow-2xl afacad"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ ease: easeOut, duration: 0.3 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative z-10 flex items-center justify-center min-h-[85vh] p-2">
        <div className="w-full max-w-4xl p-8 rounded-3xl shadow-2xl border-r-8 border-b-8 border-black bg-[#151932] border border-white/10 text-white max-h-[88vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF512F] to-[#F09819] flex items-center justify-center shadow-lg shadow-[#F09819]/20">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-wide text-white">
                  Hackathon Leaderboard
                </h2>
                <p className="text-white/60 text-sm">
                  Live scores & rankings evaluated by judges
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search team or track..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus-visible:ring-[#F67C1B]"
              />
            </div>
            <div className="flex gap-2">
              {["all", "review1", "review2"].map((round) => (
                <Button
                  key={round}
                  variant={roundFilter === round ? "default" : "outline"}
                  onClick={() => setRoundFilter(round)}
                  className={`h-11 px-4 rounded-xl capitalize font-semibold ${
                    roundFilter === round
                      ? "bg-gradient-to-r from-[#FF512F] to-[#F09819] text-white border-none shadow-md shadow-[#F09819]/20"
                      : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {round === "all" ? "All Rounds (R1 + R2)" : round === "review1" ? "Review 1" : "Review 2"}
                </Button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#F67C1B] [&::-webkit-scrollbar-thumb]:rounded-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#F67C1B] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-white/50 text-base">
                No teams found on the leaderboard yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-[#151932] z-10 text-white/60 uppercase tracking-wider text-xs border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Track</th>
                    <th className="py-3 px-4">Status</th>
                    {roundFilter === "all" && (
                      <>
                        <th className="py-3 px-3 text-center">Review 1</th>
                        <th className="py-3 px-3 text-center">Review 2</th>
                      </>
                    )}
                    <th className="py-3 px-4 text-right">
                      {roundFilter === "all" ? "Total (R1 + R2)" : "Score"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((entry, idx) => {
                    return (
                      <tr
                        key={entry.team_id}
                        className={`transition-colors ${
                          idx === 0
                            ? "bg-yellow-500/10 hover:bg-yellow-500/15"
                            : idx === 1
                            ? "bg-gray-400/10 hover:bg-gray-400/15"
                            : idx === 2
                            ? "bg-amber-700/10 hover:bg-amber-700/15"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <td className="py-3.5 px-3 font-bold">
                          {idx === 0 ? (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Award className="w-5 h-5 fill-yellow-400" /> 1
                            </span>
                          ) : idx === 1 ? (
                            <span className="flex items-center gap-1 text-gray-300">
                              <Award className="w-5 h-5 fill-gray-300" /> 2
                            </span>
                          ) : idx === 2 ? (
                            <span className="flex items-center gap-1 text-amber-500">
                              <Award className="w-5 h-5 fill-amber-500" /> 3
                            </span>
                          ) : (
                            <span className="text-white/50 pl-2">#{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {entry.team_name}
                        </td>
                        <td className="py-3.5 px-4 text-white/70 max-w-[180px] truncate">
                          {entry.track_name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              entry.status === "shortlisted"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : entry.status === "rejected"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : entry.status === "accepted"
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        {roundFilter === "all" && (
                          <>
                            <td className="py-3.5 px-3 text-center font-medium text-white/80">
                              {entry.review1_score ?? 0}
                            </td>
                            <td className="py-3.5 px-3 text-center font-medium text-white/80">
                              {entry.review2_score ?? 0}
                            </td>
                          </>
                        )}
                        <td className="py-3.5 px-4 text-right font-black text-lg text-[#F67C1B]">
                          {entry.total_score}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
  );
}
