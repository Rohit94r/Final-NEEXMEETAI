"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="NeexMeetAI Logo" width={32} height={32} className="h-8 w-8" />
              <span className="font-bold text-xl inline-block">NeexMeetAI</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hidden sm:inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Button asChild>
              <Link href="/sign-up">Start Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background -z-10" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" 
          />
          
          <div className="container mx-auto max-w-7xl px-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex-1 space-y-8 text-center lg:text-left z-10"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
                <SparklesIcon className="size-4 mr-2" />
                Meet the Team Execution System
              </motion.div>
              <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Turn meetings into <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                  execution
                </span>
                <br className="hidden md:block" /> automatically.
              </motion.h1>
              <motion.p variants={fadeIn} className="text-xl text-muted-foreground max-w-[42rem] mx-auto lg:mx-0 leading-normal">
                Stop taking notes and manually assigning tasks. NeexMeetAI listens, summarizes, and populates your team's workspace while you focus on the conversation.
              </motion.p>
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300" asChild>
                  <Link href="/sign-up">
                    Start Free <ChevronRightIcon className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 hover:scale-105 transition-all duration-300" asChild>
                  <Link href="#demo">
                    <PlayIcon className="mr-2 size-4" /> Watch Demo
                  </Link>
                </Button>
              </motion.div>
              <motion.p variants={fadeIn} className="text-sm text-muted-foreground">No credit card required &middot; Free forever tier</motion.p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 w-full max-w-2xl lg:max-w-none relative z-10"
            >
              <div className="relative rounded-2xl border border-border/50 bg-background/80 backdrop-blur-md shadow-2xl p-2 transition-transform duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 rounded-2xl" />
                <Image 
                  src="/hero-mockup-abstract.png" 
                  alt="NeexMeetAI Platform Overview" 
                  width={1200} 
                  height={800} 
                  className="rounded-xl border border-border object-cover w-full h-auto relative z-10 bg-muted"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="py-10 border-y border-border/40 bg-muted/40 overflow-hidden">
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
              className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
            >
              <motion.div variants={fadeIn} className="flex items-center gap-2 font-bold text-xl"><LayersIcon /> AcemCorp</motion.div>
              <motion.div variants={fadeIn} className="flex items-center gap-2 font-bold text-xl"><ZapIcon /> FastScale</motion.div>
              <motion.div variants={fadeIn} className="flex items-center gap-2 font-bold text-xl"><ShieldCheckIcon /> SecureNet</motion.div>
              <motion.div variants={fadeIn} className="flex items-center gap-2 font-bold text-xl"><ActivityIcon /> PulseFlow</motion.div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 bg-background overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
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
              {/* Feature Card 1 */}
              <motion.div variants={fadeIn} className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <VideoIcon className="size-32 text-primary" />
                </div>
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 relative z-10">
                  <VideoIcon className="size-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 relative z-10">AI-Powered Meetings</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
                  High-fidelity video calls with an active AI participant. Ask questions mid-meeting, get instant context, and instantly receive perfect transcripts.
                </p>
              </motion.div>

              {/* Feature Card 2 */}
              <motion.div variants={fadeIn} className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <LayoutDashboardIcon className="size-32 text-blue-500" />
                </div>
                <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 relative z-10">
                  <LayoutDashboardIcon className="size-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 relative z-10">Intelligent Workspace</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
                  Tasks, decisions, and documents are automatically populated based on meeting outcomes. Every action item is tracked and visible to the entire team.
                </p>
              </motion.div>

              {/* Feature Card 3 */}
              <motion.div variants={fadeIn} className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <UsersIcon className="size-32 text-emerald-500" />
                </div>
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 relative z-10">
                  <UsersIcon className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 relative z-10">Dedicated Rooms</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
                  Persistent, collaborative spaces for your projects. Keep all related meetings, tasks, and communications logically grouped in one central hub.
                </p>
              </motion.div>

              {/* Feature Card 4 */}
              <motion.div variants={fadeIn} className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BotIcon className="size-32 text-amber-500" />
                </div>
                <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 relative z-10">
                  <BotIcon className="size-6 text-amber-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 relative z-10">Presence & Accountability</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
                  Build remote culture with photo-verified daily check-ins. Admins get full visibility into task completions and team activity streams.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* DEMO SECTION / PRODUCT DEEP DIVE */}
        <section id="demo" className="py-24 bg-muted/30 overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Less overhead. More shipping.</h2>
              <p className="text-lg text-muted-foreground">
                See how a single meeting seamlessly translates into a clear, executable roadmap.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto max-w-5xl"
            >
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 to-emerald-500/30 blur-2xl opacity-50" />
              <div className="relative rounded-2xl border border-border bg-card p-2 md:p-4 shadow-2xl">
                <div className="bg-background rounded-xl overflow-hidden border border-border aspect-[16/9] flex items-center justify-center">
                  <Image 
                    src="/demo-placeholder.png" 
                    alt="Platform UI Screenshot" 
                    width={1024} 
                    height={576} 
                    className="w-full h-full object-cover bg-muted"
                  />
                  {/* Fake play button overlay if we want to imply a video */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-20 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-2xl shadow-primary/50 cursor-pointer hover:scale-110 transition-transform">
                      <PlayIcon className="size-8 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-background overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
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
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                { step: "1", title: "Create a Room", desc: "Launch a dedicated space for your team or project." },
                { step: "2", title: "Start Meeting", desc: "Jump into a live video call with built-in AI assistance." },
                { step: "3", title: "AI Generation", desc: "The AI listens, understands, and builds a complete summary." },
                { step: "4", title: "Tasks Auto-Assign", desc: "Action items pop straight into your Workspace, ready to do." }
              ].map((item, i) => (
                <motion.div 
                  variants={fadeIn} 
                  key={item.step} 
                  className="relative flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
                >
                  <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-6 shadow-md">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                  {i !== 3 && (
                    <div className="hidden lg:block absolute top-[45px] right-[-40%] w-[80%] border-t-2 border-dashed border-border z-[-1]" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent -z-10" />
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="container mx-auto max-w-4xl px-4 text-center"
          >
            <motion.h2 variants={fadeIn} className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Start building with NeexMeetAI today.
            </motion.h2>
            <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join the new wave of organizations that trust AI to handle the busywork so humans can handle the deep work.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/25 hover:scale-105 transition-all duration-300" asChild>
                <Link href="/sign-up">Start Free <ChevronRightIcon className="ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-background hover:scale-105 transition-all duration-300" asChild>
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-card py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="NeexMeetAI Logo" width={28} height={28} />
              <span className="font-bold text-lg">NeexMeetAI</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              The AI-powered team execution system where every action is visible, trackable, and accountable.
            </p>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} NeexMeetAI. All rights reserved.
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Rooms</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Workspace</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
