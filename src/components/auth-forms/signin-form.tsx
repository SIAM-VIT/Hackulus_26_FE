"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { easeOut, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useForm, Controller } from "react-hook-form";
import { SignupFormData, signupSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SignInFormProps {
  onClose: () => void;
}

interface TrackOption {
  track_id: number;
  name: string;
}

const DEFAULT_TRACKS: TrackOption[] = [
  { track_id: 1, name: "AI and Mathematical Modelling" },
  { track_id: 2, name: "Cyber Security" },
  { track_id: 3, name: "FinTech" },
  { track_id: 4, name: "Healthcare" },
  { track_id: 5, name: "VIT-Centric" },
  { track_id: 6, name: "Open Innovation" },
  { track_id: 7, name: "Sustainability" },
];

export default function SignInForm({ onClose }: SignInFormProps) {
  const { signup } = useAuth();
  const [tracks, setTracks] = useState<TrackOption[]>(DEFAULT_TRACKS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      track_id: 1,
    },
  });

  useEffect(() => {
    api
      .get("/teams/tracks")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTracks(res.data);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_TRACKS
      });
  }, []);

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        team_name: data.team_name,
        track_id: data.track_id,
        registration_number: data.registration_number,
        hostel_block: data.hostel_block,
      });
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="w-full max-w-xl p-10 rounded-2xl shadow-2xl border-r-8 border-b-8 border-black bg-gradient-to-b from-[#010027] via-[#13184E] to-[#3142B4] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20">
          <div className="text-left mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">SIGN UP</h1>
            <p className="text-white/80 text-xl">
              Register your team and join Hackulus!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xl block text-white font-medium mb-1">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                {...register("name")}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
              {errors.name && (
                <p className="text-red-400 mt-1 text-sm flex items-center">
                  <Info className="w-4 h-4 mr-1" /> {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xl block text-white font-medium mb-1">
                VIT Student Email
              </label>
              <Input
                type="email"
                placeholder="your.name2024@vitstudent.ac.in"
                {...register("email")}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
              {errors.email && (
                <p className="text-red-400 mt-1 text-sm flex items-center">
                  <Info className="w-4 h-4 mr-1" /> {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xl block text-white font-medium mb-1">
                  Reg. Number
                </label>
                <Input
                  type="text"
                  placeholder="24BCE0001"
                  {...register("registration_number")}
                  className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 uppercase"
                />
                {errors.registration_number && (
                  <p className="text-red-400 mt-1 text-sm flex items-center">
                    <Info className="w-4 h-4 mr-1" /> {errors.registration_number.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xl block text-white font-medium mb-1">
                  Hostel Block
                </label>
                <Input
                  type="text"
                  placeholder="MH-A / LH-B"
                  {...register("hostel_block")}
                  className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xl block text-white font-medium mb-1">
                Team Name
              </label>
              <Input
                type="text"
                placeholder="Enter your team name"
                {...register("team_name")}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
              {errors.team_name && (
                <p className="text-red-400 mt-1 text-sm flex items-center">
                  <Info className="w-4 h-4 mr-1" /> {errors.team_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xl block text-white font-medium mb-1">
                Hackathon Track
              </label>
              <Controller
                control={control}
                name="track_id"
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={String(field.value)}
                  >
                    <SelectTrigger className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5">
                      <SelectValue placeholder="Select a track" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151932] border-white/20 text-white">
                      {tracks.map((t) => (
                        <SelectItem key={t.track_id} value={String(t.track_id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <label className="text-xl block text-white font-medium mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="Create a password (or use Reg. No)"
                {...register("password")}
                className="w-full bg-white text-black border-2 border-black rounded-lg px-4 py-2.5 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300"
              />
              {errors.password && (
                <p className="text-red-400 mt-1 text-sm flex items-center">
                  <Info className="w-4 h-4 mr-1" /> {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="text-2xl p-4 rounded-lg font-medium bg-[#3142b4] hover:bg-[#3142b4] border-r-4 border-b-4 border-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-2xl border-r-4 border-b-4 border-black bg-white text-gray-800 p-4 rounded-lg font-medium hover:bg-gray-100"
              >
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

