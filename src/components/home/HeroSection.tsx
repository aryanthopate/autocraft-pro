import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./AnimatedCounter";
import { useRef } from "react";

function FloatingParticle({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-racing"
      style={{ left: x, width: size, height: size, bottom: -10 }}
      animate={{
        opacity: [0, 0.6, 0.6, 0],
        y: [0, -400, -700, -900],
        x: [0, Math.random() * 60 - 30, Math.random() * 80 - 40],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-background" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--racing-red) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--racing-red) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Red glow from bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-[80%] h-[60%] opacity-25"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 20% 100%, hsl(var(--racing-red) / 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Amber spotlight from top-right */}
      <div
        className="absolute top-0 right-0 w-[60%] h-[50%] opacity-20"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 80% 0%, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
        }}
      />

      {/* Floating red particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[0.5, 1.2, 2.5, 3.8, 5, 6.5, 8, 9.5, 11].map((d, i) => (
          <FloatingParticle key={i} delay={d} x={`${8 + i * 10}%`} size={2 + (i % 3)} />
        ))}
      </div>

      {/* Diagonal racing stripes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-[600px] h-[600px]"
          style={{
            opacity: 0.03,
            background: "repeating-linear-gradient(135deg, hsl(var(--racing-red)), hsl(var(--racing-red)) 2px, transparent 2px, transparent 20px)",
          }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 0.03 }}
          transition={{ duration: 2, delay: 0.3 }}
        />
      </div>

      {/* Animated horizontal sweep lines */}
      <motion.div
        className="absolute top-[40%] left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--racing-red) / 0.4), transparent)" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
      />
      <motion.div
        className="absolute top-[60%] left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.2), transparent)" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
      />

      <motion.div style={{ y: textY, opacity }} className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-racing/30 bg-racing/5 px-5 py-2 text-sm font-medium text-racing backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 fill-racing" />
              Professional Detailing Management
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter text-center leading-[0.9] mb-8"
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Precision.
            </motion.span>
            <motion.span
              className="block text-gradient-racing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4, type: "spring", stiffness: 100 }}
            >
              Performance.
            </motion.span>
            <motion.span
              className="block text-chrome"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Perfection.
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-12 leading-relaxed"
          >
            The command center for elite detailing studios. Track every job,
            manage your crew, and deliver flawless results —{" "}
            <span className="text-racing font-medium">every single time</span>.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="xl"
                asChild
                className="group bg-gradient-to-r from-racing to-racing-dark text-white hover:opacity-90 shadow-xl shadow-racing/25 font-semibold"
              >
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button variant="heroOutline" size="xl" asChild className="border-racing/30 hover:border-racing/60 hover:bg-racing/5">
                <Link to="/features">Explore Features</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="grid grid-cols-3 max-w-xl mx-auto border border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm overflow-hidden"
          >
            <AnimatedCounter value={500} suffix="+" label="Studios" delay={1.3} />
            <div className="border-x border-border/50">
              <AnimatedCounter value={50} suffix="K+" label="Jobs Completed" delay={1.5} />
            </div>
            <AnimatedCounter value={99} suffix="%" label="Uptime" delay={1.7} />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-medium">Scroll</span>
          <ChevronDown className="h-4 w-4 text-racing/50" />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
