import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  FileText,
  AlertCircle
} from "lucide-react";

export default function DocumentViewerModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  recordType,
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !fileUrl) return null;

  const isPdf =
    fileUrl?.toLowerCase().endsWith(".pdf") ||
    fileName?.toLowerCase().endsWith(".pdf");

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-ink/65 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-cream border border-stone-line rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-line flex items-center justify-between bg-cream-light/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center text-forest">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-stone uppercase block">
                  {recordType || "Medical Document"}
                </span>
                <h2 className="text-base font-medium text-ink tracking-tight truncate max-w-md">
                  {fileName || "Document View"}
                </h2>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {!isPdf && (
                <div className="flex items-center gap-1 border border-stone-line rounded-lg px-2 py-1 bg-cream">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 rounded hover:bg-stone/15 text-ink transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1 min-w-[36px] text-center text-stone">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 rounded hover:bg-stone/15 text-ink transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-1 rounded hover:bg-stone/15 text-ink transition-colors cursor-pointer ml-1"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[10px] font-mono uppercase text-stone hover:text-ink px-1 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}

              <a
                href={fileUrl}
                download={fileName || "document"}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border border-stone-line hover:bg-stone/10 text-stone hover:text-ink transition-colors cursor-pointer"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg border border-stone-line hover:bg-stone/10 text-stone hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewport Canvas */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone/5 relative">
            {isPdf ? (
              <iframe
                src={fileUrl}
                title="Medical PDF Viewer"
                className="w-full h-full rounded-xl border border-stone-line bg-white"
              />
            ) : (
              <div className="transition-transform duration-200 flex items-center justify-center">
                <img
                  src={fileUrl}
                  alt={fileName || "Medical Document"}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    maxHeight: "75vh",
                  }}
                  className="rounded-xl shadow-lg border border-stone-line max-w-full object-contain select-none"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
