"use client";

import withAuth from "@/components/auth/withAuth";
import ProjectModifyForm from "@/components/project-forms/project-modify-form";
import ProjectSubmissionForm from "@/components/project-forms/project-submission-form";
import Review0Modal from "@/components/project-forms/review0-modal";
import Timeline from "@/components/timeline";
import TrackModal from "@/components/track-modal";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { trackinfo, tracks as defaultTracks } from "@/lib/data";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Star,
  Edit2,
  User,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  Lock,
  Menu,
} from "lucide-react";

interface Member {
  user_id: number;
  name: string;
  email: string;
  is_leader: boolean;
}

interface Team {
  team_id: number;
  team_name: string;
  track_id?: number;
  track_name?: string;
  problem_statement_id?: number;
  problem_statement?: {
    id: number;
    title: string;
    description: string;
  } | null;
  status: string;
  is_eliminated?: boolean;
}

interface Submission {
  submission_id: number;
  type: string;
  title?: string;
  description?: string;
  links?: Record<string, string>;
  status?: string;
}

interface DashboardData {
  user: {
    user_id: number;
    name: string;
    email: string;
    role: string;
    is_leader: boolean;
  };
  team: Team | null;
  members: Member[];
  windows: {
    review0?: boolean;
    review1?: boolean;
    review2?: boolean;
  };
  currentPhase: string;
}

