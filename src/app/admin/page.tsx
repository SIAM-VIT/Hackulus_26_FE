"use client";

import LeaderboardModal from "@/components/leaderboard-modal";
import withAdminAuth from "@/components/auth/withAdminAuth";
import Timeline from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Search, Edit2, AlertCircle, Plus, Trash2, UserPlus, Menu, Trophy } from "lucide-react";

export interface Member {
  member_id: number;
  name: string;
  email: string;
  is_leader: boolean;
}

export interface ProblemStatementObj {
  id?: number;
  title?: string;
  description?: string;
}

export interface Team {
  team_id: number;
  team_name: string;
  track_id?: number;
  track_name: string;
  status: string;
  members: Member[];
  problem_statement_id?: number;
  problem_statement_title?: string;
  problem_statement?: string | ProblemStatementObj;
  idea?: string;
}

interface Submission {
  submission_id: number;
  type: string;
  title?: string;
  description?: string;
  links?: Record<string, string>;
}

interface TeamDetails extends Team {
  submissions: Submission[];
}

interface Review {
  judge_id: number;
  innovation_score: number;
  technical_complexity_score: number;
  feasibility_score: number;
  ui_ux_score: number;
  presentation_score: number;
  progress_score: number;
  comments: string;
}

const hackathonPhases = [
  "Participants Reach",
  "Ideation",
  "Review 0",
  "Lunch",
  "Begin Hacking",
  "Review 1",
  "Dinner",
  "Review 2",
  "Final Review",
];

