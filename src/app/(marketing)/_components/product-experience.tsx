"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import Tilt from "react-parallax-tilt";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const executionFeatures = [
  {
    icon: Layers3Icon,
    eyebrow: "Unified workspace",
    title: "One Workspace for Everything",
    desc: "Bring meetings, tasks, decisions, rooms, and presence into one clear place.",
    image: "/0.svg",
    accent: "from-emerald-300 via-cyan-300 to-sky-400",
  },
  {
    icon: CalendarPlusIcon,
    eyebrow: "Fast setup",
    title: "Start Meetings in Seconds",
    desc: "Create a meeting, add context, invite your team, and start with everything ready.",
    image: "/1.svg",
    accent: "from-sky-300 via-indigo-300 to-violet-400",
  },
  {
    icon: Clock3Icon,
    eyebrow: "Complete history",
    title: "Track Every Meeting",
    desc: "See upcoming, active, missed, and completed meetings in one reliable timeline.",
    image: "/2.svg",
    accent: "from-amber-200 via-orange-300 to-rose-400",
  },
  {
    icon: BotIcon,
    eyebrow: "AI capture",
    title: "AI That Captures Everything",
    desc: "Automatically generate summaries, tasks, and key decisions from every meeting.",
    image: "/3.svg",
    accent: "from-lime-200 via-emerald-300 to-teal-400",
  },
  {
    icon: Users2Icon,
    eyebrow: "Team alignment",
    title: "Work Together, Seamlessly",
    desc: "Keep people, meetings, documents, and follow-ups aligned inside dedicated team spaces.",
    image: "/4.svg",
    accent: "from-fuchsia-300 via-pink-300 to-rose-400",
  },
  {
    icon: MessageSquareTextIcon,
    eyebrow: "Connected outcomes",
    title: "Meetings, Tasks & Decisions — Unified",
    desc: "Connect every decision to the meeting, task, and owner behind it.",
    image: "/5.svg",
    accent: "from-cyan-200 via-blue-300 to-indigo-400",
  },
  {
    icon: CheckCircle2Icon,
    eyebrow: "Visible follow-through",
    title: "From Tasks to Execution",
    desc: "Turn action items into assigned work your team can see, track, and complete.",
    image: "/6.svg",
    accent: "from-emerald-300 via-green-300 to-lime-300",
  },
];

const railCards = [
  {
    icon: PanelTopIcon,
    title: "Live Workspace",
    desc: "One clean view for meetings, tasks, decisions, documents, and team spaces.",
  },
  {
    icon: SparklesIcon,
    title: "Smart Capture",
    desc: "Summaries, next steps, blockers, and decisions generated after every call.",
  },
  {
    icon: Users2Icon,
    title: "Team Spaces",
    desc: "Persistent spaces keep people, meeting history, and project context together.",
  },
  {
    icon: Clock3Icon,
    title: "Meeting Timeline",
    desc: "Track scheduled, active, completed, and missed meetings without manual work.",
  },
  {
    icon: FileTextIcon,
    title: "Decision Log",
    desc: "Turn spoken commitments into clear records your team can revisit.",
  },
  {
    icon: ZapIcon,
    title: "Execution Loop",
    desc: "Move from conversation to ownership to completion without the follow-up chase.",
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

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        ".gsap-reveal",
        { autoAlpha: 0, y: 36, scale: 0.985 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 72%",
          },
        }
      );

      gsap.to(".feature-preview-shell", {
        yPercent: -7,
        scale: 1.035,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      gsap.to(".feature-morph-light", {
        rotate: 18,
        scale: 1.18,
        xPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      ScrollTrigger.create({
        trigger: element,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const nextStep = Math.min(
            executionFeatures.length - 1,
            Math.max(0, Math.floor(self.progress * executionFeatures.length))
          );

          setActiveStep((current) => (current === nextStep ? current : nextStep));
        },
      });
    }, element);

    return () => context.revert();
  }, []);

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
                "feature-morph-light absolute inset-0 bg-gradient-to-br opacity-30 blur-3xl will-change-transform",
                activeFeature.accent
              )}
            />
          </AnimatePresence>
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.035]" />

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
                className="gsap-reveal mb-8 max-w-2xl"
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
                  Built for Real Team Work
                </p>
                <h2 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  How NeexMeet Works.
                </h2>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.title}
                  initial={{ opacity: 0, x: -64 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 44 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="gsap-reveal max-w-xl"
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
                    className="feature-preview-shell relative mx-auto max-w-[520px] rounded-lg border border-white/14 bg-white/[0.06] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl will-change-transform"
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
              className="feature-preview-shell relative hidden min-h-[620px] items-center justify-center will-change-transform lg:flex"
            >
              <div className="absolute inset-10 rounded-[2rem] bg-white/[0.04] blur-3xl" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.image}
                  initial={{ opacity: 0, x: 86, scale: 0.96, rotateY: -4 }}
                  animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, x: -54, scale: 0.98, rotateY: 3 }}
                  transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full max-w-[740px] rounded-[1.5rem] border border-white/14 bg-white/[0.06] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.46)] backdrop-blur-2xl will-change-transform"
                >
                  <div className="absolute -inset-px rounded-[1.5rem] bg-gradient-to-br from-white/24 via-transparent to-transparent opacity-70" />
                  <div className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#0a101a]">
                    <Image
                      src={activeFeature.image}
                      alt={`${activeFeature.title} UI preview`}
                      width={900}
                      height={650}
                      className="h-auto w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-[1.035]"
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
              Why Teams Choose NeexMeet
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">
              Less Meeting Admin. More Progress.
            </h2>
          </motion.div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {railCards.map((card, index) => (
              <Tilt
                key={card.title}
                tiltMaxAngleX={6}
                tiltMaxAngleY={8}
                perspective={1100}
                glareEnable
                glareMaxOpacity={0.16}
                glareColor="#ffffff"
                glarePosition="all"
                scale={1.015}
                transitionSpeed={1300}
                className="w-[82vw] shrink-0 snap-center sm:w-[420px]"
              >
                <motion.article
                  initial={{ opacity: 0, y: 34, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
                  whileHover={{ y: -10 }}
                  className="group relative min-h-[340px] overflow-hidden rounded-lg bg-gradient-to-br from-white/70 via-white/50 to-white/25 p-px shadow-[0_24px_80px_rgba(15,23,42,0.14)] transition-transform duration-300 will-change-transform"
                >
                  <div className="absolute -inset-20 bg-gradient-to-br from-emerald-300/20 via-cyan-300/10 to-violet-300/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative h-full min-h-[340px] rounded-lg border border-white/35 bg-white/62 p-6 backdrop-blur-2xl transition-colors duration-300 group-hover:bg-white/78">
                    <div className="mb-16 flex items-center justify-between">
                      <motion.div
                        whileHover={{ rotate: -8, scale: 1.12 }}
                        transition={{ type: "spring", stiffness: 320, damping: 18 }}
                        className="flex size-12 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-400/10 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.18)]"
                      >
                        <card.icon className="size-5" />
                      </motion.div>
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
                  </div>
                </motion.article>
              </Tilt>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
