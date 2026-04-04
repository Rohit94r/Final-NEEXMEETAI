"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, Variants } from "framer-motion";
import { 
  BotIcon, 
  LayoutDashboardIcon, 
  UsersIcon, 
  VideoIcon, 
  ChevronRightIcon, 
  LayersIcon, 
  ActivityIcon,
  PlayIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ZapIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mouse Parallax Logic for Hero Image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-3, 3]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Scroll Progress for Demo Zoom
  const { scrollYProgress } = useScroll();
  const demoScale = useTransform(scrollYProgress, [0.3, 0.6], [0.95, 1]);

  // Shared Transitions
  const transitionConfig = { type: "spring" as const, stiffness: 100, damping: 20 };
  const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: isMobile ? 10 : 30 },
    visible: { opacity: 1, y: 0, transition: transitionConfig }
  };
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Animated Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            x: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] right-[0%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[150px]"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[30%] h-[400px] w-[800px] rounded-full bg-blue-500/10 blur-[150px]"
        />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Image src="/logo.png" alt="NeexMeet Logo" width={32} height={32} className="h-8 w-8" />
              </motion.div>
              <span className="font-bold text-xl inline-block">NeexMeet</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="#features" className="group relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="#how-it-works" className="group relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How it works
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hidden sm:inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Button asChild className="group relative overflow-hidden transition-all hover:shadow-[0_0_20px_var(--color-primary)] hover:scale-105">
              <Link href="/sign-up">
                <span className="relative z-10">Start Free</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="container mx-auto max-w-7xl px-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex-1 space-y-8 text-center lg:text-left z-10"
            >
              <motion.div variants={fadeUpVariant} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2 shadow-[0_0_15px_var(--color-primary)]/20">
                <SparklesIcon className="size-4 mr-2" />
                Meet the Team Execution System
              </motion.div>
              <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Turn meetings into <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                  execution
                </span>
                <br className="hidden md:block" /> automatically.
              </motion.h1>
              <motion.p variants={fadeUpVariant} className="text-xl text-muted-foreground max-w-[42rem] mx-auto lg:mx-0 leading-normal">
                Stop taking notes and manually assigning tasks. NeexMeet listens, summarizes, and populates your team's workspace while you focus on the conversation.
              </motion.p>
              <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-[0_4px_14px_0_var(--color-primary)]/30 hover:shadow-[0_6px_20px_var(--color-primary)]/50 hover:scale-105 transition-all duration-300 ease-out" asChild>
                  <Link href="/sign-up">
                    Start Free <ChevronRightIcon className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="group w-full sm:w-auto text-base h-12 px-8 hover:scale-105 transition-all duration-300 ease-out bg-background/50 backdrop-blur-sm" asChild>
                  <Link href="#demo">
                    <PlayIcon className="mr-2 size-4 group-hover:text-primary transition-colors" /> Watch Demo
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: isMobile ? 20 : 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="flex-1 w-full max-w-2xl lg:max-w-none relative z-10 perspective-[1000px]"
            >
              <motion.div 
                style={{ rotateX, rotateY }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-2xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 rounded-2xl pointer-events-none" />
                <Image 
                  src="/hero-mockup-abstract.png" 
                  alt="NeexMeet Platform Overview" 
                  width={1200} 
                  height={800} 
                  className="rounded-xl border border-border/50 object-cover w-full h-auto relative z-10"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="py-10 border-y border-border/40 bg-muted/20 backdrop-blur-sm">
          <div className="container mx-auto max-w-7xl px-4">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8"
            >
              Trusted by innovative teams worldwide
            </motion.p>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-700 ease-out"
            >
              {[
                { icon: LayersIcon, name: "AcemCorp" },
                { icon: ZapIcon, name: "FastScale" },
                { icon: ShieldCheckIcon, name: "SecureNet" },
                { icon: ActivityIcon, name: "PulseFlow" }
              ].map((logo, idx) => (
                <motion.div key={idx} variants={fadeUpVariant} className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors">
                  <logo.icon /> {logo.name}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 relative">
          <div className="container mx-auto max-w-7xl px-4">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">A brain for your entire team.</h2>
              <p className="text-lg text-muted-foreground text-balance">
                Everything you need to run your team, packed into a single, cohesive, AI-powered OS. Say goodbye to tab switching.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-6 lg:gap-8"
            >
              {[
                { icon: VideoIcon, title: "AI-Powered Meetings", color: "text-primary", bg: "bg-primary/10", glow: "group-hover:border-primary/50 group-hover:shadow-[0_0_30px_var(--color-primary)]/20", desc: "High-fidelity video calls with an active AI participant. Ask questions mid-meeting, get instant context, and instantly receive perfect transcripts." },
                { icon: LayoutDashboardIcon, title: "Intelligent Workspace", color: "text-blue-500", bg: "bg-blue-500/10", glow: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_#3b82f6]/20", desc: "Tasks, decisions, and documents are automatically populated based on meeting outcomes. Every action item is tracked and visible to the entire team." },
                { icon: UsersIcon, title: "Dedicated Rooms", color: "text-emerald-500", bg: "bg-emerald-500/10", glow: "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_#10b981]/20", desc: "Persistent, collaborative spaces for your projects. Keep all related meetings, tasks, and communications logically grouped in one central hub." },
                { icon: BotIcon, title: "Presence & Accountability", color: "text-amber-500", bg: "bg-amber-500/10", glow: "group-hover:border-amber-500/50 group-hover:shadow-[0_0_30px_#f59e0b]/20", desc: "Build remote culture with photo-verified daily check-ins. Admins get full visibility into task completions and team activity streams." }
              ].map((feat, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeUpVariant}
                  whileHover={isMobile ? {} : { scale: 1.03, y: -5 }}
                  className={`group rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 relative overflow-hidden ${feat.glow}`}
                >
                  <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 scale-150 group-hover:scale-110`}>
                    <feat.icon className={`size-48 ${feat.color}`} />
                  </div>
                  <div className={`size-12 rounded-xl ${feat.bg} flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110 duration-300`}>
                    <feat.icon className={`size-6 ${feat.color}`} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 relative z-10">{feat.title}</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{feat.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* DEMO SECTION / PRODUCT DEEP DIVE */}
        <section id="demo" className="py-24 relative overflow-visible z-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10" />
          <div className="container mx-auto max-w-7xl px-4">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Less overhead. More shipping.</h2>
              <p className="text-lg text-muted-foreground">
                See how a single meeting seamlessly translates into a clear, executable roadmap.
              </p>
            </motion.div>

            <motion.div 
              style={{ scale: isMobile ? 1 : demoScale }}
              className="relative mx-auto max-w-5xl group perspective-[1000px]"
            >
              <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-primary/30 via-emerald-500/20 to-primary/30 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
              <motion.div 
                whileHover={isMobile ? {} : { rotateX: 2, rotateY: 2 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative rounded-2xl border border-border/80 bg-background/60 backdrop-blur-md p-2 md:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
              >
                <div className="bg-background rounded-xl overflow-hidden border border-border aspect-[16/9] flex items-center justify-center relative">
                  <Image 
                    src="/demo-placeholder.png" 
                    alt="Platform UI Screenshot" 
                    width={1024} 
                    height={576} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-background/10 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className="size-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_30px_var(--color-primary)] cursor-pointer"
                    >
                      <PlayIcon className="size-8 ml-1 fill-current" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 relative">
          <div className="container mx-auto max-w-7xl px-4">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How it works</h2>
              <p className="text-lg text-muted-foreground">
                The frictionless lifecycle from conversation to completion.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative"
            >
              {/* Connecting Line */}
              <div className="hidden lg:block absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10" />

              {[
                { step: "1", title: "Create a Room", desc: "Launch a dedicated space for your team or project." },
                { step: "2", title: "Start Meeting", desc: "Jump into a live video call with built-in AI assistance." },
                { step: "3", title: "AI Generation", desc: "The AI listens, understands, and builds a complete summary." },
                { step: "4", title: "Tasks Auto-Assign", desc: "Action items pop straight into your Workspace, ready to do." }
              ].map((item, i) => (
                <motion.div 
                  variants={fadeUpVariant} 
                  key={item.step} 
                  whileHover={isMobile ? {} : { y: -10 }}
                  className="relative flex flex-col items-center text-center p-6 bg-card/40 backdrop-blur border border-border/60 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  <div className="size-12 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center text-xl font-bold mb-6 shadow-[0_0_15px_var(--color-primary)]/20 z-10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent -z-10" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-20%] left-[20%] h-[400px] w-[600px] rounded-full bg-primary/20 blur-[120px] -z-10 pointer-events-none"
          />

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="container mx-auto max-w-4xl px-4 text-center"
          >
            <motion.h2 variants={fadeUpVariant} className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Start building with NeexMeet today.
            </motion.h2>
            <motion.p variants={fadeUpVariant} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join the new wave of organizations that trust AI to handle the busywork so humans can handle the deep work.
            </motion.p>
            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-14 px-10 text-lg shadow-[0_0_20px_var(--color-primary)]/40 hover:shadow-[0_0_30px_var(--color-primary)]/60 hover:scale-105 transition-all duration-300 ease-out" asChild>
                <Link href="/sign-up">Start Free <ChevronRightIcon className="ml-2" /></Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-card/60 backdrop-blur py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Image src="/logo.png" alt="NeexMeet Logo" width={28} height={28} className="transition-transform group-hover:rotate-12" />
              <span className="font-bold text-lg">NeexMeet</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              The AI-powered team execution system where every action is visible, trackable, and accountable.
            </p>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} NeexMeet. All rights reserved.
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Features</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Rooms</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Workspace</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">About</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
