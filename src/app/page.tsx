"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/splashscreen";
import Welcome from "@/components/welcome";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        const destination = isAdmin ? "/admin" : "/dashboard";
        router.replace(destination);
      } else {
        const timer = setTimeout(() => {
          setShowSplash(false);
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-white text-center flex items-center justify-center text-3xl text-black">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="w-screen h-screen bg-white text-center flex items-center justify-center text-3xl text-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black">
      <AnimatePresence mode="wait">
        {showSplash ? <SplashScreen key="splash" /> : <Welcome key="welcome" />}
      </AnimatePresence>
    </div>
  );
}
