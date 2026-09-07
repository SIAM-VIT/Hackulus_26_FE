"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useWindowSize } from "../utils/useWindowSize";

const SplashScreen = () => {
  const [showCircle, setShowCircle] = useState(false);
  const [showElements, setShowElements] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showText, setShowText] = useState(false);
  const [startSpinning, setStartSpinning] = useState(false);
  const [startExitSequence, setStartExitSequence] = useState(false);
  const [startPageFadeOut, setStartPageFadeOut] = useState(false);

  const { width } = useWindowSize();
  const isMobile = width < 768;

  const radius = isMobile ? 140 : 300;
  const elementSize = isMobile ? 110 : 200;
  const elementCount = isMobile ? 12 : 16;

  const elements = useMemo(() => {
    return Array.from({ length: elementCount }, (_, i) => {
      const angle = -90 + (i * 360) / elementCount;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      return { x, y, angle, delay: i * 0.055 };
    });
  }, [radius, elementCount]);

  const pageVariants = {
    visible: { opacity: 1, backgroundColor: "#000000" },
    whiteBg: { backgroundColor: "#FFFFFF" },
    exit: { opacity: 0, backgroundColor: "#FFFFFF" },
  };

  const hackulus = "HACKULUS".split("");

  useEffect(() => {
    const totalDuration = 7500;
    const childExitDuration = 2500;
    const timer0 = setTimeout(() => setShowCircle(true), 400);
    const timer1 = setTimeout(() => setShowElements(true), 700);
    const timer2 = setTimeout(() => setShowBadge(true), 2000);
    const timer3 = setTimeout(() => setShowText(true), 2700);
    const timer4 = setTimeout(() => setStartSpinning(true), 3500);
    const timer5 = setTimeout(() => setStartExitSequence(true), totalDuration);
    const timer6 = setTimeout(
      () => setStartPageFadeOut(true),
      totalDuration + childExitDuration
    );

    return () => {
      clearTimeout(timer0);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      variants={pageVariants}
      animate={
        startPageFadeOut ? "exit" : startExitSequence ? "whiteBg" : "visible"
      }
      transition={{
        duration: 0.7,
        ease: "easeInOut",
        backgroundColor: {
          duration: 2.5,
          ease: "linear",
        },
      }}
    >
      <div className="relative w-[340px] h-[340px] md:w-[600px] md:h-[600px] flex items-center justify-center">
        <motion.div
          className="absolute rounded-full border-white border-[65px] md:border-[110px] w-[350px] h-[350px] md:w-[720px] md:h-[720px]"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={
            startExitSequence
              ? { scale: 0.7, opacity: 0 }
              : showCircle
              ? { scale: 1, opacity: 1 }
              : { scale: 0.7, opacity: 0 }
          }
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100,
            delay: startExitSequence ? 0.4 : 0.15,
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={
            startSpinning ? { rotate: 360 * 10 } : { rotate: 0 }
          }
          transition={
            startSpinning ? { duration: 6.5, ease: [0.5, 0, 1, 0.5] } : {}
          }
        >
          {elements.map((element, index) => (
            <motion.div
              key={index}
              className="absolute w-20 h-20 md:w-32 md:h-32"
              style={{
                x: element.x,
                y: element.y,
                rotate: element.angle + 66,
                transformOrigin: "center",
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={
                startExitSequence
                  ? { opacity: 0 }
                  : showElements
                  ? { scale: 1 }
                  : { scale: 0 }
              }
              transition={{
                type: "spring",
                damping: 12,
                stiffness: 150,
                delay: startExitSequence ? element.delay : element.delay,
              }}
            >
              <Image
                src="/group-47.webp"
                alt="Logo element"
                width={elementSize}
                height={elementSize}
                className="w-full h-full object-contain"
              />
            </motion.div>
          ))}
        </motion.div>

        {showBadge && (
          <motion.div
            className="flex items-center justify-center absolute z-10 bg-white border-[14px] border-[#0B2846] rounded-lg p-2 md:p-1 md:w-[120%] md:h-[35%] w-[107%] h-[40%]"
            initial={{ scale: 0, opacity: 0 }}
            animate={
              startExitSequence
                ? { scale: 0, opacity: 0 }
                : { scale: 1, opacity: 1 }
            }
            transition={{
              type: "spring",
              damping: 16,
              stiffness: 180,
              delay: startExitSequence ? 0.7 : 0.2,
            }}
          >
            <div className="flex items-center justify-center">
              {hackulus.map((letter, index) => (
                <motion.span
                  key={index}
                  className="bebas-neue text-[6.25rem] md:text-[13rem] font-bold text-[#0B2846] inline-block"
                  initial={{ opacity: 0, x: 20 }}
                  animate={
                    startExitSequence
                      ? { opacity: 0, x: 20 }
                      : showText
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -20 }
                  }
                  transition={{
                    type: "spring",
                    damping: 12,
                    stiffness: 200,
                    delay: startExitSequence
                      ? (hackulus.length - 1 - index) * 0.05
                      : index * 0.065,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SplashScreen;
