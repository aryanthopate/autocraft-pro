import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./AnimatedCounter";

const checks = ["No credit card required", "14-day free trial", "Cancel anytime"];

const logos = ["BMW", "Mercedes", "Tesla", "Audi", "Porsche"];

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-2 lg:pt-28 lg:pb-4 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-56 h-56 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Trusted by 500+ Studios Worldwide
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] mb-5"
          >
            The Operating System for{" "}
            <span className="text-gradient-primary">Auto Detailing</span>{" "}
            Studios
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Manage jobs, teams, and customers from one powerful platform.
            3D vehicle mapping, real-time tracking, and automated workflows — built for modern garages.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <Button size="lg" asChild className="font-semibold shadow-lg shadow-primary/25 h-12 px-8 text-base">
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-12 px-8 text-base">
              <Link to="/features" className="flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" />
                See How It Works
              </Link>
            </Button>
          </motion.div>

          {/* Checkmarks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground mb-10"
          >
            {checks.map((c) => (
              <span key={c} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                {c}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/50">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-5 w-64 rounded bg-muted/60 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground font-mono">app.detailflow.io/dashboard</span>
                </div>
              </div>
            </div>

            {/* Fake dashboard content */}
            <div className="p-4 sm:p-6 bg-card">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Active Jobs", value: "24", color: "bg-primary/10 text-primary" },
                  { label: "Customers", value: "186", color: "bg-accent/10 text-accent" },
                  { label: "Revenue", value: "₹4.2L", color: "bg-success/10 text-success" },
                  { label: "Completion", value: "94%", color: "bg-warning/10 text-warning" },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg border border-border p-3 bg-card">
                    <div className={`inline-flex items-center justify-center h-7 w-7 rounded-md ${card.color} mb-2`}>
                      <div className="h-3 w-3 rounded-sm bg-current opacity-60" />
                    </div>
                    <div className="text-lg font-bold">{card.value}</div>
                    <div className="text-[10px] text-muted-foreground">{card.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 h-32 rounded-lg border border-border bg-secondary/30 flex items-end p-3 gap-1">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-primary/40" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="h-32 rounded-lg border border-border p-3 space-y-2">
                  {[85, 72, 68, 45].map((w, i) => (
                    <div key={i} className="space-y-1">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 text-[9px] text-muted-foreground">Staff Performance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 grid grid-cols-3 max-w-md mx-auto"
        >
          <AnimatedCounter value={500} suffix="+" label="Studios" delay={0.9} />
          <div className="border-x border-border">
            <AnimatedCounter value={50} suffix="K+" label="Jobs Done" delay={1.0} />
          </div>
          <AnimatedCounter value={99} suffix="%" label="Uptime" delay={1.1} />
        </motion.div>

        {/* Trusted logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex items-center justify-center gap-8 opacity-40"
        >
          {logos.map((logo) => (
            <span key={logo} className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
