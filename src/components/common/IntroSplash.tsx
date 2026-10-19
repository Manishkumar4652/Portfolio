"use client";

import React, { useState, useEffect, useRef } from "react";

export function IntroSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Lock body scroll during intro animation so page cannot be scrolled behind video
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Detect device and ensure video plays
    const isMobile = window.innerWidth < 640;
    const activeVideo = isMobile ? mobileVideoRef.current : desktopVideoRef.current;

    if (activeVideo) {
      activeVideo.currentTime = 0;
      activeVideo.play().catch(() => {
        // Handled by HTML autoPlay muted playsInline
      });
    }

    // 6.2s safeguard timer ensuring full 5.48s video completes and never blocks
    const timer = setTimeout(() => {
      endIntro();
    }, 6200);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const endIntro = () => {
    if (isFading) return;
    setIsFading(true);
    document.body.style.overflow = "unset";

    // 700ms smooth cinematic dissolve before removing from DOM
    setTimeout(() => {
      setIsVisible(false);
    }, 700);
  };

  if (!isVisible) return null;

  return (
    <div
      id="mk-intro-splash"
      suppressHydrationWarning
      className={`fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-out select-none pointer-events-none ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Desktop Video (Screen width >= 640px) */}
      <video
        ref={desktopVideoRef}
        src="/videos/intro-desktop.mp4"
        className="hidden sm:block w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={endIntro}
      />

      {/* Mobile Video (Screen width < 640px) */}
      <video
        ref={mobileVideoRef}
        src="/videos/intro-mobile.mp4"
        className="block sm:hidden w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={endIntro}
      />
    </div>
  );
}
