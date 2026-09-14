"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { easeOut, motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProjectSubmissionFormProps {
  onClose: () => void;
  reviewStage: string;
  submissionType: "review1" | "review2" | "final";
  onSuccess?: () => void;
}

export default function ProjectSubmissionForm({
  onClose,
  reviewStage,
  submissionType,
  onSuccess,
}: ProjectSubmissionFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    github_link: "",
    ppt_link: "",
    figma_link: "",
    live_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReview2 = submissionType === "review2" || submissionType === "final";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.is_leader) {
      toast.error("Only the team leader can fill and submit review forms.");
      return;
    }
    if (!formData.github_link.trim()) {
      toast.error("GitHub repository link is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!isReview2) {
        await api.post("/users/review1", {
          github_link: formData.github_link.trim(),
          figma_link: formData.figma_link.trim() || undefined,
        });
      } else {
        await api.post("/users/review2", {
          github_link: formData.github_link.trim(),
          figma_link: formData.figma_link.trim() || undefined,
          live_url: formData.live_url.trim() || undefined,
        });
      }
      toast.success(`${reviewStage} submitted successfully!`);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any)?.response?.data?.detail || (error as any)?.response?.data?.message || "Failed to submit project.";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <motion.div
      className="w-full p-8 rounded-2xl shadow-2xl afacad"
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: "0%" }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ ease: easeOut, duration: 0.8, delay: 0.2 }}
    >
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-xl p-10 rounded-2xl shadow-2xl border-r-8 border-b-8 border-black bg-gradient-to-b from-[#010027] via-[#13184E] to-[#3142B4]">
          <div className="text-left mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              Mission accomplished? Hit Submit!
            </h1>
            <p className="text-white/80 text-xl mb-3">
              You are submitting for:{" "}
              <span className="font-semibold">{reviewStage}</span>
            </p>
            {!user?.is_leader && (
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Notice: Only the team leader has permission to submit review forms.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xl block text-white font-medium mb-1 flex items-center justify-between">
                <span>GitHub Repository Link</span>
                <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Required</span>
              </label>
              <Input
                type="url"
                required
                placeholder="https://github.com/your-team/repo"
                value={formData.github_link}
                onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="text-xl block text-white font-medium mb-1 flex items-center justify-between">
                <span>Figma Design Link</span>
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Optional</span>
              </label>
              <Input
                type="url"
                placeholder="https://www.figma.com/design/..."
                value={formData.figma_link}
                onChange={(e) => setFormData({ ...formData, figma_link: e.target.value })}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
            </div>

            {isReview2 && (
              <div>
                <label className="text-xl block text-white font-medium mb-1 flex items-center justify-between">
                  <span>Live Deployed / Demo Link</span>
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Optional</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://your-deployed-app.vercel.app"
                  value={formData.live_url}
                  onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                  className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                onClick={handleCancel}
                className="text-3xl p-5 rounded-lg font-medium bg-[#3142b4] hover:bg-[#3142b4] border-r-4 border-b-4 border-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !user?.is_leader || !formData.github_link.trim()}
                className="text-3xl border-r-4 border-b-4 border-black bg-white text-gray-800 p-5 rounded-lg font-medium hover:bg-gray-100"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
