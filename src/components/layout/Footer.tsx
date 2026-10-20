import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "../ui/Container";
import { Mail, ArrowUpRight, Phone } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../ui/Icons";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#030304] text-slate-400 py-6 md:py-8">
      <Container size="lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 pb-6 md:pb-7 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold text-white text-xs shadow-[0_0_12px_rgba(229,9,20,0.4)]">
                MK
              </div>
              <span className="font-semibold text-sm sm:text-base text-white" suppressHydrationWarning>
                {siteConfig.author}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              Aspiring Full Stack Web Developer dedicated to building responsive, modern web applications and scalable solutions.
            </p>
          </div>

          {/* Scaffolding Navigation Links */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              Navigation
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-red-400 transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:text-red-400 py-0.5"
                  >
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="/api/resume/download"
                  download
                  className="hover:text-red-400 text-slate-300 font-medium transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:text-red-400 py-0.5"
                >
                  <span>Resume (PDF)</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              Connect
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>
                <a
                  href={`tel:${siteConfig.links.phone || "+917014162252"}`}
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:text-red-400 py-0.5"
                  aria-label="Call Manish Kumar"
                >
                  <Phone className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                  <span>+91 7014162252</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:text-red-400 py-0.5"
                  aria-label="Manish Kumar's GitHub profile"
                >
                  <GithubIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>GitHub</span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-slate-500" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:text-red-400 py-0.5"
                  aria-label="Manish Kumar's LinkedIn profile"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-slate-500" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.links.email}`}
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:text-red-400 py-0.5"
                  aria-label="Send email to Manish Kumar"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Email</span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-slate-500" aria-hidden="true" />
                </a>
              </li>
              {siteConfig.links.leetcode && (
                <li>
                  <a
                    href={siteConfig.links.leetcode}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-400 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:text-red-400 py-0.5"
                    aria-label="Manish Kumar's LeetCode profile"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">LC</span>
                    <span>LeetCode</span>
                    <ArrowUpRight className="w-2.5 h-2.5 text-slate-500" aria-hidden="true" />
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 md:pt-5 flex items-center justify-center text-center text-xs text-slate-400">
          <p>© {currentYear} {siteConfig.author}. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
