import React, { useMemo } from "react";
import { personalData, type SkillCategory } from "@/data/personal";
import { Section } from "@/components/ui/Section";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Code2, Server, BrainCircuit, Layers, Check, ArrowRight, Sparkles } from "lucide-react";
import type { SkillItem } from "@/lib/mongodb/types";

interface SkillsSectionProps {
  initialSkills?: SkillItem[];
}

export function SkillsSection({ initialSkills }: SkillsSectionProps) {
  const categoryIcons: Record<string, React.ElementType> = {
    "Programming Languages": Code2,
    "Core Concepts": BrainCircuit,
    "Web Technologies": Layers,
    "Tools & Platforms": Server,
    "Languages & Core": Code2,
    "Frontend Engineering": Layers,
    "Backend & Databases": Server,
    "AI & APIs Exploration": BrainCircuit,
  };

  const categoryDescriptions: Record<string, string> = {
    "Programming Languages": "Core programming languages (C, C++, Python) for software development and computational logic.",
    "Core Concepts": "Data structures and algorithms, analytical problem-solving, and strategic decision-making.",
    "Web Technologies": "Web technologies including HTML, CSS, Javascript, Bootstrap, and Node.js.",
    "Tools & Platforms": "Development workflows, version control, modern IDEs, and tools (Git, GitHub, VS code, Antigravity).",
    "Languages & Core": "Core programming languages, algorithmic problem-solving, and clean code paradigms.",
    "Frontend Engineering": "Modern component frameworks, declarative UI state, and fluid responsive styling.",
    "Backend & Databases": "RESTful endpoints, document schemas, server runtimes, and version control.",
    "AI & APIs Exploration": "Applied LLM APIs, prompt engineering, and intelligent application workflows.",
  };

  const categories = useMemo<SkillCategory[]>(() => {
    if (!initialSkills || initialSkills.length === 0) {
      return personalData.skills;
    }

    const map = new Map<string, string[]>();
    for (const item of initialSkills) {
      const cat = item.category || "General";
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(item.name);
    }

    return Array.from(map.entries()).map(([title, skills]) => ({
      title,
      skills,
    }));
  }, [initialSkills]);

  return (
    <Section
      id="skills"
      containerSize="lg"
      title="Engineering Capabilities & Tooling"
      description="Languages, frameworks, and architectures actively leveraged across Manish Kumar's projects and coursework."
      className="border-t border-white/[0.08]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, idx) => {
          const IconComponent = categoryIcons[category.title] || Code2;
          const desc = categoryDescriptions[category.title] || "Core engineering technologies.";

          return (
            <ScrollReveal key={category.title} delay={idx * 100}>
              <div className="p-6 rounded-2xl glass-card-elevated border border-white/10 hover:border-red-600/35 transition-all duration-300 flex flex-col justify-between h-full group">
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(229,9,20,0.2)]">
                      <IconComponent className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <Badge variant="charcoal">
                      {category.skills.length} Skills
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                    {category.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {desc}
                  </p>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0a0b0d] border border-white/[0.08] text-xs font-medium text-slate-300 hover:border-red-600/40 hover:text-white transition-all"
                      >
                        <Check className="w-3 h-3 text-red-500 shrink-0" aria-hidden="true" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Verified Stack</span>
                  <span className="text-red-400">Active Practice</span>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Explore full Skills directory CTA */}
      <div className="mt-10 p-6 rounded-2xl glass-card-elevated border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Want to see proficiency levels & full toolchain?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore the dedicated Skills directory with search, proficiency indicators, and category filters.
            </p>
          </div>
        </div>

        <Button
          href="/skills"
          variant="primary"
          size="md"
          className="shrink-0"
        >
          <span>View Detailed Skills Directory</span>
          <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
        </Button>
      </div>
    </Section>
  );
}
