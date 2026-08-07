import React from "react";
import { useServerStatusStore } from "@/store/serverStatusStore";
import { Loader2, Server } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ServerSpinUpOverlay() {
  const isServerSpinningUp = useServerStatusStore((state) => state.isServerSpinningUp);

  return (
    <AnimatePresence>
      {isServerSpinningUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-ink/80 backdrop-blur-md p-6 text-center select-none"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="max-w-md w-full bg-cream-light border border-stone-line/40 rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col items-center gap-6"
          >
            {/* Spinning Loader Circle */}
            <div className="relative flex items-center justify-center w-16 h-16">
              <Loader2 className="w-12 h-12 text-forest animate-spin stroke-[1.5]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Server className="w-5 h-5 text-forest/75 stroke-[1.5]" />
              </div>
            </div>

            {/* Informational Text */}
            <div className="space-y-3">
              <h2 className="font-display text-xl uppercase tracking-wider text-ink font-semibold">
                Starting Servers
              </h2>
              <p className="font-sans text-xs text-stone leading-relaxed">
                Render's free tier spins down databases and servers after inactivity. We are waking up your secure Medix health environment. This can take up to a minute.
              </p>
            </div>

            {/* Subtle Progress Bar loop */}
            <div className="w-full h-[3px] bg-stone-line/30 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut",
                }}
                className="absolute top-0 bottom-0 w-1/3 bg-forest rounded-full"
              />
            </div>

            <div className="text-[9px] font-mono-accent text-stone/60 uppercase tracking-[0.1em]">
              Connection status: Establishing handshake...
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
