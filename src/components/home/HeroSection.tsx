import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./AnimatedCounter";

const checks = [
  "No credit card required",
  "14-day free trial",
  "Cancel anytime",
];

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              #1 Detailing Studio Management Software
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5"
          >
            All-in-One Wrap &{" "}
            <span className="text-gradient-primary">Detailing Studio</span>{" "}
            Management
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-7 leading-relaxed"
          >
            Streamline your workflow, manage your team, and deliver
            exceptional results — all from one powerful platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5"
          >
            <Button size="lg" asChild className="font-semibold shadow-lg shadow-primary/20">
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/features">
                View Features
              </Link>
            </Button>
          </motion.div>

          {/* Checkmarks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            {checks.map((c) => (
              <span key={c} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {c}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 grid grid-cols-3 max-w-lg mx-auto border border-border rounded-2xl bg-card overflow-hidden shadow-sm"
        >
          <AnimatedCounter value={500} suffix="+" label="Studios" delay={0.6} />
          <div className="border-x border-border">
            <AnimatedCounter value={50} suffix="K+" label="Jobs Done" delay={0.8} />
          </div>
          <AnimatedCounter value={99} suffix="%" label="Uptime" delay={1.0} />
        </motion.div>
      </div>
    </section>
  );
}
