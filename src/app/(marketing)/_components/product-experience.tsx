"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  BotIcon,
  CalendarPlusIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FileTextIcon,
  Layers3Icon,
  MessageSquareTextIcon,
  PanelTopIcon,
  SparklesIcon,
  Users2Icon,
  ZapIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

const executionFeatures = [
  {
    icon: Layers3Icon,
    eyebrow: "Unified command center",
    title: "Everything in one place",
    desc: "Rooms, meetings, workspace, decisions, tasks, and presence all live in a single execution layer instead of scattered tabs.",
    image: "/0.svg",
    accent: "from-emerald-300 via-cyan-300 to-sky-400",
  },
  {
    icon: CalendarPlusIcon,
    eyebrow: "Instant meeting setup",
    title: "Create meetings instantly",
    desc: "Spin up a meeting, attach context, invite the right people, and let the AI agent prepare the room before the first word is spoken.",
    image: "/1.svg",
    accent: "from-sky-300 via-indigo-300 to-violet-400",
  },
  {
    icon: Clock3Icon,
    eyebrow: "Always searchable",
    title: "Track all meetings",
    desc: "Upcoming, active, missed, and completed conversations become a living system of record your team can trust.",
    image: "/2.svg",
    accent: "from-amber-200 via-orange-300 to-rose-400",
  },
  {
    icon: BotIcon,
    eyebrow: "AI operating layer",
    title: "AI summaries & automation",
    desc: "NeexMeet captures transcripts, extracts key decisions, and turns scattered discussion into useful summaries automatically.",
    image: "/3.svg",
    accent: "from-lime-200 via-emerald-300 to-teal-400",
  },
  {
    icon: Users2Icon,
    eyebrow: "Shared momentum",
    title: "Team collaboration",
    desc: "Dedicated rooms keep people, documents, meetings, and follow-ups aligned so project context does not disappear after the call.",
    image: "/4.svg",
    accent: "from-fuchsia-300 via-pink-300 to-rose-400",
  },
  {
    icon: MessageSquareTextIcon,
    eyebrow: "Decisions with context",
    title: "Meetings + tasks + decisions",
    desc: "Every decision is connected to the conversation that created it, the tasks it unlocked, and the people accountable for next steps.",
    image: "/5.svg",
    accent: "from-cyan-200 via-blue-300 to-indigo-400",
  },
  {
    icon: CheckCircle2Icon,
    eyebrow: "Execution visibility",
    title: "Tasks & execution",
    desc: "Action items land in the workspace with ownership, status, and visibility, making follow-through part of the workflow by default.",
    image: "/6.svg",
    accent: "from-emerald-300 via-green-300 to-lime-300",
  },
];

const railCards = [
  {
    icon: PanelTopIcon,
    title: "Live workspace",
    desc: "A single operating view for tasks, decisions, docs, rooms, and meetings.",
  },
  {
    icon: SparklesIcon,
    title: "AI extraction",
    desc: "Summaries, next steps, blockers, and decisions generated from each call.",
  },
  {
    icon: Users2Icon,
    title: "Room memory",
    desc: "Persistent project spaces keep conversation history and team context together.",
  },
  {
    icon: Clock3Icon,
    title: "Meeting timeline",
    desc: "Track scheduled, active, completed, and missed meetings without manual upkeep.",
  },
  {
    icon: FileTextIcon,
    title: "Decision log",
    desc: "Turn spoken commitments into durable records everyone can revisit.",
  },
  {
    icon: ZapIcon,
    title: "Execution loop",
    desc: "Move from discussion to ownership to completion without the follow-up scramble.",
  },
];

