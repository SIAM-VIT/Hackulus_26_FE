"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { easeOut, motion } from "framer-motion";
import { toast } from "sonner";
import React, { useState } from "react";
import api from "@/lib/api";

interface Submission {
  submission_id: number;
  title?: string;
  description?: string;
  links?: Record<string, string>;
}

interface ProjectModifyFormProps {
  submission: Submission;
  onClose: () => void;
  reviewStage: string;
  submissionType: "review1" | "review2" | "final";
  onSuccess?: () => void;
}

export default function ProjectModifyForm({
  onClose,
  submission,
  reviewStage,
  submissionType,
  onSuccess,
}: ProjectModifyFormProps) {
  const [formData, setFormData] = useState({
    title: submission.title || "",
    description: submission.description || "",
    github_link: submission.links?.github || submission.links?.github_link || "",
    ppt_link: submission.links?.ppt || submission.links?.ppt_link || submission.links?.presentation_link || "",
    demo_link: submission.links?.demo || submission.links?.demo_link || "",
    live_url: submission.links?.live_url || "",
    video_link: submission.links?.video || submission.links?.video_link || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (submission) {
      setFormData({
        title: submission.title || "",
        description: submission.description || "",
        github_link: submission.links?.github || submission.links?.github_link || "",
        ppt_link: submission.links?.ppt || submission.links?.ppt_link || submission.links?.presentation_link || "",
        demo_link: submission.links?.demo || submission.links?.demo_link || "",
        live_url: submission.links?.live_url || "",
        video_link: submission.links?.video || submission.links?.video_link || "",
      });
    }
  }, [submission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.github_link) {
      toast.error("GitHub link is mandatory.");
      return;
    }

    const linksPayload: Record<string, string> = {
      github: formData.github_link,
    };
    if (formData.ppt_link) linksPayload.ppt = formData.ppt_link;
    if (submissionType === "review1") {
      if (formData.demo_link) linksPayload.demo = formData.demo_link;
    } else {
      if (formData.live_url) linksPayload.live_url = formData.live_url;
      if (formData.video_link) linksPayload.video = formData.video_link;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/users/submission/${submission.submission_id}`, {
        title: formData.title || undefined,
        description: formData.description || undefined,
        links: linksPayload,
      });
      toast.success("Submission updated successfully!");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any)?.response?.data?.detail || (error as any)?.response?.data?.message || "Failed to update project.";
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
              Modify your project
            </h1>
            <p className="text-white/80 text-xl">
              You are submitting for:{" "}
              <span className="font-semibold">{reviewStage}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xl block text-white font-medium mb-1">
                Project Title
              </label>
              <Input
                type="text"
                placeholder="Enter project title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="text-xl block text-white font-medium mb-1">
                Description
              </label>
              <Input
                type="text"
                placeholder="Brief description of progress / solution"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="text-xl block text-white font-medium mb-1 flex items-center justify-between">
                <span>GitHub Repository Link</span>
                <span className="text-[#F67C1B] text-xs font-bold uppercase tracking-wider">Mandatory</span>
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
              <label className="text-xl block text-white font-medium mb-1">
                Presentation / PPT Link (Optional)
              </label>
              <Input
                type="url"
                placeholder="https://docs.google.com/presentation/d/..."
                value={formData.ppt_link}
                onChange={(e) => setFormData({ ...formData, ppt_link: e.target.value })}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
            </div>

            {submissionType === "review1" && (
              <div>
                <label className="text-xl block text-white font-medium mb-1">
                  Demo Link (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/demo or prototype link"
                  value={formData.demo_link}
                  onChange={(e) => setFormData({ ...formData, demo_link: e.target.value })}
                  className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
                />
              </div>
            )}

            {(submissionType === "review2" || submissionType === "final") && (
              <>
                <div>
                  <label className="text-xl block text-white font-medium mb-1">
                    Live / Deployed URL (Optional)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://your-deployed-app.vercel.app"
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="text-xl block text-white font-medium mb-1">
                    Video Demonstration URL (Optional)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://youtu.be/final-pitch-video"
                    value={formData.video_link}
                    onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
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
                className="text-3xl border-r-4 border-b-4 border-black bg-white text-gray-800 p-5 rounded-lg font-medium hover:bg-gray-100"
              >
                {isSubmitting ? "Modifying..." : "Modify"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
