/**
 * Global Site Configuration
 * Centralized site metadata, navigation structure, and feature slots.
 */

export interface NavItem {
  name: string;
  href: string;
  description?: string;
  badge?: string;
}

export interface SiteConfig {
  name: string;
  author: string;
  fullName?: string;
  role: string;
  description: string;
  url: string;
  ogImage?: string;
  links: {
    github: string;
    linkedin: string;
    twitter?: string;
    leetcode?: string;
    email: string;
    phone?: string;
    phoneRaw?: string;
  };
  navigation: NavItem[];
  mediaSlots: {
    /**
     * Clean slot for intro video path or URL.
     * Set to null until Manish provides the actual intro video asset.
     */
    introVideoUrl: string | null;
    introVideoPoster: string | null;
  };
  features: {
    enableSupabaseBackend: boolean;
    enableCinematicIntro: boolean;
  };
}

export const siteConfig: SiteConfig = {
  name: "Manish Kumar Prajapat | Aspiring Full Stack Web Developer",
  author: "Manish Kumar",
  fullName: "Manish Kumar Prajapat",
  role: "Aspiring Full Stack Web Developer",
  description:
    "Personal developer portfolio of Manish Kumar Prajapat. Aspiring Full Stack Web Developer and Computer Science student at ICFAI University Jaipur crafting responsive, user-friendly, and scalable web solutions.",
  url: "https://manishkumar.dev",
  links: {
    github: "https://github.com/Manishkumar4652",
    linkedin: "https://www.linkedin.com/in/manish-prajapat-915870392",
    leetcode: "https://leetcode.com/u/Manish_kumar4774",
    email: "manish2750797@gmail.com",
    phone: "+91 7014162252",
    phoneRaw: "7014162252",
  },
  navigation: [
    { name: "Home", href: "/" },
    { name: "About", href: "/about", description: "Background & technical philosophy" },
    { name: "Skills", href: "/skills", description: "Technical competencies & engineering stack" },
    { name: "Projects", href: "/projects", description: "Engineered web & AI applications" },
    { name: "Certificates", href: "/certificates", description: "Accreditations & verified coursework" },
    { name: "Education", href: "/education", description: "Academic journey & fundamentals" },
    { name: "Experience", href: "/experience", description: "Practical work, contributions & milestones" },
    { name: "Contact", href: "/contact", description: "Get in touch for collaboration" },
  ],
  mediaSlots: {
    // Configurable slot for media assets
    introVideoUrl: null,
    introVideoPoster: null,
  },
  features: {
    enableSupabaseBackend: false, // Planned for subsequent phase
    enableCinematicIntro: false,  // Planned for Phase 2
  },
};