// Map track names to their specific accent colors
const trackColors: Record<string, string> = {
  "IOT": "#7C3AED", // Purple
  "Creative Tech": "#EA580C", // Orange
  "FinTech": "#16A34A", // Green
  "Cybersecurity": "#2563EB", // Blue
  "VIT Centric": "#F97316", // Amber/Orange
  "Environments Sustainability": "#059669", // Emerald
  // Fallback aliases
  "AI and Mathematical Modelling": "#7C3AED",
  "Cyber Security": "#2563EB",
  "VIT-Centric": "#F97316",
  "Sustainability": "#059669",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<{
    name: string;
    description: string;
    problem_statements: { title: string; info: string }[];
  } | null>(null);
  const [isReview0ModalOpen, setIsReview0ModalOpen] = useState(false);
  const [isProjectSubmitModalOpen, setIsProjectSubmitModalOpen] = useState(false);
  const [isProjectModifyModalOpen, setIsProjectModifyModalOpen] = useState(false);
  const [isMobileTimelineOpen, setIsMobileTimelineOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tracks, setTracks] = useState<typeof defaultTracks>(defaultTracks);

  const fetchDashboardData = async () => {
    try {
      const [homeRes, submissionsRes, tracksRes] = await Promise.all([
        api.get("/users/home"),
        api.get("/users/submissions").catch(() => api.get("/submissions/")),
        api.get("/teams/tracks").catch(() => ({ data: defaultTracks })),
      ]);
      setDashboardData(homeRes.data);
      setSubmissions(submissionsRes.data.submissions || []);
      if (Array.isArray(tracksRes.data) && tracksRes.data.length > 0) {
        setTracks(tracksRes.data);
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any)?.response?.data?.message || "Failed to load dashboard.";
      toast.error(errorMessage);
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const existingReview1Submission = useMemo(
    () => submissions.find((s) => s.type === "review1"),
    [submissions]
  );

  const existingReview2Submission = useMemo(
    () => submissions.find((s) => s.type === "review2" || s.type === "final"),
    [submissions]
  );

  const submissionForCurrentPhase = useMemo(() => {
    if (dashboardData?.windows?.review2) return existingReview2Submission || null;
    if (dashboardData?.windows?.review1) return existingReview1Submission || null;
    return null;
  }, [dashboardData?.windows, existingReview1Submission, existingReview2Submission]);

  const getCurrentReviewStage = () => {
    if (dashboardData?.windows?.review2) return "Final Review (Review 2)";
    if (dashboardData?.windows?.review1) return "Review 1";
    if (dashboardData?.windows?.review0) return "Review 0";
    return dashboardData?.currentPhase || "";
  };

  const isEliminated = useMemo(() => {
    return dashboardData?.team?.status?.toLowerCase() === "rejected" || !!dashboardData?.team?.is_eliminated;
  }, [dashboardData?.team]);

  const handleTrackClick = (trackName: string) => {
    // 1. Check live track data from API
    const liveTrack = (tracks as unknown as Array<{
      name: string;
      description?: string;
      problem_statements?: Array<{ id?: number; title: string; description?: string; info?: string }>;
    }>).find((t) => t.name?.toLowerCase() === trackName.toLowerCase());

    if (liveTrack && liveTrack.problem_statements && liveTrack.problem_statements.length > 0) {
      setSelectedTrack({
        name: liveTrack.name,
        description: liveTrack.description || "",
        problem_statements: liveTrack.problem_statements.map((p) => ({
          title: p.title,
          info: p.description || p.info || "",
        })),
      });
      setIsModalOpen(true);
      return;
    }

    // 2. Fallback to trackinfo in data.ts
    const trackData = trackinfo.find(
      (t) =>
        t.name.toLowerCase() === trackName.toLowerCase() ||
        t.name.replace(/[-\s]/g, "").toLowerCase() === trackName.replace(/[-\s]/g, "").toLowerCase()
    );
    if (trackData) {
      setSelectedTrack(trackData);
      setIsModalOpen(true);
    }
  };

  const sortedMembers = useMemo(() => {
    if (!dashboardData?.members) return [];
    return [...dashboardData.members].sort((a, b) => {
      if (a.is_leader) return -1;
      if (b.is_leader) return 1;
      return 0;
    });
  }, [dashboardData?.members]);

  const getButtonState = () => {
    if (isEliminated) {
      return { text: "Team Eliminated", action: "eliminated" };
    }

    const { windows } = dashboardData || {};
    if (windows?.review0) {
      const hasPs = !!dashboardData?.team?.problem_statement_id;
      return {
        text: hasPs ? "Review 0: Change PS" : "Review 0: Select PS",
        action: "review0",
      };
    }
    if (windows?.review1) {
      return {
        text: existingReview1Submission ? "Modify Review 1" : "Submit Review 1",
        action: "review1",
      };
    }
    if (windows?.review2) {
      return {
        text: existingReview2Submission ? "Modify Final Project" : "Submit Final Project",
        action: "review2",
      };
    }
    return { text: "Submissions Closed", action: "closed" };
  };

  const handleButtonClick = () => {
    if (!user?.is_leader) {
      toast.error("Only the team leader can perform this action.");
      return;
    }
    const { action } = getButtonState();
    switch (action) {
      case "review0": {
        setIsReview0ModalOpen(true);
        break;
      }
      case "review1": {
        if (existingReview1Submission) {
          setIsProjectModifyModalOpen(true);
        } else {
          setIsProjectSubmitModalOpen(true);
        }
        break;
      }
      case "review2": {
        if (existingReview2Submission) {
          setIsProjectModifyModalOpen(true);
        } else {
          setIsProjectSubmitModalOpen(true);
        }
        break;
      }
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7FA] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#F67C1B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const buttonState = getButtonState();
  const currentPhase = dashboardData?.currentPhase || "Participants reach";

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F6F7FA] text-[#11152B] font-sans">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <Timeline currentPhase={currentPhase} teamName={dashboardData?.team?.team_name} className="hidden lg:flex" />

      {/* ── MOBILE SIDEBAR DRAWER ───────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileTimelineOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-[#11152B]/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileTimelineOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 lg:hidden shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
            >
              <Timeline
                currentPhase={currentPhase}
                teamName={dashboardData?.team?.team_name}
                onClose={() => setIsMobileTimelineOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden flex flex-col h-screen">

        {/* Background Decorative Elements */}
        <div className="absolute top-8 right-8 grid grid-cols-4 gap-2 opacity-50 pointer-events-none z-0">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? "bg-[#F67C1B]" : "bg-gray-300"}`}
            ></div>
          ))}
        </div>

        <div className="absolute -bottom-32 -left-10 w-full h-[300px] pointer-events-none z-0 opacity-80 flex">
          {/* Abstract wavy bottom shapes */}
          <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-[#11152B] to-[#1C254C] absolute -bottom-[600px] -left-[200px]"></div>
          <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#FF512F] to-[#F09819] absolute -bottom-[450px] left-[150px] opacity-90"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-20">

          {/* ── HEADER ───────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileTimelineOpen(true)}
                className="lg:hidden p-2.5 rounded-xl bg-white border border-gray-200 text-[#11152B] shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                aria-label="Open timeline menu"
              >
                <Menu className="w-5 h-5 text-[#F67C1B]" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                  Hi, {user?.name || "User"}
                </h1>
                <p className="text-gray-500 font-medium text-xs sm:text-sm">
                  We&apos;re in the {currentPhase} phase • Let&apos;s build something awesome!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {dashboardData?.currentPhase && (
                <div className="flex items-center gap-2.5 sm:gap-3.5 bg-white px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full border-2 border-[#F67C1B]/50 shadow-[0_4px_20px_rgba(246,124,27,0.15)] text-[#11152B] text-sm sm:text-base md:text-lg font-black tracking-wide">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#F67C1B] fill-current flex-shrink-0" />
                  <span>{dashboardData.currentPhase} Phase</span>
                </div>
              )}
            </div>
          </div>

          {/* ── ELIMINATED BANNER ───────────────────────────────────────── */}
          {isEliminated && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-700 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <strong className="font-bold text-red-800">Team Eliminated:</strong> Your team was eliminated during Review 1 evaluations. Further project submissions are locked.
              </div>
            </div>
          )}

          {/* ── TOP BENTO CARDS ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">

            {/* 1. Team Card */}
            <div className="bg-[#151932] rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden border border-white/5">
              {/* Decorative dots top-left */}
              <div className="absolute top-6 left-6 grid grid-cols-2 gap-1.5 opacity-30">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? "bg-[#F67C1B]" : "bg-white"}`}></div>
                ))}
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between mb-6 pl-8 sm:pl-12">
                <div className="flex items-center gap-2">
                  <span className="text-[#F67C1B] font-black text-xl italic">/</span>
                  <h3 className="text-white text-lg sm:text-xl font-bold tracking-wide truncate">
                    {dashboardData?.team?.team_name || "Your Team"}
                  </h3>
                </div>
                {dashboardData?.windows?.review0 && user?.is_leader && (
                  <button
                    onClick={() => setIsReview0ModalOpen(true)}
                    className="text-white/60 hover:text-[#F67C1B] transition-colors flex items-center gap-1.5 text-xs bg-white/5 px-2.5 py-1 rounded-full border border-white/10"
                    title="Change Track & Problem Statement"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change PS</span>
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-col sm:flex-row gap-6 h-full">
                {/* Left side: Track & Problem Statement Details */}
                <div className="w-full sm:w-[45%] flex flex-col justify-between bg-[#1C213F] rounded-2xl p-4 sm:p-5 border border-white/5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#F67C1B]/15 border border-[#F67C1B]/40 text-[#F67C1B] rounded-lg text-xs font-bold uppercase tracking-wider">
                        {dashboardData?.team?.track_name || "No Track Selected"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider block">
                        Chosen Problem Statement
                      </span>
                      <p className="text-white font-semibold text-sm leading-snug">
                        {dashboardData?.team?.problem_statement?.title || "No Problem Statement Selected"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                    <span>{sortedMembers.length} {sortedMembers.length === 1 ? "Member" : "Members"}</span>
                    <span className="text-[#F67C1B] font-semibold">Active Squad</span>
                  </div>
                </div>

                {/* Right side: Member list */}
                <div className="w-full sm:w-[55%] space-y-2">
                  {sortedMembers.length > 0 ? (
                    sortedMembers.map((member) => {
                      const isCurrentUser = member.user_id === user?.user_id;
                      return (
                        <div
                          key={member.user_id}
                          className="bg-[#1C213F] rounded-xl p-3 px-4 flex items-center justify-between border border-white/5"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="text-white/50 bg-white/5 p-1.5 rounded-full flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="text-white text-sm font-semibold truncate">
                              {member.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {member.is_leader && (
                              <span className="text-[#F67C1B] text-[10px] font-bold">Leader</span>
                            )}
                            {isCurrentUser && (
                              <div className="bg-[#F67C1B] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm shadow-[#F67C1B]/50">
                                You
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-white/50 text-sm italic">No team members yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. CTA Card */}
            <div className="bg-[#151932] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/5 flex flex-col justify-center">
              {/* Glowing background effects */}
              <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-32 h-32 bg-[#F67C1B]/20 rounded-full blur-[60px]"></div>

              <div className="flex flex-col sm:flex-row h-full items-center gap-6 relative z-10">
                {/* Left Graphic */}
                <div className="w-full sm:w-1/2 flex items-center justify-center relative">
                  <div className="relative">
                    <Image
                      src="/vector12.svg"
                      alt="Submission graphic"
                      width={180}
                      height={180}
                      className="opacity-90 object-contain drop-shadow-2xl"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_15px_rgba(246,124,27,0.8)]">
                      <Lightbulb className="w-16 h-16 sm:w-20 sm:h-20 text-[#F67C1B] fill-[#F67C1B]/20" strokeWidth={1} />
                    </div>
                  </div>
                </div>

                {/* Right Content */}
                <div className="w-full sm:w-1/2 sm:pl-4 flex flex-col justify-center text-center sm:text-left">
                  <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.1] mb-4">
                    Turn your ideas<br />into reality
                  </h2>

                  {/* Status badges */}
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mb-4">
                    {dashboardData?.team?.problem_statement_id && (
                      <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full font-bold text-xs">
                        <Lock className="w-3 h-3" />
                        Track & PS Locked
                      </div>
                    )}
                    {existingReview1Submission && (
                      <div className="flex items-center gap-1.5 bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40 px-3 py-1 rounded-full font-bold text-xs shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                        <CheckCircle2 className="w-3 h-3 fill-current text-[#151932]" />
                        Review 1 Done
                      </div>
                    )}
                    {existingReview2Submission && (
                      <div className="flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full font-bold text-xs">
                        <CheckCircle2 className="w-3 h-3 fill-current text-[#151932]" />
                        Final Done
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center sm:justify-start">
                    <Button
                      onClick={handleButtonClick}
                      disabled={buttonState.action === "closed" || buttonState.action === "eliminated"}
                      className="group relative flex items-center justify-between w-full sm:w-[240px] bg-gradient-to-r from-[#FF512F] to-[#F09819] hover:from-[#F09819] hover:to-[#FF512F] text-white font-bold text-sm sm:text-base px-6 py-5 sm:py-6 rounded-full shadow-[0_8px_20px_rgba(246,124,27,0.3)] hover:shadow-[0_12px_25px_rgba(246,124,27,0.4)] transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      <span className="truncate pr-2">{buttonState.text}</span>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        <ArrowRight className="w-4 h-4 text-[#F67C1B] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Button>
                  </div>
                  {(buttonState.action === "closed" || buttonState.action === "eliminated") && (
                    <span className="text-white/40 text-xs mt-2 block">
                      {buttonState.action === "eliminated"
                        ? "Eliminated teams cannot submit."
                        : "Submissions are currently closed."}
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ── TRACKS GRID ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[#F67C1B] font-black text-2xl italic">/</span>
              <h2 className="text-2xl font-bold tracking-wide text-[#11152B] uppercase">Tracks</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
              {tracks.map((track) => {
                const detail = trackinfo.find(
                  (t) =>
                    t.name.toLowerCase() === track.name.toLowerCase() ||
                    t.name.replace(/[-\s]/g, "").toLowerCase() === track.name.replace(/[-\s]/g, "").toLowerCase()
                );
                const dt = defaultTracks.find(
                  (t) =>
                    t.name.toLowerCase() === track.name.toLowerCase() ||
                    t.name.replace(/[-\s]/g, "").toLowerCase() === track.name.replace(/[-\s]/g, "").toLowerCase()
                );
                const logo = (track as unknown as { logo?: string }).logo || dt?.logo || "/ai.webp";
                const psCount =
                  (track as unknown as { problem_statement_count?: number })?.problem_statement_count ??
                  (track as unknown as { problem_statements?: unknown[] })?.problem_statements?.length ??
                  detail?.problem_statements.length ??
                  0;
                const accentColor = trackColors[track.name] || "#11152B";

                return (
                  <div
                    key={track.name}
                    onClick={() => handleTrackClick(track.name)}
                    className="bg-gradient-to-b from-[#FFE5CF] via-[#FFF1E4] to-[#FFF9F3] rounded-2xl p-4 pt-6 pb-5 flex flex-col items-center justify-between cursor-pointer border-2 border-[#F67C1B]/30 hover:border-[#F67C1B]/70 shadow-[0_8px_30px_rgba(246,124,27,0.12)] hover:shadow-[0_14px_40px_rgba(246,124,27,0.24)] transition-all duration-300 hover:-translate-y-1 relative group min-h-[190px]"
                  >
                    {/* PS Count Badge */}
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold bg-gradient-to-r from-[#FF512F] to-[#F09819] shadow-md shadow-[#F09819]/35 border border-white/60 z-10">
                      {psCount}
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full relative my-2 min-h-[75px]">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full blur-xl scale-75 bg-black" />
                      <div
                        className="w-[75px] h-[75px] bg-black group-hover:scale-110 transition-transform duration-300 relative z-10 drop-shadow-sm"
                        style={{
                          maskImage: `url(${logo})`,
                          WebkitMaskImage: `url(${logo})`,
                          maskSize: "contain",
                          WebkitMaskSize: "contain",
                          maskPosition: "center",
                          WebkitMaskPosition: "center",
                          maskRepeat: "no-repeat",
                          WebkitMaskRepeat: "no-repeat",
                        }}
                      />
                    </div>

                    <p className="text-center font-bold text-xs sm:text-sm leading-tight text-[#11152B] mt-2 max-w-[120px] line-clamp-2">
                      {track.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-[#11152B]/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ ease: easeOut, duration: 0.3 }}
            />
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedTrack(null);
              }}
            >
              {selectedTrack && (
                <TrackModal
                  trackData={selectedTrack}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTrack(null);
                  }}
                />
              )}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── REVIEW 0 MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isReview0ModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-[#11152B]/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ ease: easeOut, duration: 0.3 }}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Review0Modal
                onClose={() => setIsReview0ModalOpen(false)}
                onSuccess={fetchDashboardData}
                currentTrackId={dashboardData?.team?.track_id}
                currentProblemStatementId={dashboardData?.team?.problem_statement_id}
              />
            </div>
          </>
        )}
      </AnimatePresence>



      {/* ── PROJECT SUBMISSION MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {isProjectSubmitModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-[#11152B]/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ ease: easeOut, duration: 0.3 }}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <ProjectSubmissionForm
                reviewStage={getCurrentReviewStage()}
                onClose={() => setIsProjectSubmitModalOpen(false)}
                onSuccess={fetchDashboardData}
                submissionType={dashboardData?.windows?.review2 ? "review2" : "review1"}
              />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── PROJECT MODIFY MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {isProjectModifyModalOpen && submissionForCurrentPhase && (
          <>
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-[#11152B]/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ ease: easeOut, duration: 0.3 }}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <ProjectModifyForm
                reviewStage={getCurrentReviewStage()}
                submission={submissionForCurrentPhase}
                onClose={() => setIsProjectModifyModalOpen(false)}
                onSuccess={fetchDashboardData}
                submissionType={
                  (submissionForCurrentPhase.type === "review2" || submissionForCurrentPhase.type === "final"
                    ? "review2"
                    : "review1") as "review1" | "review2" | "final"
                }
              />
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default withAuth(Dashboard);
