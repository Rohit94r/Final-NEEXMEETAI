"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CirclePlayIcon,
  GaugeIcon,
  LockKeyholeIcon,
  SparklesIcon,
  WorkflowIcon,
  ZapIcon,
} from "lucide-react";

import { ProductExperience } from "@/app/(marketing)/_components/product-experience";
import { Button } from "@/components/ui/button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.1 },
  },
};

const proofPoints = [
  { icon: WorkflowIcon, label: "Action items, captured" },
  { icon: GaugeIcon, label: "Execution, always visible" },
  { icon: LockKeyholeIcon, label: "Context, never lost" },
];

const stats = [
  { value: "7", label: "core workflows connected" },
  { value: "1", label: "AI execution workspace" },
  { value: "0", label: "manual follow-up chaos" },
];

export default function LandingPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 24, stiffness: 140 });
  const smoothY = useSpring(mouseY, { damping: 24, stiffness: 140 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    mouseY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetMouse = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="min-h-screen overflow-clip bg-white text-slate-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#070b12]/78 text-white backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="NeexMeet"
              width={34}
              height={34}
              className="size-8 rounded-md bg-white object-contain p-1"
              priority
            />
            <span className="text-lg font-black tracking-tight">NeexMeet</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/64 md:flex">
            <Link href="#features" className="transition-colors hover:text-white">
              Features
            </Link>
            <Link href="#how-it-works" className="transition-colors hover:text-white">
              Workflow
            </Link>
            <Link href="#demo" className="transition-colors hover:text-white">
              Demo
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden text-sm font-semibold text-white/64 transition-colors hover:text-white sm:block"
            >
              Log in
            </Link>
            <Button
              asChild
              className="h-10 rounded-lg bg-white px-5 text-slate-950 shadow-[0_0_34px_rgba(255,255,255,0.22)] transition-all duration-300 hover:scale-105 hover:bg-emerald-200 hover:shadow-[0_0_42px_rgba(110,231,183,0.34)]"
            >
              <Link href="/sign-up">
                Start Free
                <ChevronRightIcon className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-screen overflow-hidden bg-[#070b12] pt-32 text-white md:pt-36">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_84%)]" />
          <div className="absolute left-1/2 top-0 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-emerald-300/16 blur-3xl" />
          <motion.div
            animate={{ x: [0, 36, 0], y: [0, -28, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-12rem] top-32 h-[32rem] w-[32rem] rounded-full bg-cyan-400/12 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 24, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
            className="absolute right-[-14rem] top-16 h-[36rem] w-[36rem] rounded-full bg-violet-400/13 blur-3xl"
          />

          <div className="container relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 lg:grid-cols-[0.92fr_1.08fr] lg:pb-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-4xl text-center lg:text-left"
            >
              <motion.div
                variants={fadeUp}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-3.5 py-2 text-sm font-semibold text-white/76 shadow-2xl backdrop-blur-xl"
              >
                <SparklesIcon className="size-4 text-emerald-200" />
                AI meeting notes that become real work
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl font-black leading-[0.96] tracking-tight text-balance md:text-7xl lg:text-[5.75rem]"
              >
                Turn Meetings Into{" "}
                <span className="bg-gradient-to-r from-emerald-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
                  Execution
                </span>
                .
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/68 md:text-xl lg:mx-0"
              >
                NeexMeet automatically turns meetings into summaries, decisions,
                tasks, and follow-ups, so your team never misses what matters.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
              >
                <Button
                  size="lg"
                  asChild
                  className="h-13 w-full rounded-lg bg-emerald-300 px-7 text-base font-bold text-slate-950 shadow-[0_18px_56px_rgba(110,231,183,0.28)] transition-all duration-300 hover:scale-105 hover:bg-emerald-200 hover:shadow-[0_22px_70px_rgba(110,231,183,0.42)] sm:w-auto"
                >
                  <Link href="/sign-up">
                    Try NeexMeet
                    <ArrowRightIcon className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-13 w-full rounded-lg border-white/16 bg-white/7 px-7 text-base text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-white/25 hover:bg-white/12 hover:text-white sm:w-auto"
                >
                  <Link href="#demo">
                    <CirclePlayIcon className="mr-2 size-4" />
                    See It in Action
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-10 grid gap-3 sm:grid-cols-3"
              >
                {proofPoints.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/9 bg-white/[0.045] px-3 py-3 text-sm font-semibold text-white/67 backdrop-blur lg:justify-start"
                  >
                    <item.icon className="size-4 text-emerald-200" />
                    {item.label}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 48, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetMouse}
              className="relative mx-auto w-full max-w-3xl [perspective:1200px]"
            >
              <motion.div
                style={{ rotateX, rotateY }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-[1.6rem] border border-white/14 bg-white/[0.06] p-2 shadow-[0_34px_120px_rgba(0,0,0,0.46)] backdrop-blur-2xl"
              >
                <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-r from-emerald-300/22 via-cyan-300/16 to-violet-400/18 blur-2xl" />
                <div className="relative overflow-hidden rounded-[1.15rem] border border-white/10 bg-[#0a101a]">
                  <video
                    src="/hero-mockup-abstract.mp4"
                    aria-label="NeexMeet product interface animation"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/hero-mockup-abstract.png"
                    className="aspect-[16/10] w-full object-cover opacity-95"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#070b12]/10 via-transparent to-white/10" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                className="absolute -bottom-5 left-2 rounded-lg border border-white/14 bg-[#07110f]/82 px-4 py-3 text-sm text-white/80 shadow-2xl backdrop-blur-xl md:left-8"
              >
                <div className="flex items-center gap-2 font-semibold text-white">
                  <CheckCircle2Icon className="size-4 text-emerald-200" />
                  6 action items ready
                </div>
                <p className="mt-1 text-xs text-white/55">Owners, context, and next steps included</p>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative z-10 border-t border-white/10 bg-white/[0.035] backdrop-blur-xl">
            <div className="container mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="text-3xl font-black tracking-tight text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-white/52">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProductExperience />

        <section id="demo" className="relative overflow-hidden bg-white py-24 md:py-32">
          <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-slate-100 to-transparent" />
          <div className="container relative z-10 mx-auto max-w-7xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mx-auto mb-14 max-w-3xl text-center"
            >
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                Product Preview
              </p>
              <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Built for Real Team Work.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Prepare the room, capture the conversation, and turn every
                outcome into visible progress.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 38, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              className="group relative mx-auto max-w-6xl"
            >
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-emerald-200/50 via-sky-200/35 to-violet-200/45 blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative rounded-[1.55rem] border border-slate-200 bg-white p-2 shadow-[0_32px_120px_rgba(15,23,42,0.16)]">
                <Image
                  src="/demo-placeholder.png"
                  alt="NeexMeet dashboard preview"
                  width={1200}
                  height={760}
                  className="rounded-[1.05rem] border border-slate-100 object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#070b12] py-24 text-white md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(110,231,183,0.22),transparent_36%)]" />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-16rem] left-1/2 h-[34rem] w-[44rem] -translate-x-1/2 rounded-full bg-cyan-300/13 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="container relative z-10 mx-auto max-w-4xl px-4 text-center"
          >
            <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-lg border border-white/12 bg-white/8 text-emerald-200 backdrop-blur-xl">
              <ZapIcon className="size-5" />
            </div>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">
              End every meeting with momentum.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/64">
              Give your team one place where decisions, owners, and next steps
              are already connected.
            </p>
            <div className="mt-9 flex justify-center">
              <Button
                size="lg"
                asChild
                className="h-13 rounded-lg bg-emerald-300 px-8 text-base font-bold text-slate-950 shadow-[0_18px_56px_rgba(110,231,183,0.26)] transition-all duration-300 hover:scale-105 hover:bg-emerald-200 hover:shadow-[0_22px_70px_rgba(110,231,183,0.42)]"
              >
                <Link href="/sign-up">
                  Run Your First Meeting
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="NeexMeet"
                width={32}
                height={32}
                className="size-8 rounded-md border border-slate-200 object-contain p-1"
              />
              <span className="text-lg font-black tracking-tight">NeexMeet</span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              The AI workspace where meetings become decisions, tasks, and
              measurable execution.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-500">
            <Link href="#features" className="transition-colors hover:text-slate-950">
              Features
            </Link>
            <Link href="#how-it-works" className="transition-colors hover:text-slate-950">
              Workflow
            </Link>
            <Link href="/sign-in" className="transition-colors hover:text-slate-950">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
