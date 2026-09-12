"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { easeOut, motion } from "framer-motion";
import api, { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { trackinfo } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Lock } from "lucide-react";

interface TrackItem {
  track_id: number;
  name: string;
  description?: string;
}

interface ProblemStatementItem {
  id: number;
  title: string;
  description: string;
  track_id: number;
}

interface Review0ModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentTrackId?: number | null;
  currentProblemStatementId?: number | null;
  currentTitle?: string;
  currentPptLink?: string;
  currentDescription?: string;
}

export default function Review0Modal({
  onClose,
  onSuccess,
  currentTrackId,
  currentProblemStatementId,
  currentTitle = "",
  currentPptLink = "",
  currentDescription = "",
}: Review0ModalProps) {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(
    currentTrackId || 1
  );
  const [problemStatements, setProblemStatements] = useState<ProblemStatementItem[]>([]);
  const [selectedPsId, setSelectedPsId] = useState<number | null>(
    currentProblemStatementId || null
  );
  const [title, setTitle] = useState(currentTitle);
  const [pptLink, setPptLink] = useState(currentPptLink);
  const [description, setDescription] = useState(currentDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPs, setIsLoadingPs] = useState(false);

  // 1. Fetch tracks
  useEffect(() => {
    api
      .get("/teams/tracks")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTracks(res.data);
          if (!currentTrackId && res.data[0]) {
            setSelectedTrackId(res.data[0].track_id);
          }
        }
      })
      .catch(() => {
        // Fallback to static trackinfo
        const fallback = trackinfo.map((t, index) => ({
          track_id: index + 1,
          name: t.name,
          description: t.description,
        }));
        setTracks(fallback);
      });
  }, [currentTrackId]);

  // 2. Fetch problem statements when track changes
  useEffect(() => {
    if (!selectedTrackId) return;
    setIsLoadingPs(true);
    api
      .get(`/teams/tracks/${selectedTrackId}/problem-statements`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProblemStatements(res.data);
          if (currentProblemStatementId) {
            const found = res.data.find((p: ProblemStatementItem) => p.id === currentProblemStatementId);
            if (found) setSelectedPsId(found.id);
            else setSelectedPsId(res.data[0].id);
          } else {
            setSelectedPsId(res.data[0].id);
          }
        } else {
          setProblemStatements([]);
        }
      })
      .catch(() => {
        const trackObj = tracks.find((t) => t.track_id === selectedTrackId);
        const staticTrack = trackinfo.find((t) => t.name === trackObj?.name);
        if (staticTrack) {
          const fallbackPs = staticTrack.problem_statements.map((p, idx) => ({
            id: selectedTrackId * 10 + idx + 1,
            title: p.title,
            description: p.info,
            track_id: selectedTrackId,
          }));
          setProblemStatements(fallbackPs);
          setSelectedPsId(fallbackPs[0]?.id || null);
        }
      })
      .finally(() => {
        setIsLoadingPs(false);
      });
  }, [selectedTrackId, tracks, currentProblemStatementId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackId || !selectedPsId) {
      toast.error("Please select both a track and a problem statement.");
      return;
    }
    if (!title.trim()) {
      toast.error("Project Title is required.");
      return;
    }
    if (!pptLink.trim()) {
      toast.error("Presentation / PPT link is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/users/review0", {
        track_id: selectedTrackId,
        problem_statement_id: selectedPsId,
        title: title.trim(),
        ppt_link: pptLink.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Review 0: Track, Problem Statement, Title & PPT submitted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to submit Review 0."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPs = problemStatements.find((p) => p.id === selectedPsId);
  const selectedTrack = tracks.find((t) => t.track_id === selectedTrackId);

  return (
    <motion.div
      className="w-full p-8 rounded-2xl shadow-2xl afacad"
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: "0%" }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ ease: easeOut, duration: 0.8, delay: 0.2 }}
    >
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl p-8 sm:p-10 rounded-2xl shadow-2xl border-r-8 border-b-8 border-black bg-gradient-to-b from-[#010027] via-[#13184E] to-[#3142B4] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#F67C1B]">
          <div className="text-left mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-6 h-6 text-[#F67C1B]" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Review 0 Submission</h1>
            </div>
            <p className="text-white/80 text-base sm:text-lg">
              Submit your team&apos;s Track, Problem Statement, Project Title, and Presentation (PPT).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Track Selector */}
            <div>
              <label className="text-lg sm:text-xl block text-white font-medium mb-1 flex items-center justify-between">
                <span>Select Track</span>
                <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Required</span>
              </label>
              <Select
                value={selectedTrackId ? String(selectedTrackId) : ""}
                onValueChange={(val) => setSelectedTrackId(Number(val))}
              >
                <SelectTrigger className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-3 text-base">
                  <SelectValue placeholder="Choose a track..." />
                </SelectTrigger>
                <SelectContent className="bg-[#151932] border-white/20 text-white">
                  {tracks.map((t) => (
                    <SelectItem key={t.track_id} value={String(t.track_id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTrack?.description && (
                <p className="text-white/70 text-xs sm:text-sm mt-1.5 line-clamp-2">
                  {selectedTrack.description}
                </p>
              )}
            </div>

            {/* Problem Statement Selector */}
            <div>
              <label className="text-lg sm:text-xl block text-white font-medium mb-1 flex items-center justify-between">
                <span>Select Problem Statement</span>
                <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Required</span>
              </label>
              {isLoadingPs ? (
                <div className="text-white/70 text-sm py-2">Loading problem statements...</div>
              ) : (
                <Select
                  value={selectedPsId ? String(selectedPsId) : ""}
                  onValueChange={(val) => setSelectedPsId(Number(val))}
                >
                  <SelectTrigger className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-3 text-base">
                    <SelectValue placeholder="Choose problem statement..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151932] border-white/20 text-white max-h-60">
                    {problemStatements.map((ps) => (
                      <SelectItem key={ps.id} value={String(ps.id)}>
                        {ps.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Problem Statement Details Preview */}
            {selectedPs && (
              <div className="bg-black/30 border border-white/10 rounded-xl p-3.5 text-white">
                <h4 className="font-bold text-[#F67C1B] text-sm sm:text-base mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {selectedPs.title}
                </h4>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  {selectedPs.description}
                </p>
              </div>
            )}

            {/* Project Title */}
            <div>
              <label className="text-lg sm:text-xl block text-white font-medium mb-1 flex items-center justify-between">
                <span>Project Title</span>
                <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Required</span>
              </label>
              <Input
                type="text"
                required
                placeholder="Enter your project name / title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
            </div>

            {/* Presentation / PPT Link */}
            <div>
              <label className="text-lg sm:text-xl block text-white font-medium mb-1 flex items-center justify-between">
                <span>Presentation / PPT Link</span>
                <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Required</span>
              </label>
              <Input
                type="url"
                required
                placeholder="https://docs.google.com/presentation/d/... or Canva link"
                value={pptLink}
                onChange={(e) => setPptLink(e.target.value)}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-lg sm:text-xl block text-white font-medium mb-1 flex items-center justify-between">
                <span>Brief Solution Description</span>
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Optional</span>
              </label>
              <Input
                type="text"
                placeholder="Brief summary of your approach / architecture"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="text-xl sm:text-2xl p-4 rounded-lg font-medium bg-[#3142b4] hover:bg-[#3142b4] border-r-4 border-b-4 border-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedTrackId || !selectedPsId || !title.trim() || !pptLink.trim()}
                className="text-xl sm:text-2xl border-r-4 border-b-4 border-black bg-gradient-to-r from-[#FF512F] to-[#F09819] hover:from-[#F09819] hover:to-[#FF512F] text-white p-4 rounded-lg font-bold shadow-lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Review 0"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
