"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import React, { useCallback, useEffect, useRef } from "react";

interface VideoTimelineProps {
  currentFrame: number;
  durationInFrames: number;
  fps: number;
  isPlaying: boolean;
  onSeek: (frame: number) => void;
  onPlayPause: () => void;
}

function formatTimecode(frame: number, fps: number): string {
  if (fps <= 0) return "00:00:00";
  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const f = frame % fps;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  currentFrame,
  durationInFrames,
  fps,
  isPlaying,
  onSeek,
  onPlayPause,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getFrameFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return Math.round((x / rect.width) * Math.max(durationInFrames - 1, 0));
    },
    [durationInFrames],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      onSeek(getFrameFromClientX(e.clientX));
    },
    [getFrameFromClientX, onSeek],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      onSeek(getFrameFromClientX(e.clientX));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [getFrameFromClientX, onSeek]);

  // Space bar to play/pause
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        onPlayPause();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onPlayPause]);

  const progress =
    durationInFrames > 1 ? currentFrame / (durationInFrames - 1) : 0;
  const totalDurationSec = durationInFrames / Math.max(fps, 1);

  // Compute tick interval in seconds
  const tickIntervalSec =
    totalDurationSec <= 5
      ? 0.5
      : totalDurationSec <= 15
        ? 1
        : totalDurationSec <= 30
          ? 2
          : totalDurationSec <= 60
            ? 5
            : totalDurationSec <= 300
              ? 30
              : 60;

  const ticks: Array<{ frame: number; label: string; isMajor: boolean }> = [];
  let t = 0;
  while (t <= totalDurationSec + 0.001 && ticks.length < 200) {
    const frame = Math.round(t * fps);
    if (frame <= durationInFrames) {
      const sec = Math.round(t);
      const isMajor = sec % (tickIntervalSec >= 1 ? tickIntervalSec : 1) === 0;
      const label =
        sec >= 60
          ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`
          : `${sec}s`;
      ticks.push({ frame, label: isMajor ? label : "", isMajor });
    }
    t = Math.round((t + tickIntervalSec) * 1000) / 1000;
  }

  return (
    <div className="shrink-0 flex flex-col gap-2 px-4 py-3 bg-[#0d0d0d] border-t border-white/[0.06] select-none">
      {/* Ruler + scrubber */}
      <div
        ref={trackRef}
        className="relative h-9 cursor-col-resize"
        onMouseDown={handleMouseDown}
      >
        {/* Tick labels row */}
        <div className="absolute inset-x-0 top-0 h-3.5 pointer-events-none overflow-hidden">
          {ticks
            .filter((t) => t.label)
            .map(({ frame, label }) => {
              const pos =
                durationInFrames > 1
                  ? (frame / (durationInFrames - 1)) * 100
                  : 0;
              return (
                <span
                  key={frame}
                  className="absolute text-[9px] font-mono text-white/25 leading-none"
                  style={{
                    left: `${pos}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {label}
                </span>
              );
            })}
        </div>

        {/* Track groove */}
        <div className="absolute inset-x-0 top-[18px] h-[5px] bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/40 rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Tick marks */}
        <div className="absolute inset-x-0 top-[23px] pointer-events-none">
          {ticks.map(({ frame, isMajor }) => {
            const pos =
              durationInFrames > 1
                ? (frame / (durationInFrames - 1)) * 100
                : 0;
            return (
              <div
                key={frame}
                className={`absolute w-px ${isMajor ? "h-2.5 bg-white/20" : "h-1.5 bg-white/10"}`}
                style={{ left: `${pos}%` }}
              />
            );
          })}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none z-10"
          style={{
            left: `${progress * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          {/* Triangle head */}
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-primary mt-[14px]" />
          {/* Stem */}
          <div className="w-px flex-1 bg-primary/70" />
        </div>
      </div>

      {/* Transport controls row */}
      <div className="flex items-center gap-2">
        {/* Skip to start */}
        <button
          onClick={() => onSeek(0)}
          title="Torna all'inizio"
          className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
        >
          <SkipBack className="w-3 h-3" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={onPlayPause}
          title={isPlaying ? "Pausa (Space)" : "Play (Space)"}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        {/* Skip to end */}
        <button
          onClick={() => onSeek(Math.max(durationInFrames - 1, 0))}
          title="Vai alla fine"
          className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
        >
          <SkipForward className="w-3 h-3" />
        </button>

        {/* Timecode */}
        <span className="ml-2 text-[11px] font-mono text-white/40 tabular-nums">
          {formatTimecode(currentFrame, fps)}
          <span className="opacity-40 mx-1.5">/</span>
          {formatTimecode(Math.max(durationInFrames - 1, 0), fps)}
        </span>

        {/* Frame counter */}
        <span className="ml-auto text-[10px] font-mono text-white/20 tabular-nums">
          {currentFrame}&nbsp;f
        </span>
      </div>
    </div>
  );
};
