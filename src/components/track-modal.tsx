"use client";

import type React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trackinfo } from "@/lib/data";
import Image from "next/image";
import { easeOut, motion } from "framer-motion";

interface TrackModalProps {
  onClose: () => void;
  trackData: (typeof trackinfo)[0];
}

export default function TrackModal({ trackData }: TrackModalProps) {
  return (
    <motion.div
      className="w-full p-8 rounded-2xl shadow-2xl afacad"
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: "0%" }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ ease: easeOut, duration: 0.8, delay: 0.2 }}
    >
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div
          className="w-full max-w-[60vw] p-10 rounded-2xl shadow-2xl border-r-8 border-b-8 border-black bg-gradient-to-b from-[#010027] via-[#13184E] to-[#3142B4] max-h-[95vh] overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#CF3D00] [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-color:#CF3D00] overflow-x-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src="/vector7.svg"
            alt=""
            width={230}
            height={230}
            className="relative -top-10 -left-[2.4rem] scale-x-[-1]"
          />
          <Image
            src="/final-logo.webp"
            alt="Hackulus Logo"
            width={200}
            height={200}
            className="mx-auto relative -top-24 -mb-16"
          />
          <div className="text-center mb-6">
            <h1 className="text-6xl !font-extrabold text-white mb-2">
              {trackData.name}
            </h1>
            <p className="text-white text-2xl mb-3">
              Here&apos;s a little something about {trackData.name}
            </p>
            <p className="text-white text-lg">{trackData.description}</p>
            <div className="w-full max-w-3xl mx-auto mt-8">
              <Accordion type="multiple" className="w-full">
                {trackData.problem_statements.map((ps, index) => (
                  <AccordionItem
                    value={`item-${index}`}
                    key={index}
                    className="bg-black/20 border-b-4 border-r-4 border-black rounded-lg mb-2 px-4"
                  >
                    <AccordionTrigger className="text-white text-xl hover:no-underline">
                      {ps.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-white text-lg text-left border-t border-white pt-2.5">
                      {ps.info}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
          <Image
            src="/vector14.svg"
            alt=""
            width={800}
            height={400}
            className="relative -bottom-10 -right-5"
          />
        </div>
      </div>
    </motion.div>
  );
}
