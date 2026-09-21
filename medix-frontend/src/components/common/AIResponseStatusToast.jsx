import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";

/**
 * Editorial AI Response Status Toast.
 * Displays a subtle floating banner ONLY when an AI request takes longer than `delayMs` (default: 1200ms).
 * Fast requests finish with 0 UI flashing; longer requests trigger a smooth status popup.
 * Strictly enforces workspace guidelines: clean typography, functional icons, zero sparkles.
 */
export default function AIResponseStatusToast({
  active = false,
  message = "Analyzing clinical context & generating response...",
  delayMs = 1200,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (active) {
      // Only show popup if request takes longer than delayMs (e.g. 1.2 seconds)
      timer = setTimeout(() => {
        setVisible(true);
      }, delayMs);
    } else {
      setVisible(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [active, delayMs]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-ink/95 backdrop-blur-md text-cream-light border border-stone-line/20 rounded-xl px-4 py-3 shadow-2xl max-w-sm pointer-events-none"
        >
          <div className="w-7 h-7 rounded-lg bg-forest/20 flex items-center justify-center shrink-0">
            <Loader2 className="w-4 h-4 text-forest-bright animate-spin" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-xs font-semibold tracking-wide text-cream-light">
              AI Processing
            </span>
            <span className="font-sans text-[11px] text-stone leading-tight">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
