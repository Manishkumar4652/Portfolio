"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const INTRO_STORAGE_KEY = "mk_intro_viewed_session";

export function IntroSplash() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  const endIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
    } catch {
      // Ignore storage restrictions
    }
    setIsFading((fading) => {
      if (fading) return fading;
      document.body.style.overflow = "";
      // 700ms smooth cinematic dissolve before removing from DOM
      setTimeout(() => {
        setIsVisible(false);
      }, 700);
      return true;
    });
  }, []);

  useEffect(() => {
    // If intro has already been shown in this session, do not run again and ensure scroll is free
    try {
      if (sessionStorage.getItem(INTRO_STORAGE_KEY) === "true") {
        document.body.style.overflow = "";
        return;
      }
    } catch {
      document.body.style.overflow = "";
      return;
    }

    // First visit in session: show intro and temporarily lock body scroll during playback
    setIsVisible(true);
    document.body.style.overflow = "hidden";

    // Detect device and play active video
    const isMobile = window.innerWidth < 640;
    const activeVideo = isMobile ? mobileVideoRef.current : desktopVideoRef.current;

    if (activeVideo) {
      activeVideo.currentTime = 0;
      activeVideo.play().catch(() => {
        // If autoplay is blocked by browser policy, dismiss immediately
        endIntro();
      });
    }

    // 6.2s safeguard timer ensuring intro never blocks page interaction
    const timer = setTimeout(() => {
      endIntro();
    }, 6200);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [endIntro]);

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
