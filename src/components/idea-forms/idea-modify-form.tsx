"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { IdeaFormData, ideaSchema } from "@/lib/schemas";
import { trackinfo } from "@/lib/data";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

interface Submission {
  submission_id: number;
  type: "review1";
  title: string;
  description: string;
  links?: {
    presentation_link?: string;
  };
}

export default function IdeaModificationForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [teamTrackName, setTeamTrackName] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link_url: "",
  });
  const submissionId = submission?.submission_id;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
  });

  useEffect(() => {
    Promise.all([api.get("/users/submissions"), api.get("/users/home")])
      .then(([submissionsRes, homeRes]) => {
        const ideaSubmission = submissionsRes.data.submissions.find(
          (s: { type: string }) => s.type === "review1"
        );
        const teamData = homeRes.data.team;

        if (ideaSubmission) {
          setSubmission(ideaSubmission);
        }
        if (teamData) {
          setTeamTrackName(teamData.track_name);
          let currentProblemStatementTitle = "";
          if (teamData.problem_statement) {
            try {
              const parsed = JSON.parse(teamData.problem_statement);
              if (
                Array.isArray(parsed) &&
                parsed.length > 0 &&
                parsed[0].title
              ) {
                currentProblemStatementTitle = parsed[0].title;
              }
            } catch (e) {
              console.error("Failed to parse problem statement:", e);
              currentProblemStatementTitle = teamData.problem_statement;
            }
          }

          reset({
            title: ideaSubmission?.title || "",
            description: ideaSubmission?.description || "",
            presentation_link: ideaSubmission?.links?.presentation_link || "",
            problem_statement: currentProblemStatementTitle,
          });
        }
      })
      .catch((err) => {
        toast.error("Failed to fetch initial data.");
        console.error("Error fetching initial data:", err);
      });
  }, [reset]);

  const problemStatements = teamTrackName
    ? trackinfo.find((t) => t.name === teamTrackName)?.problem_statements || []
    : [];

  const onSubmit = async (data: IdeaFormData) => {
    if (!user?.is_leader) {
      toast.error("Only the team leader can perform this action.");
      return;
    }
    if (!submission?.submission_id) {
      toast.error("No submission found to update.");
      return;
    }

    const submissionPayload = {
      title: data.title,
      description: data.description,
      type: "review1",
      links: { presentation_link: data.presentation_link },
    };
    const problemStatementPayload = {
      problem_statement: data.problem_statement,
    };

    try {
      await Promise.all([
        api.put(`/users/submission/${submissionId}`, submissionPayload),
        api.put("/users/team/problem-statement", problemStatementPayload),
      ]);
      toast.success("Idea updated successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.message || "An error occurred."
      );
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "", link_url: "" });
    router.push("/dashboard");
  };

  return (
    <div className="bg-transparent z-10 h-full -ml-56">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[#1b2251] text-5xl font-bold text-center ml-24 mb-8">
          Modify your idea
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center">
            <label className="w-48 text-right mr-8 text-[#1b2251] text-3xl font-semibold">
              Idea Name
            </label>
            <div className="flex-1">
              <Input
                {...register("title")}
                placeholder="Enter your project name"
                className="h-[44px] w-full text-lg border-r-4 border-b-4 border-black rounded-lg bg-[#ffffff]/30 placeholder:text-[#a8a8a7]"
              />
              {errors.title && (
                <p className="text-red-500 mt-1 flex items-center">
                  <Info size={16} className="mr-1" />
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-48 text-right mr-8 pt-2 text-[#1b2251] text-3xl font-semibold">
              Description
            </label>
            <div className="flex-1">
              <Textarea
                {...register("description")}
                placeholder="Describe your project"
                className="min-h-[24px] w-full text-lg border-r-4 border-b-4 border-black rounded-lg bg-[#ffffff]/30 placeholder:text-[#a8a8a7] resize-none"
              />
              {errors.description && (
                <p className="text-red-500 mt-1 flex items-center">
                  <Info size={16} className="mr-1" />
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <label className="w-48 text-right mr-8 text-[#1b2251] text-3xl font-semibold">
              Problem Statement
            </label>
            <div className="flex-1">
              <Controller
                control={control}
                name="problem_statement"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-[44px] w-full text-lg border-r-4 border-b-4 border-black rounded-lg bg-[#ffffff]/30">
                      <SelectValue placeholder="Select problem statement..." />
                    </SelectTrigger>
                    <SelectContent>
                      {problemStatements.map((ps) => (
                        <SelectItem
                          className="focus:bg-[#CF3D00] focus:text-white"
                          key={ps.title}
                          value={ps.title}
                        >
                          {ps.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.problem_statement && (
                <p className="text-red-500 mt-1 flex items-center">
                  <Info size={16} className="mr-1" />
                  {errors.problem_statement.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <label className="w-48 text-right mr-8 text-[#1b2251] text-3xl font-semibold">
              Presentation Link
            </label>
            <div className="flex-1">
              <Textarea
                {...register("presentation_link")}
                placeholder="Attach your presentation link (Drive,Google Slides,etc)"
                className="h-16 w-full text-lg border-r-4 border-b-4 border-black rounded-2xl bg-[#ffffff]/30 placeholder:text-[#a8a8a7] resize-none"
              />
              {errors.presentation_link && (
                <p className="text-red-500 mt-1 flex items-center">
                  <Info size={16} className="mr-1" />
                  {errors.presentation_link.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-x-52 items-center">
            <Button
              type="button"
              onClick={handleCancel}
              className="bg-[#3142b4] hover:bg-[#3142b4] text-[#ffffff] text-2xl font-semibold px-12 py-6 rounded-2xl border-r-8 border-b-8 border-black"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#ffffff] hover:bg-[#ffffff] text-[#000000] text-2xl font-semibold px-12 py-6 rounded-2xl border-r-8 border-b-8 border-black"
            >
              {isSubmitting ? "Modifying..." : "Modify"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
