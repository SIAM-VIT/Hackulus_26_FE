"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { easeOut, motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

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
    if (!isReview2) {
      if (!formData.title.trim()) {
        toast.error("Project Title is required.");
        return;
      }
      if (!formData.description.trim()) {
        toast.error("Project Description is required.");
        return;
      }
      if (!formData.github_link.trim()) {
        toast.error("GitHub link is required.");
        return;
      }
      if (!formData.ppt_link.trim()) {
        toast.error("Presentation / PPT link is required.");
        return;
      }
    } else {
      if (!formData.live_url.trim()) {
        toast.error("Live deployed link is required.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (!isReview2) {
        await api.post("/users/review1", {
          title: formData.title.trim(),
          description: formData.description.trim(),
          github_link: formData.github_link.trim(),
          ppt_link: formData.ppt_link.trim(),
          figma_link: formData.figma_link.trim() || undefined,
        });
      } else {
        await api.post("/users/review2", {
          live_url: formData.live_url.trim(),
          figma_link: formData.figma_link.trim() || undefined,
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
            <p className="text-white/80 text-xl">
              You are submitting for:{" "}
              <span className="font-semibold">{reviewStage}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isReview2 ? (
              <>
                <div>
                  <label className="text-xl block text-white font-medium mb-1 flex items-center justify-between">
                    <span>Project Title</span>
                    <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Required</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter project title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="text-xl block text-white font-medium mb-1 flex items-center justify-between">
                    <span>Description</span>
                    <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Required</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Brief description of progress / solution"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
                  />
                </div>

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
                    <span>Presentation / PPT Link</span>
                    <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Required</span>
                  </label>
                  <Input
                    type="url"
                    required
                    placeholder="https://docs.google.com/presentation/d/..."
                    value={formData.ppt_link}
                    onChange={(e) => setFormData({ ...formData, ppt_link: e.target.value })}
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
              </>
            ) : (
              <>
                <div>
                  <label className="text-xl block text-white font-medium mb-1 flex items-center justify-between">
                    <span>Live Deployed Link</span>
                    <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Required</span>
                  </label>
                  <Input
                    type="url"
                    required
                    placeholder="https://your-deployed-app.vercel.app"
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
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
              </>
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
                disabled={isSubmitting}
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