// Configured Hackathon Scoring Criteria (Total: 100%)
const scoringCategories = [
  { key: "innovation_score", label: "Concept & Originality", max: 20, weight: "20%" },
  { key: "technical_complexity_score", label: "Technical Implementation & Complexity", max: 25, weight: "25%" },
  { key: "progress_score", label: "Completion & Functionality", max: 20, weight: "20%" },
  { key: "feasibility_score", label: "Real-World Impact & Viability", max: 15, weight: "15%" },
  { key: "ui_ux_score", label: "Design & User Experience (UX)", max: 10, weight: "10%" },
  { key: "presentation_score", label: "Team Contribution & Collaboration", max: 10, weight: "10%" },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedTeamDetails, setSelectedTeamDetails] =
    useState<TeamDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [timelinePhase, setTimelinePhase] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");
  const [teamToEliminate, setTeamToEliminate] = useState<number | null>(null);
  const [isEliminationModalOpen, setIsEliminationModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [isMobileTimelineOpen, setIsMobileTimelineOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [previousReview, setPreviousReview] = useState<Review | null>(null);

  // ── Register Team modal state ──────────────────────────────────────────
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerTeamName, setRegisterTeamName] = useState("");
  const [registerMembers, setRegisterMembers] = useState([
    { name: "", email: "", registration_number: "", is_leader: true },
  ]);

  const addMemberRow = () =>
    setRegisterMembers((prev) => [
      ...prev,
      { name: "", email: "", registration_number: "", is_leader: false },
    ]);

  const removeMemberRow = (idx: number) =>
    setRegisterMembers((prev) => prev.filter((_, i) => i !== idx));

  const updateMember = (
    idx: number,
    field: "name" | "email" | "registration_number" | "is_leader",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) =>
    setRegisterMembers((prev) =>
      prev.map((m, i) => {
        if (i !== idx) return m;
        if (field === "is_leader") {
          // only one leader at a time
          return { ...m, is_leader: true };
        }
        return { ...m, [field]: value };
      }).map((m, i) => field === "is_leader" && i !== idx ? { ...m, is_leader: false } : m)
    );

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerTeamName.trim()) { toast.error("Team name is required."); return; }
    const leaders = registerMembers.filter((m) => m.is_leader);
    if (leaders.length !== 1) { toast.error("Exactly one member must be the leader."); return; }
    if (registerMembers.some((m) => !m.name.trim() || !m.email.trim() || !m.registration_number.trim())) {
      toast.error("All members must have a name, student email, and registration number."); return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (registerMembers.some((m) => !emailRegex.test(m.email.trim()))) {
      toast.error("Please enter a valid email address for all members."); return;
    }

    setIsRegistering(true);
    try {
      await api.post("/admin/team/register", {
        team_name: registerTeamName.trim(),
        members: registerMembers.map((m) => ({
          name: m.name.trim(),
          email: m.email.trim().toLowerCase(),
          registration_number: m.registration_number.trim().toUpperCase(),
          is_leader: m.is_leader,
        })),
      });
      toast.success(`Team "${registerTeamName}" registered successfully!`);
      setIsRegisterModalOpen(false);
      setRegisterTeamName("");
      setRegisterMembers([{ name: "", email: "", registration_number: "", is_leader: true }]);
      fetchTeams();
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to register team.");
    } finally {
      setIsRegistering(false);
    }
  };

  const activeTeams = useMemo(
    () => teams.filter((team) => team.status.toLowerCase() !== "rejected"),
    [teams]
  );


  const currentTotalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  }, [scores]);

  const latestSubmission = useMemo(() => {
    if (!selectedTeamDetails || !selectedTeamDetails.submissions?.length) return null;
    return (
      selectedTeamDetails.submissions.find((s) => s.type === "final") ||
      selectedTeamDetails.submissions.find((s) => s.type === "review2") ||
      selectedTeamDetails.submissions.find((s) => s.type === "review1") ||
      selectedTeamDetails.submissions[0] || // fallback: any submission
      null
    );
  }, [selectedTeamDetails]);

  const problemStatementTitle = useMemo(() => {
    if (selectedTeamDetails?.problem_statement) {
      if (typeof selectedTeamDetails.problem_statement === "object") {
        return selectedTeamDetails.problem_statement.title || null;
      }
      if (typeof selectedTeamDetails.problem_statement === "string") {
        return selectedTeamDetails.problem_statement;
      }
    }
    if ((selectedTeamDetails as unknown as { problem_statement_title?: string })?.problem_statement_title) {
      return (selectedTeamDetails as unknown as { problem_statement_title?: string }).problem_statement_title || null;
    }
    if (selectedTeam?.problem_statement_title) {
      return selectedTeam.problem_statement_title;
    }
    if (selectedTeam?.problem_statement) {
      if (typeof selectedTeam.problem_statement === "object") {
        return (selectedTeam.problem_statement as { title?: string }).title || null;
      }
      return selectedTeam.problem_statement;
    }
    return null;
  }, [selectedTeamDetails, selectedTeam]);

  const problemStatementDescription = useMemo(() => {
    if (selectedTeamDetails?.problem_statement && typeof selectedTeamDetails.problem_statement === "object") {
      return selectedTeamDetails.problem_statement.description || null;
    }
    return null;
  }, [selectedTeamDetails]);


  const filteredTeams = useMemo(
    () =>
      teams.filter((team) =>
        team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [teams, searchTerm]
  );

  const fetchTeams = async () => {
    try {
      const response = await api.get("/admin/teams");
      setTeams(response.data.teams);
    } catch (error) {
      toast.error("Failed to refresh teams list.");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch teams and timeline independently — one failing won't block the other
      const [teamsResult, timelineResult] = await Promise.allSettled([
        api.get("/admin/teams"),
        api.get("/admin/timeline/phase"),
      ]);

      if (teamsResult.status === "fulfilled") {
        setTeams(teamsResult.value.data.teams || []);
      } else {
        toast.error("Failed to load teams.");
        console.error("Teams fetch error:", teamsResult.reason);
      }

      if (timelineResult.status === "fulfilled") {
        setTimelinePhase(timelineResult.value.data.currentPhase || "");
      } else {
        // Non-critical for judges — silently ignore
        console.warn("Timeline fetch failed:", timelineResult.reason);
      }

      setIsLoading(false);
    };
    fetchInitialData();
  }, []);


  useEffect(() => {
    if (selectedTeam) {
      setIsDetailsLoading(true);
      setSelectedTeamDetails(null);
      setPreviousReview(null);
      setScores({});
      setComments("");
      api
        .get(`/admin/team/${selectedTeam.team_id}`)
        .then((response) => {
          const { team, members, submissions } = response.data;
          const details = { ...team, members: members || team.members, submissions: submissions || team.submissions };
          setSelectedTeamDetails(details);
          const latestSub =
            details.submissions.find(
              (s: { type: string }) => s.type === "final"
            ) ||
            details.submissions.find(
              (s: { type: string }) => s.type === "review2"
            ) ||
            details.submissions.find(
              (s: { type: string }) => s.type === "review1"
            );
          if (latestSub) {
            api
              .get(`/admin/submission/${latestSub.submission_id}`)
              .then((res) => {
                const currentUserReview = (res.data.reviews || []).find(
                  (review: Review) => review.judge_id === user?.user_id
                );
                if (currentUserReview) {
                  setPreviousReview(currentUserReview);
                  setComments(currentUserReview.comments || "");
                  // Pre-fill scores from previous review
                  const prevScores: Record<string, number> = {};
                  for (const cat of scoringCategories) {
                    const val = currentUserReview[cat.key as keyof Review];
                    if (typeof val === "number") prevScores[cat.key] = val;
                  }
                  setScores(prevScores);
                }
              });
          }
        })
        .catch((error) => {
          toast.error("Failed to fetch team details.");
          console.error(error);
        })
        .finally(() => {
          setIsDetailsLoading(false);
        });
    }
  }, [selectedTeam, user]);

  const handleTimelineUpdate = async () => {
    try {
      await api.post("/admin/timeline/phase", { phase: timelinePhase });
      toast.success(`Timeline has been updated to: ${timelinePhase}`);
    } catch (error) {
      toast.error("Failed to update timeline. You must be a Super Admin.");
      console.error(error);
    }
  };

  const handleEliminateConfirm = async () => {
    if (!teamToEliminate) {
      toast.error("No team selected for elimination.");
      return;
    }

    try {
      await api.post(`/admin/team/${teamToEliminate}/status`, {
        status: "rejected",
      });
      const teamName =
        teams.find((t) => t.team_id === teamToEliminate)?.team_name ||
        "The team";
      toast.success(`${teamName} has been eliminated.`);

      fetchTeams();
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          "Failed to eliminate team. You may not have permission."
      );
    } finally {
      setIsEliminationModalOpen(false);
      setTeamToEliminate(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTeamLeader = (team: Team) => {
    return team.members.find((member) => member.is_leader)?.name || "N/A";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7FA] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#F67C1B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleScoreChange = (categoryKey: string, value: string) => {
    const category = scoringCategories.find((c) => c.key === categoryKey);
    const maxVal = category ? category.max : 100;
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= maxVal) {
      setScores((prev) => ({ ...prev, [categoryKey]: numericValue }));
    } else if (value === "") {
      setScores((prev) => {
        const newScores = { ...prev };
        delete newScores[categoryKey];
        return newScores;
      });
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use the latestSubmission computed value (finds review1 / review2 / final)
    const latestSub = latestSubmission;

    if (!selectedTeam) {
      toast.error("Please select a team to judge.");
      return;
    }

    if (!latestSub) {
      toast.error("This team has no submission yet. The team must submit their idea first.");
      return;
    }

    // Build payload matching backend ReviewCreateUpdate schema
    const payload = {
      submission_id: latestSub.submission_id,
      team_id: selectedTeam.team_id,
      innovation_score: scores["innovation_score"] || 0,
      technical_complexity_score: scores["technical_complexity_score"] || 0,
      feasibility_score: scores["feasibility_score"] || 0,
      ui_ux_score: scores["ui_ux_score"] || 0,
      presentation_score: scores["presentation_score"] || 0,
      progress_score: scores["progress_score"] || 0,
      comments: comments,
    };

    try {
      // Backend route: POST /reviews/submission/{submission_id}
      await api.post(
        `/reviews/submission/${latestSub.submission_id}`,
        payload
      );
      toast.success(
        `Review submitted for ${selectedTeam.team_name} (Total: ${currentTotalScore})`
      );
      setSelectedTeam(null);
      setSelectedTeamDetails(null);
    } catch (error) {
      toast.error(
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.detail || "Failed to submit review."
      );
    }
  };


  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F6F7FA] text-[#11152B] font-sans">
      
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <Timeline currentPhase={timelinePhase || "Participants reach"} teamName="Admin Panel" className="hidden lg:flex" />

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
                currentPhase={timelinePhase || "Participants reach"}
                teamName="Admin Panel"
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
                className="lg:hidden p-2.5 rounded-xl bg-white border border-gray-200 text-[#11152B] shadow-sm hover:bg-gray-50 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                aria-label="Open timeline menu"
              >
                <Menu className="w-5 h-5 text-[#F67C1B]" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
                  Hi, {user?.name || "Admin"}
                </h1>
                <p className="text-gray-500 font-medium text-xs sm:text-sm">
                  Manage the Hackulus&apos;26 event • All systems operational
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button
                onClick={() => setIsLeaderboardModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#11152B] border-gray-200 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow-sm h-9 sm:h-10 transition-transform hover:scale-105 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-[#F67C1B]" />
                <span>Leaderboard</span>
              </Button>

              <div className="flex items-center gap-2 bg-white px-4 sm:px-5 py-2 rounded-full border border-green-500/50 shadow-sm text-[#11152B] text-xs sm:text-sm font-bold h-9 sm:h-10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="capitalize">{user?.role === "judge" ? "Judge Mode" : "Admin Mode"}</span>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-2 gap-8 relative z-20">
            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-8">
              
              {/* Register Team Card — Admin only */}
              {user?.role === "admin" && (
              <div className="bg-gradient-to-br from-[#151932] to-[#1C254C] rounded-3xl p-6 shadow-xl border border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#F67C1B] font-black text-xl italic">/</span>
                    <h3 className="text-white text-xl font-bold tracking-wide">Register Team</h3>
                  </div>
                  <p className="text-white/50 text-sm">Add a new team with member reg numbers.</p>
                </div>
                <Button
                  id="open-register-team-modal"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="bg-gradient-to-r from-[#FF512F] to-[#F09819] hover:from-[#F09819] hover:to-[#FF512F] text-white font-bold h-11 px-6 rounded-xl shadow-[0_4px_15px_rgba(246,124,27,0.3)] flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> New Team
                </Button>
              </div>
              )}

              {/* Teams Table Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F67C1B] font-black text-xl italic">/</span>
                    <h3 className="text-[#11152B] text-xl font-bold tracking-wide">
                      Participating Teams
                    </h3>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search for a team..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-10 pl-9 rounded-full bg-gray-50 border-gray-200 text-sm focus-visible:ring-[#F67C1B]"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                      <tr className="text-gray-500">
                        <th className="py-3 px-4 font-semibold rounded-tl-xl">S.No</th>
                        <th className="py-3 px-4 font-semibold">Team Name</th>
                        <th className="py-3 px-4 font-semibold">Track</th>
                        <th className="py-3 px-4 font-semibold rounded-tr-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTeams.map((team, index) => {
                        const isRejected = team.status.toLowerCase() === "rejected";
                        const isSelected = selectedTeam?.team_id === team.team_id;

                        return (
                          <tr
                            key={team.team_id}
                            onClick={() => !isRejected && setSelectedTeam(team)}
                            className={`group transition-colors ${
                              isRejected
                                ? "opacity-50 bg-red-50"
                                : isSelected
                                ? "bg-[#F67C1B]/10 cursor-pointer"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                          >
                            <td className="py-3 px-4 text-gray-400 font-medium">{index + 1}</td>
                            <td className="py-3 px-4 font-semibold text-[#11152B]">
                              {team.team_name}
                            </td>
                            <td className="py-3 px-4 text-gray-600 truncate max-w-[150px]">
                              {team.track_name}
                            </td>
                            <td className="py-3 px-4 capitalize font-medium">
                              {isRejected ? (
                                <span className="text-red-500">{team.status}</span>
                              ) : (
                                <span className={
                                  team.status === "accepted" ? "text-green-500" 
                                  : team.status === "shortlisted" ? "text-purple-500" 
                                  : "text-blue-500"
                                }>
                                  {team.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Timeline Control Card — Admin only */}
              {user?.role === "admin" && (
              <div className="bg-[#151932] rounded-3xl p-8 shadow-xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F67C1B]/10 rounded-full blur-[40px] pointer-events-none"></div>
                
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <span className="text-[#F67C1B] font-black text-xl italic">/</span>
                  <h3 className="text-white text-xl font-bold tracking-wide">
                    Timeline Control
                  </h3>
                </div>
                <p className="text-white/60 text-sm mb-6 relative z-10">
                  Select the current active phase of the hackathon.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                  <Select value={timelinePhase} onValueChange={setTimelinePhase}>
                    <SelectTrigger className="w-full h-12 bg-white/10 border-white/20 text-white focus:ring-[#F67C1B]">
                      <SelectValue placeholder="Select a phase" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151932] border-white/20 text-white">
                      {hackathonPhases.map((phase) => (
                        <SelectItem key={phase} value={phase} className="focus:bg-white/10 focus:text-white">
                          {phase}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    onClick={handleTimelineUpdate}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#FF512F] to-[#F09819] hover:from-[#F09819] hover:to-[#FF512F] text-white font-bold h-12 px-8 rounded-xl shadow-[0_4px_15px_rgba(246,124,27,0.3)] hover:shadow-[0_6px_20px_rgba(246,124,27,0.4)] transition-all"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
              )}

            </div>

            {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
            <div className="flex flex-col gap-8">
              
              {/* Judging Panel Card */}
              <div className="bg-[#151932] rounded-3xl p-8 shadow-xl border border-white/5 relative overflow-hidden">
                {/* Glowing bg effects */}
                <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#F67C1B] font-black text-xl italic">/</span>
                      <h3 className="text-white text-xl font-bold tracking-wide">
                        Judging Panel
                      </h3>
                    </div>
                    {selectedTeam ? (
                      <p className="text-white/80 font-medium">
                        Judging: <span className="text-white font-bold">{selectedTeam.team_name}</span>
                      </p>
                    ) : (
                      <p className="text-white/50 text-sm">Select a team to begin judging</p>
                    )}
                  </div>

                  {selectedTeam && (
                    <div className="text-right">
                       <div className="text-sm text-white/50 mb-1">Total Score</div>
                       <div className="text-3xl font-black text-[#F67C1B]">
                         {currentTotalScore} <span className="text-sm text-white/40 font-normal">/ 100</span>
                       </div>
                    </div>
                  )}
                </div>

                {selectedTeam ? (
                  <form onSubmit={handleScoreSubmit} className="relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                      {scoringCategories.map((category) => (
                        <div key={category.key} className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <label className="text-white/90 text-xs font-semibold uppercase tracking-wider block">
                              {category.label}
                            </label>
                            <span className="text-[11px] font-bold text-[#F67C1B] bg-[#F67C1B]/15 px-2 py-0.5 rounded shrink-0">
                              {category.weight} (0-{category.max})
                            </span>
                          </div>
                          <Input
                            type="number"
                            min="0"
                            max={category.max}
                            step="0.5"
                            placeholder={`0 - ${category.max}`}
                            value={scores[category.key] ?? ""}
                            onChange={(e) => handleScoreChange(category.key, e.target.value)}
                            className="h-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#F67C1B] rounded-lg text-sm font-semibold"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-8">
                      <label className="text-white/80 text-xs font-semibold block mb-1.5 uppercase tracking-wider">
                        Comments
                      </label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Provide feedback for the team..."
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-[#F67C1B] rounded-xl resize-none h-24"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedTeam(null)}
                        className="flex-1 border-white/20 text-white hover:bg-white/10 h-12 rounded-xl"
                      >
                        Clear Selection
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-[#FF512F] to-[#F09819] hover:from-[#F09819] hover:to-[#FF512F] text-white font-bold h-12 rounded-xl shadow-[0_4px_15px_rgba(246,124,27,0.3)] transition-all"
                      >
                        Submit Score
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-60 border-2 border-dashed border-white/10 rounded-2xl">
                    <Edit2 className="w-12 h-12 text-white/30 mb-4" />
                    <p className="text-white text-sm">Select a team from the table on the left<br/>to grade their submission.</p>
                  </div>
                )}
              </div>

              {/* Project Details Card */}
              {selectedTeam && (
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[#F67C1B] font-black text-xl italic">/</span>
                    <h3 className="text-[#11152B] text-xl font-bold tracking-wide">
                      Project Details
                    </h3>
                  </div>

                  {isDetailsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-3 border-[#F67C1B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">Track</label>
                           <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-medium text-gray-800">
                             {selectedTeamDetails?.track_name || selectedTeam?.track_name || "No Track Selected"}
                           </div>
                        </div>
                        <div>
                           <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">Idea / Project Title</label>
                           <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-medium text-gray-800 truncate">
                             {latestSubmission?.title || "Pending submission"}
                           </div>
                        </div>
                      </div>

                      {/* Chosen Problem Statement */}
                      <div>
                        <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                          Chosen Problem Statement
                        </label>
                        <div className="bg-orange-50/60 border border-[#F67C1B]/25 p-3.5 rounded-xl text-sm text-[#11152B]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-gray-900">
                              {problemStatementTitle || "No problem statement selected yet"}
                            </span>
                            {problemStatementTitle && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F67C1B] text-white rounded-md shrink-0 shadow-sm">
                                Selected PS
                              </span>
                            )}
                          </div>
                          {problemStatementDescription && (
                            <p className="text-xs text-gray-600 mt-2 leading-relaxed border-t border-[#F67C1B]/15 pt-2">
                              {problemStatementDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                          {latestSubmission?.description ? "Submission Description" : "Description"}
                        </label>
                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm text-gray-700 min-h-[70px] whitespace-pre-wrap">
                           {latestSubmission?.description || (
                             <span className="text-gray-400 italic">No submission description provided yet.</span>
                           )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {[
                          {
                            name: "GitHub",
                            url:
                              latestSubmission?.links?.github ||
                              latestSubmission?.links?.github_link ||
                              latestSubmission?.links?.repo ||
                              (latestSubmission as unknown as { github_link?: string })?.github_link,
                          },
                          {
                            name: "Presentation",
                            url:
                              latestSubmission?.links?.presentation ||
                              latestSubmission?.links?.presentation_link ||
                              latestSubmission?.links?.ppt ||
                              latestSubmission?.links?.ppt_link,
                          },
                          {
                            name: "Demo / Live",
                            url:
                              latestSubmission?.links?.live_url ||
                              latestSubmission?.links?.demo ||
                              latestSubmission?.links?.demo_link ||
                              latestSubmission?.links?.video ||
                              latestSubmission?.links?.video_link,
                          },
                          {
                            name: "Figma",
                            url:
                              latestSubmission?.links?.figma ||
                              latestSubmission?.links?.figma_link,
                          },
                        ].map(({ name, url }) => {
                          const hasLink = Boolean(url && url !== "N/A" && typeof url === "string" && url.trim().length > 0);
                          const href = hasLink
                            ? url!.startsWith("http://") || url!.startsWith("https://")
                              ? url!
                              : `https://${url!}`
                            : undefined;

                          return (
                            <a
                              key={name}
                              href={href}
                              target={hasLink ? "_blank" : undefined}
                              rel="noreferrer"
                              onClick={hasLink ? undefined : (e) => e.preventDefault()}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                hasLink
                                  ? "bg-white border-[#F67C1B]/40 hover:border-[#F67C1B] hover:shadow-md text-[#11152B] cursor-pointer"
                                  : "bg-gray-50 border-gray-200/60 text-gray-400 cursor-not-allowed opacity-60"
                              }`}
                            >
                              <span className="text-xs font-bold">{name}</span>
                              {hasLink && <span className="text-[10px] text-[#F67C1B] font-medium mt-0.5">Open ↗</span>}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* Elimination Zone — Admin only */}
              {user?.role === "admin" && (
              <div className="bg-red-50 border border-red-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-red-900 text-lg font-bold tracking-wide">
                    Danger Zone
                  </h3>
                </div>
                <p className="text-red-700/70 text-sm mb-4">
                   Permanently eliminate a team from Hackulus&apos;26.
                </p>

                <div className="flex gap-4">
                  <Select onValueChange={(value) => setTeamToEliminate(Number(value))}>
                    <SelectTrigger className="flex-1 h-12 bg-white border-red-200 text-red-900 focus:ring-red-500">
                      <SelectValue placeholder="Select team to eliminate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTeams.map((team) => (
                        <SelectItem key={team.team_id} value={String(team.team_id)} className="text-red-900 focus:bg-red-50">
                          {team.team_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => teamToEliminate && setIsEliminationModalOpen(true)}
                    disabled={!teamToEliminate}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-6 rounded-xl transition-all"
                  >
                    Eliminate
                  </Button>
                </div>
              </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── ELIMINATION MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isEliminationModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-[#11152B]/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white border border-gray-100"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              >
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                   <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-center text-[#11152B] mb-2">
                  Confirm Elimination
                </h2>
                <p className="text-center text-gray-500 text-sm mb-8">
                  Are you absolutely sure you want to eliminate <br/><strong className="text-[#11152B]">&ldquo;{teams.find((t) => t.team_id === teamToEliminate)?.team_name}&rdquo;</strong>?<br/>This action cannot be reversed.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEliminationModalOpen(false)}
                    className="flex-1 h-12 rounded-xl text-gray-600 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEliminateConfirm}
                    className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    Yes, Eliminate
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── REGISTER TEAM MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-[#11152B]/50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isRegistering && setIsRegisterModalOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                initial={{ scale: 0.92, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 24 }}
                transition={{ type: "spring", damping: 22, stiffness: 300 }}
              >
                {/* Modal header */}
                <div className="bg-gradient-to-r from-[#151932] to-[#1C254C] px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F67C1B]/20 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-[#F67C1B]" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">Register Team</h2>
                      <p className="text-white/60 text-xs">Enter student email & registration number (password is set as uppercase Reg No.)</p>
                    </div>
                  </div>
                  <button onClick={() => !isRegistering && setIsRegisterModalOpen(false)} className="text-white/40 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                </div>

                {/* Modal body */}
                <form onSubmit={handleRegisterTeam} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                  {/* Team name */}
                  <div>
                    <label className="text-[#11152B] text-xs font-bold uppercase tracking-wider block mb-2">Team Name</label>
                    <Input
                      id="register-team-name"
                      value={registerTeamName}
                      onChange={(e) => setRegisterTeamName(e.target.value)}
                      placeholder="e.g. Team Nexus"
                      className="h-11 rounded-xl border-gray-200 focus-visible:ring-[#F67C1B]"
                      required
                    />
                  </div>

                  {/* Members */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[#11152B] text-xs font-bold uppercase tracking-wider">Members</label>
                      <button type="button" onClick={addMemberRow}
                        className="flex items-center gap-1.5 text-[#F67C1B] text-xs font-bold hover:text-[#FF512F] transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Member
                      </button>
                    </div>

                    <div className="space-y-4">
                      {registerMembers.map((member, idx) => (
                        <div key={idx} className={`rounded-2xl border p-4 transition-all ${
                          member.is_leader ? "border-[#F67C1B]/40 bg-orange-50/50" : "border-gray-100 bg-gray-50/50"
                        }`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`flex-1 text-xs font-bold uppercase tracking-wider ${
                              member.is_leader ? "text-[#F67C1B]" : "text-gray-400"
                            }`}>
                              {member.is_leader ? "★ Leader" : `Member ${idx + 1}`}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateMember(idx, "is_leader", true)}
                                className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${
                                  member.is_leader
                                    ? "bg-[#F67C1B] text-white border-[#F67C1B]"
                                    : "border-gray-200 text-gray-400 hover:border-[#F67C1B] hover:text-[#F67C1B]"
                                }`}
                              >
                                Leader
                              </button>
                              {registerMembers.length > 1 && (
                                <button type="button" onClick={() => removeMemberRow(idx)}
                                  className="text-gray-300 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-gray-500 text-xs font-semibold block mb-1">Full Name</label>
                              <Input
                                id={`member-name-${idx}`}
                                value={member.name}
                                onChange={(e) => updateMember(idx, "name", e.target.value)}
                                placeholder="Arjun Sharma"
                                className="h-9 rounded-lg border-gray-200 text-sm focus-visible:ring-[#F67C1B]"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-gray-500 text-xs font-semibold block mb-1">Student Email</label>
                              <Input
                                id={`member-email-${idx}`}
                                type="email"
                                value={member.email}
                                onChange={(e) => updateMember(idx, "email", e.target.value)}
                                placeholder="student@vitstudent.ac.in"
                                className="h-9 rounded-lg border-gray-200 text-sm focus-visible:ring-[#F67C1B]"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-gray-500 text-xs font-semibold block mb-1">Reg Number</label>
                              <Input
                                id={`member-reg-${idx}`}
                                value={member.registration_number}
                                onChange={(e) => updateMember(idx, "registration_number", e.target.value.toUpperCase())}
                                placeholder="24BCE0001"
                                className="h-9 rounded-lg border-gray-200 text-sm font-mono focus-visible:ring-[#F67C1B]"
                                required
                              />
                            </div>
                          </div>
                          <p className="text-gray-400 text-[11px] mt-2.5">
                            Login Email: <span className="font-mono text-gray-600">{member.email || "student@vitstudent.ac.in"}</span>
                            &nbsp;·&nbsp;Password: <span className="font-mono font-semibold text-gray-700">{member.registration_number ? member.registration_number.toUpperCase() : "REG_NUMBER"}</span> (All Capital)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => !isRegistering && setIsRegisterModalOpen(false)}
                      className="flex-1 h-12 rounded-xl font-semibold"
                      disabled={isRegistering}
                    >Cancel</Button>
                    <Button
                      id="submit-register-team"
                      type="submit"
                      disabled={isRegistering}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#FF512F] to-[#F09819] hover:from-[#F09819] hover:to-[#FF512F] text-white font-bold shadow-[0_4px_15px_rgba(246,124,27,0.3)] transition-all"
                    >
                      {isRegistering ? "Registering..." : "Register Team"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── LEADERBOARD MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isLeaderboardModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-[#11152B]/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLeaderboardModalOpen(false)}
            />
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setIsLeaderboardModalOpen(false)}
            >
              <LeaderboardModal onClose={() => setIsLeaderboardModalOpen(false)} isAdmin={true} />
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default withAdminAuth(AdminDashboard);
