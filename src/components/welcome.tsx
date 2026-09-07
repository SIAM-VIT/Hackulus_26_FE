"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import { useState } from "react";
import LogInForm from "./auth-forms/login-form";

export default function Welcome() {
  const springTransition = {
    type: "spring" as const,
    damping: 20,
    stiffness: 100,
  };
  const [isLogInOpen, setIsLogInOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#fefefe] overflow-hidden relative flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* ── BACKGROUND VECTORS & DECORATIONS (Balanced & Non-colliding) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Top left corner element */}
        <motion.div
          className="absolute -top-4 -left-4 w-32 sm:w-44"
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.3 }}
        >
          <Image src="/vector1.svg" alt="" width={200} height={200} className="w-full h-auto" />
        </motion.div>

        {/* Top right corner decorative wave */}
        <motion.div
          className="absolute -top-10 -right-10 w-[280px] sm:w-[450px] lg:w-[650px]"
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.4 }}
        >
          <Image src="/vector2.svg" alt="" width={800} height={800} className="w-full h-auto" />
        </motion.div>

        {/* Bottom right wave */}
        <motion.div
          className="absolute -bottom-6 -right-6 w-[350px] sm:w-[550px] lg:w-[850px]"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.5 }}
        >
          <Image src="/vector5.svg" alt="" width={1100} height={500} className="w-full h-auto" />
        </motion.div>

        {/* Bottom left background accent circle */}
        <motion.div
          className="absolute -bottom-24 left-[8%] w-44 h-44 sm:w-56 sm:h-56 bg-[#ff7824] rounded-full opacity-90"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ ...springTransition, delay: 0.6 }}
        />

        {/* Floating accent dots - positioned safely in top-center */}
        <motion.div
          className="absolute top-8 left-[38%] hidden sm:block"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.7 }}
        >
          <Image src="/vector4.svg" alt="" width={45} height={45} />
        </motion.div>

        {/* Floating accent decor - positioned in top space */}
        <motion.div
          className="absolute top-4 left-[28%] hidden md:block"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.8 }}
        >
          <Image src="/vector3.svg" alt="" width={80} height={80} />
        </motion.div>

        {/* Floating circle - safely placed near bottom left edge */}
        <motion.div
          className="absolute bottom-16 left-[34%] w-16 h-16 sm:w-20 sm:h-20 bg-[#242e6c] rounded-full hidden md:block opacity-95"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.95, scale: 1 }}
          transition={{ ...springTransition, delay: 0.9 }}
        />
      </div>

      {/* ── HERO CONTENT: 2-COLUMN BALANCED LAYOUT ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 py-4">
        
        {/* Left: Hackulus Logo Artwork with Vector6 */}
        <motion.div
          className="flex-1 flex justify-center items-center w-full max-w-[460px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springTransition, delay: 0.4 }}
        >
          <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] flex items-center justify-center p-4">
            <Image
              src="/vector6.svg"
              alt=""
              width={600}
              height={600}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-sm"
              priority
            />
            <div className="relative z-10 w-[170px] h-[170px] sm:w-[230px] sm:h-[230px] lg:w-[270px] lg:h-[270px] flex items-center justify-center">
              <Image
                src="/final-logo.webp"
                alt="Hackulus Logo"
                width={319}
                height={319}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Right: Typography & LOG IN Button (Centered) */}
        <motion.div
          className="flex-1 flex flex-col items-center text-center max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.5 }}
        >
          <h1 className="anta text-4xl sm:text-6xl lg:text-7xl font-black text-[#000000] mb-4 sm:mb-6 leading-[1.08] tracking-tight text-center">
            WELCOME TO
            <br />
            HACKULUS
          </h1>

          <p className="hanken-grotesk text-base sm:text-xl lg:text-2xl text-[#000000] font-medium leading-relaxed mb-6 sm:mb-8 text-center">
            Where ideas ignite, <br />
            Code flows, and innovation takes flight. <br />
            24 hours to build, break, and revolutionize!
          </p>

          <div className="flex justify-center w-full">
            <Button
              id="login-btn-welcome"
              onClick={() => setIsLogInOpen(true)}
              className="anta bg-gradient-to-r from-[#FC2D2D] via-[#FE751A] to-[#FF9811] text-white font-bold text-lg sm:text-2xl px-12 sm:px-16 py-5 sm:py-7 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              LOG IN
            </Button>
          </div>
        </motion.div>

      </div>

      {/* ── LOGIN FORM MODAL (Original styling with dot grid background) ── */}
      <AnimatePresence>
        {isLogInOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-white/60"
              style={{
                backgroundImage: `radial-gradient(circle, #a8a8a7 5px, transparent 1px)`,
                backgroundSize: "90px 90px",
              }}
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ ease: easeOut, duration: 0.6 }}
              onClick={() => setIsLogInOpen(false)}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <LogInForm onClose={() => setIsLogInOpen(false)} />
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
