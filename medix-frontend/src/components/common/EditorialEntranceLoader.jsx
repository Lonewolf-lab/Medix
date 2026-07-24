import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function EditorialEntranceLoader({ onComplete }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 45); // Takes ~4.5 seconds to reach 100% for a slower, deliberate experience

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (percent === 100) {
      const timeout = setTimeout(() => {
        if (onComplete) onComplete();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [percent, onComplete]);

  // Sequential healthcare/clinical status logs
  const getStatusMessage = (p) => {
    if (p < 25) return "RETRIEVING PATIENT PRESCRIPTIONS & DOSAGE DATA...";
    if (p < 50) return "ESTABLISHING SECURE ENCRYPTED HEALTH SPACE...";
    if (p < 75) return "COMPILING MEDICATION TIMINGS & REMINDERS...";
    if (p < 95) return "SYNCHRONIZING AI CLINICAL DIAGNOSTIC ENGINES...";
    return "CLINICAL PORTAL READY — SECURELY LAUNCHING";
  };

  // Framer motion variants
  const logoVariants = {
    initial: { scale: 0.8, rotate: -15, opacity: 0 },
    animate: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 80,
        delay: 0.15,
      },
    },
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    initial: { y: "115%", opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.95,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const letters = "MEDIX".split("");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.025,
        transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[9999] bg-cream flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Background Grid & Glowing EKG Heartbeat Path */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {/* Soft moving ambient backdrop glow blobs */}
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            x: [-15, 20, -15],
            y: [-20, 15, -20],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-forest/5 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: [20, -15, 20],
            y: [15, -20, 15],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-[10%] -right-[10%] w-[55%] h-[55%] bg-forest/5 rounded-full blur-[120px]"
        />

        <svg className="w-full h-full text-stone-line/15" viewBox="0 0 800 600" preserveAspectRatio="none">
          <defs>
            <pattern id="loader-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loader-grid)" />
          
          {/* Double Layer EKG heartbeat lines */}
          <path
            d="M -100,300 L 250,300 L 270,250 L 290,350 L 315,160 L 335,440 L 355,300 L 385,300 L 400,285 L 415,315 L 430,300 L 900,300"
            fill="none"
            stroke="#1b3b2b"
            strokeWidth="1.5"
            className="opacity-[0.04]"
          />

          <motion.path
            d="M -100,300 L 250,300 L 270,250 L 290,350 L 315,160 L 335,440 L 355,300 L 385,300 L 400,285 L 415,315 L 430,300 L 900,300"
            fill="none"
            stroke="#1b3b2b" // forest green
            strokeWidth="2.5"
            className="opacity-[0.14]"
            style={{ filter: "drop-shadow(0px 0px 10px rgba(27, 59, 43, 0.45))" }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4.5, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Top horizontal progress line */}
      <motion.div
        className="absolute top-0 left-0 h-[3.5px] bg-forest z-10"
        initial={{ width: "0%" }}
        animate={{ width: `${percent}%` }}
        transition={{ ease: "linear", duration: 0.05 }}
      />

      {/* Editorial Content Container */}
      <div className="relative z-10 text-center px-6 flex flex-col items-center max-w-2xl">
        
        {/* Independent Brand Logo with entrance animation (static after entry) */}
        <motion.div
          variants={logoVariants}
          initial="initial"
          animate="animate"
          className="w-16 h-16 sm:w-20 sm:h-20 mb-8 flex items-center justify-center filter drop-shadow-sm"
        >
          <img
            src="/medix_logo.png"
            alt="Medix logo"
            className="w-full h-full object-contain"
            draggable="false"
          />
        </motion.div>

        {/* Small Premium Sub-Caption */}
        <div className="overflow-hidden py-1 mb-2">
          <motion.span
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 0.85 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="font-mono-accent text-[9px] tracking-[0.45em] text-forest font-semibold uppercase block"
          >
            CLINICAL INTELLIGENCE PLATFORM
          </motion.span>
        </div>

        {/* Brand Name Reveal - Letter by Letter (Enlarged but plain ink-colored font) */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex justify-center select-none perspective-[1000px] mb-4"
        >
          {letters.map((letter, index) => (
            <span key={index} className="overflow-hidden inline-block py-2">
              <motion.span
                variants={letterVariants}
                className="font-display text-7xl sm:text-8xl md:text-9xl uppercase tracking-[0.16em] text-ink font-extrabold leading-none inline-block origin-bottom"
                style={{ textShadow: "0 4px 14px rgba(0,0,0,0.02)" }}
              >
                {letter}
              </motion.span>
            </span>
          ))}
        </motion.div>

        {/* Divider Line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.6, ease: "easeInOut" }}
          className="h-[1.5px] w-28 sm:w-40 bg-stone-line/60 my-4"
        />

        {/* Tagline Slogan Reveal with tracking expansion */}
        <motion.p
          initial={{ letterSpacing: "0.15em", opacity: 0 }}
          animate={{ letterSpacing: "0.42em", opacity: 1 }}
          transition={{ duration: 2.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono-accent text-[9px] sm:text-[10px] md:text-[11px] text-stone uppercase block leading-none font-medium"
        >
          YOUR AI CLINICAL COMPANION
        </motion.p>
      </div>

      {/* Bottom Percentage & Sequential Healthcare status logs */}
      <div className="absolute bottom-12 flex flex-col items-center gap-1.5 z-10 w-full text-center px-4">
        <div className="font-mono-accent text-[8px] sm:text-[9px] tracking-[0.25em] text-forest/75 uppercase animate-pulse">
          {getStatusMessage(percent)}
        </div>
        <div className="font-mono-accent text-[10px] tracking-[0.5em] text-stone/85 uppercase">
          SYS.INIT // {String(percent).padStart(3, "0")}%
        </div>
      </div>
    </motion.div>
  );
}
