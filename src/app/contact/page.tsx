import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { ArrowLeft, Mail, ArrowUpRight, Sparkles, Phone, MessageCircle } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/Icons";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Connect with Manish Kumar for web development projects, internships, and collaborations.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Contact | ${siteConfig.author}`,
    description: "Connect with Manish Kumar for web development projects, internships, and collaborations.",
    url: `${siteConfig.url}/contact`,
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="pb-8 sm:pb-12">
      <Section
        id="contact"
        titleAs="h1"
        containerSize="lg"
        title="Get in Touch"
        description="Have a web development project, an internship opportunity, or an engineering inquiry? Reach out directly via phone, WhatsApp, email, or verified profiles."
      >
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Homepage</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
          {/* Direct Phone & WhatsApp Card */}
          <div className="p-6 rounded-2xl glass-card-elevated flex flex-col justify-between border border-white/10 hover:border-red-600/30 transition-all">
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4">
                <Phone className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-white">Call / WhatsApp</h2>
              <p className="mt-2 text-sm text-slate-200 font-semibold font-mono tracking-wide">
                +91 7014162252
              </p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Available for direct calls, recruiters, and quick chat on WhatsApp.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <Button
                href="tel:+917014162252"
                variant="primary"
                size="sm"
                className="flex-1 justify-center"
              >
                <Phone className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>Call</span>
              </Button>
              <Button
                href="https://wa.me/917014162252?text=Hello%20Manish%2C%20I%20saw%20your%20portfolio!"
                external
                variant="secondary"
                size="sm"
                className="flex-1 justify-center text-emerald-400 hover:text-emerald-300 border-emerald-500/20 hover:border-emerald-500/40"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>WhatsApp</span>
              </Button>
            </div>
          </div>

          {/* Direct Email Card */}
          <div className="p-6 rounded-2xl glass-card-elevated flex flex-col justify-between border border-white/10 hover:border-red-600/30 transition-all">
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-white">Direct Email</h2>
              <p className="mt-2 text-sm text-slate-200 font-semibold font-mono break-all">
                {siteConfig.links.email}
              </p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Direct inbox for formal communications, proposals, and project briefs.
              </p>
            </div>
            <div className="mt-6">
              <Button
                href={`mailto:${siteConfig.links.email}`}
                variant="secondary"
                size="sm"
                className="w-full justify-center"
              >
                <Mail className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>Send Email</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* LinkedIn Card */}
          <div className="p-6 rounded-2xl glass-card-elevated flex flex-col justify-between border border-white/10 hover:border-red-600/30 transition-all">
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4">
                <LinkedinIcon className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-white">LinkedIn</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Connect professionally for internships, software engineering roles, and networking.
              </p>
            </div>
            <div className="mt-6">
              <Button
                href={siteConfig.links.linkedin}
                external
                variant="secondary"
                size="sm"
                className="w-full justify-center"
              >
                <span>Connect</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* GitHub Card */}
          <div className="p-6 rounded-2xl glass-card-elevated flex flex-col justify-between border border-white/10 hover:border-red-600/30 transition-all">
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 mb-4">
                <GithubIcon className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-white">GitHub</h2>
              <p className="mt-2 text-sm text-slate-200 font-semibold font-mono">
                Manishkumar4652
              </p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Explore open-source repositories, commit activity, and project codebases.
              </p>
            </div>
            <div className="mt-6">
              <Button
                href={siteConfig.links.github}
                external
                variant="secondary"
                size="sm"
                className="w-full justify-center"
              >
                <span>Visit GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* LeetCode Card */}
          <div className="p-6 rounded-2xl glass-card-elevated flex flex-col justify-between border border-white/10 hover:border-red-600/30 transition-all">
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-600/30 flex items-center justify-center text-amber-500 mb-4">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-white">LeetCode</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                350+ Algorithmic & Data Structures problems solved with verified performance stats.
              </p>
            </div>
            <div className="mt-6">
              {siteConfig.links.leetcode && (
                <Button
                  href={siteConfig.links.leetcode}
                  external
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                >
                  <span>View LeetCode</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
