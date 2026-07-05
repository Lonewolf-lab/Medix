import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/#%&";

/**
 * Text-scramble (decode) effect: while `active`, letters shuffle through
 * random characters and settle left-to-right into the real text.
 */
export default function ScrambleText({ text, active, className = "" }) {
  const [display, setDisplay] = useState(text);
  const interval = useRef(null);

  useEffect(() => {
    clearInterval(interval.current);

    if (!active) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    interval.current = setInterval(() => {
      frame++;
      // Reveal ~1.5 letters per tick; the rest keep shuffling.
      const reveal = Math.floor(frame * 1.5);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") {
          out += " ";
        } else if (i < reveal) {
          out += ch;
        } else {
          out += CHARS[(Math.random() * CHARS.length) | 0];
        }
      }
      setDisplay(out);
      if (reveal >= text.length) {
        clearInterval(interval.current);
        setDisplay(text);
      }
    }, 30);

    return () => clearInterval(interval.current);
  }, [active, text]);

  return <span className={className}>{display}</span>;
}
