import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, { message: "Password is required." }),
});

export const ideaSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters." })
    .max(100),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(1000),
  presentation_link: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  problem_statement: z
    .string()
    .min(1, { message: "Please select a problem statement." }),
});

export const projectSchema = z.object({
  title: z.string().min(3, { message: "Project name is required." }),
  description: z.string().min(10, { message: "Description is required." }),
  github_link: z.string().url({ message: "A valid GitHub URL is required." }),
  figma_link: z
    .string()
    .url({ message: "Please enter a valid Figma URL." })
    .optional()
    .or(z.literal("")),
  presentation_link: z
    .string()
    .url({ message: "Please enter a valid Presentation URL." })
    .optional()
    .or(z.literal("")),
});

export const reviewSchema = z.object({
  innovation_score: z.number().min(0).max(100).default(0),
  technical_complexity_score: z.number().min(0).max(100).default(0),
  feasibility_score: z.number().min(0).max(100).default(0),
  ui_ux_score: z.number().min(0).max(100).default(0),
  presentation_score: z.number().min(0).max(100).default(0),
  progress_score: z.number().min(0).max(100).default(0),
  comments: z.string().optional(),
});

export const review0Schema = z.object({
  track_id: z.number().min(1, { message: "Please select a track." }),
  problem_statement_id: z
    .number()
    .min(1, { message: "Please select a problem statement." }),
});

export const review1Schema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  github_link: z.string().url({ message: "A valid GitHub URL is required." }),
  ppt_link: z
    .string()
    .url({ message: "Please enter a valid presentation URL." })
    .optional()
    .or(z.literal("")),
  demo_link: z
    .string()
    .url({ message: "Please enter a valid demo URL." })
    .optional()
    .or(z.literal("")),
});

export const review2Schema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  github_link: z.string().url({ message: "A valid GitHub URL is required." }),
  ppt_link: z
    .string()
    .url({ message: "Please enter a valid presentation URL." })
    .optional()
    .or(z.literal("")),
  live_url: z
    .string()
    .url({ message: "Please enter a valid deployed URL." })
    .optional()
    .or(z.literal("")),
  video_link: z
    .string()
    .url({ message: "Please enter a valid video demonstration URL." })
    .optional()
    .or(z.literal("")),
});

export const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .refine((val) => val.endsWith("@vitstudent.ac.in"), {
      message: "Only @vitstudent.ac.in email addresses are accepted.",
    }),
  password: z
    .string()
    .min(1, { message: "Password is required." }),
  team_name: z
    .string()
    .min(2, { message: "Team name must be at least 2 characters." }),
  track_id: z
    .number()
    .min(1, { message: "Please select a track." }),
  registration_number: z.string().min(1, { message: "Registration number is required." }),
  hostel_block: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type IdeaFormData = z.infer<typeof ideaSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type Review0FormData = z.infer<typeof review0Schema>;
export type Review1FormData = z.infer<typeof review1Schema>;
export type Review2FormData = z.infer<typeof review2Schema>;
export type SignupFormData = z.infer<typeof signupSchema>;