export const ProductExperience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [36, -36]);
  const haloX = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextStep = Math.min(
      executionFeatures.length - 1,
      Math.max(0, Math.floor(latest * executionFeatures.length))
    );

    setActiveStep((current) => (current === nextStep ? current : nextStep));
  });

  const activeFeature = executionFeatures[activeStep];

  return (
    <>
      <section
        id="features"
        ref={containerRef}
        className="relative h-[520vh] overflow-clip border-y border-white/10 bg-[#070b12] text-white"
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-30 blur-3xl",
                activeFeature.accent
              )}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.16),transparent_30%),linear-gradient(to_bottom,rgba(7,11,18,0.3),#070b12_90%)]" />

          <motion.div
            style={{ x: haloX }}
            className="absolute right-[-12rem] top-20 h-[34rem] w-[34rem] rounded-full border border-white/10 bg-white/5 blur-2xl"
          />

          <div className="container relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="mb-8 max-w-2xl"
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
                  Feature flow
                </p>
                <h2 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  The meeting-to-execution system.
                </h2>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.title}
                  initial={{ opacity: 0, x: -64 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 44 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-xl"
                >
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm font-medium text-white/75 shadow-2xl backdrop-blur-xl">
                    <activeFeature.icon className="size-4 text-emerald-200" />
                    {activeFeature.eyebrow}
                  </div>
                  <h3 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                    {activeFeature.title}
                  </h3>
                  <p className="mt-5 text-lg leading-8 text-white/68">
                    {activeFeature.desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-7 lg:hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeFeature.image}-mobile`}
                    initial={{ opacity: 0, x: 42, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -30, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="relative mx-auto max-w-[520px] rounded-lg border border-white/14 bg-white/[0.06] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl"
                  >
                    <Image
                      src={activeFeature.image}
                      alt={`${activeFeature.title} UI preview`}
                      width={720}
                      height={520}
                      className="h-auto max-h-[230px] w-full rounded-md object-contain"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-6 flex justify-center gap-2 lg:hidden">
                {executionFeatures.map((feature, index) => (
                  <button
                    key={feature.title}
                    type="button"
                    aria-label={`Show ${feature.title}`}
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === activeStep ? "w-8 bg-emerald-300" : "w-2 bg-white/28"
                    )}
                  />
                ))}
              </div>

              <div className="mt-10 hidden gap-3 lg:grid">
                {executionFeatures.map((feature, index) => {
                  const isActive = index === activeStep;

                  return (
                    <button
                      key={feature.title}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-300",
                        isActive
                          ? "border-white/18 bg-white/12 shadow-[0_18px_60px_rgba(0,0,0,0.26)]"
                          : "border-white/8 bg-white/[0.03] text-white/45 hover:border-white/16 hover:bg-white/[0.07] hover:text-white/80"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-all duration-300",
                          isActive ? "w-7 bg-emerald-300" : "bg-white/28"
                        )}
                      />
                      <span className="text-sm font-semibold">{feature.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div
              style={{ y: imageY }}
              className="relative hidden min-h-[620px] items-center justify-center lg:flex"
            >
              <div className="absolute inset-10 rounded-[2rem] bg-white/[0.04] blur-3xl" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.image}
                  initial={{ opacity: 0, x: 86, scale: 0.96, rotateY: -4 }}
                  animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, x: -54, scale: 0.98, rotateY: 3 }}
                  transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full max-w-[740px] rounded-[1.5rem] border border-white/14 bg-white/[0.06] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.46)] backdrop-blur-2xl"
                >
                  <div className="absolute -inset-px rounded-[1.5rem] bg-gradient-to-br from-white/24 via-transparent to-transparent opacity-70" />
                  <div className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#0a101a]">
                    <Image
                      src={activeFeature.image}
                      alt={`${activeFeature.title} UI preview`}
                      width={900}
                      height={650}
                      className="h-auto w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-[1.025]"
                      priority={activeStep === 0}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/10" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#070b12_0%,#f7faf9_42%,#ffffff_100%)] py-24 md:py-32"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-12 max-w-3xl text-white md:mb-16"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
              Sliding feature experience
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">
              Smooth workflows, not more dashboards.
            </h2>
          </motion.div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {railCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.015 }}
                className="group min-h-[340px] w-[82vw] shrink-0 snap-center rounded-lg border border-white/35 bg-white/55 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-colors duration-300 hover:bg-white/72 sm:w-[420px]"
              >
                <div className="mb-16 flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-400/10 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.18)] transition-transform duration-300 group-hover:scale-110">
                    <card.icon className="size-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-400">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">
                  {card.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {card.desc}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
