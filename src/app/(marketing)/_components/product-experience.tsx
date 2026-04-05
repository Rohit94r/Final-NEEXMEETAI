"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

const productSteps = [
  {
    id: 1,
    title: "Everything in one place",
    desc: "Your entire workflow, condensed. Start your day with a clear overview of rooms, tasks, and meetings.",
    image: "/0.svg"
  },
  {
    id: 2,
    title: "Create meetings instantly",
    desc: "Configure your agenda, schedule the time, and assign specialized AI agents before you jump in.",
    image: "/1.svg"
  },
  {
    id: 3,
    title: "Track all meetings",
    desc: "A permanent, searchable system of record for all upcoming, missed, and historical team discussions.",
    image: "/2.svg"
  },
  {
    id: 4,
    title: "AI summaries & automation",
    desc: "Never take notes again. NeexMeet generates perfect transcripts, summaries, and action plans in real-time.",
    image: "/3.svg"
  },
  {
    id: 5,
    title: "Team collaboration",
    desc: "Persistent rooms map everything together. Group relevant people, meetings, and artifacts into dedicated hubs.",
    image: "/4.svg"
  },
  {
    id: 6,
    title: "Meetings + tasks + decisions",
    desc: "Deep work requires deep context. Switch instantly between live pulse arrays, tasks, and previous calls.",
    image: "/5.svg"
  },
  {
    id: 7,
    title: "Tasks & execution",
    desc: "Automated extraction means action items appear in your Workspace without copying and pasting.",
    image: "/6.svg"
  },
  {
    id: 8,
    title: "AI agents working for you",
    desc: "Deploy custom personas to join meetings, verify configurations, and execute complex workflows passively.",
    image: "/7.svg"
  }
];

export const ProductExperience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Framer Motion hook to track how far we have scrolled within our big container space
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Whenever the scroll changes, calculate which step we are on
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Math to divide the 0-1 percentage into 8 distinct steps
    const numSteps = productSteps.length;
    // Breakpoints: e.g. 0 to 0.125 is step 0, 0.125 to 0.25 is step 1, etc.
    let stepIndex = Math.floor(latest * numSteps);
    
    // Safety clamp so we don't accidentally index out of bounds at exactly 100% (1.0)
    if (stepIndex >= numSteps) {
      stepIndex = numSteps - 1;
    }
    
    if (stepIndex !== activeStep) {
      setActiveStep(stepIndex);
    }
  });

  return (
    // The wrapper is highly stretched out vertically so you actually have room to scroll 
    // It creates the "scrubbing" effect when passing over it
    <section 
      ref={containerRef} 
      className="relative h-[250vh] md:h-[400vh] bg-gradient-to-b from-background via-muted/30 to-background border-y border-border/40"
    >
      
      {/* Sticky Inner Container, holds the entire visible interface tightly inside the screen */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
        <div className="container mx-auto max-w-7xl px-4 flex flex-col gap-8 md:gap-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto pt-16 md:pt-0">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              The flow of execution.
            </h2>
            <p className="text-lg text-muted-foreground">
              Scroll down to scrub through how NeexMeet bridges the gap between talking and doing.
            </p>
          </div>

          {/* Desktop & Mobile Interactive Layout */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-20 h-auto lg:h-[600px]">
            
            {/* Left Side: Accordion Menu */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center">
              {productSteps.map((step, idx) => {
                const isActive = activeStep === idx;
                
                return (
                  <div 
                    key={step.id} 
                    className={cn(
                      "cursor-pointer px-4 lg:px-6 py-3 lg:py-4 rounded-2xl transition-all duration-300 border",
                      isActive 
                        ? "bg-card shadow-md lg:shadow-lg border-border/80 lg:scale-[1.02]" 
                        : "bg-transparent border-transparent opacity-50 lg:opacity-100 scale-100"
                    )}
                  >
                    <div className="flex items-center gap-3 lg:gap-4">
                      {/* Circle Indicator */}
                      <div className="relative flex items-center justify-center size-6 lg:size-8 rounded-full overflow-hidden shrink-0">
                        <div className={cn("absolute inset-0 bg-primary/20", isActive ? "opacity-100" : "opacity-0")} />
                        <span className={cn("relative z-10 text-xs lg:text-sm font-bold", isActive ? "text-primary" : "text-muted-foreground")}>
                          {step.id}
                        </span>
                      </div>
                      
                      <h3 className={cn("text-lg lg:text-xl font-bold tracking-tight transition-colors duration-300", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {step.title}
                      </h3>
                    </div>

                    {/* Expanding Description */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm lg:text-base text-muted-foreground pl-9 lg:pl-12 pr-4 leading-relaxed">
                            {step.desc}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Right Side: Animated Screenshot Swap in place */}
            <div className="w-full lg:w-[55%] h-[450px] sm:h-[550px] md:h-[650px] lg:h-[750px] flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full h-full absolute inset-0"
                >
                  <motion.div
                    className="w-full h-full relative rounded-lg overflow-hidden"
                  >
                    <Image
                      src={productSteps[activeStep].image}
                      alt={productSteps[activeStep].title}
                      fill
                      className="object-contain relative z-10"
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0';
                      }}
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};
