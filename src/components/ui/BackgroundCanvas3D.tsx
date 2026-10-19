"use client";

import React, { useEffect, useRef } from "react";

/**
 * Global Video Background
 * Renders Background.mp4 vividly across all portfolio pages
 * with robust autoplay handling and a balanced dark overlay.
 */
export function BackgroundCanvas3D() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback retry if browser blocked initial autoplay attempt
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* High-visibility Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover object-bottom opacity-55 brightness-105 contrast-100"
      >
        <source src="/Background.mp4" type="video/mp4" />
      </video>

      {/* Balanced light atmospheric overlay to ensure video is clearly seen while maintaining text legibility */}
      <div className="absolute inset-0 bg-[#040405]/25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#040405]/50 via-transparent to-[#040405]/60 pointer-events-none" />
    </div>
  );
}
