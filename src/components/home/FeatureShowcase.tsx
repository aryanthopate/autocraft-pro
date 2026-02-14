import { motion } from "framer-motion";
import {
  Car,
  Users,
  ClipboardCheck,
  Camera,
  Shield,
  Smartphone,
  Gauge,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: Car,
    title: "3D Vehicle Mapping",
    description: "Tap zones on an interactive 3D model to assign services — no guesswork.",
    accent: true,
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Role-based access for owners, staff, and mechanics with approval workflows.",
  },
  {
    icon: ClipboardCheck,
    title: "Job Lifecycle",
    description: "Track every job from intake to delivery with zone-level granularity.",
  },
  {
    icon: Camera,
    title: "Media Documentation",
    description: "Before & after photos, videos, and voice notes attached to each zone.",
  },
  {
    icon: Shield,
    title: "Customer Portal",
    description: "Share secure, read-only status links with vehicle owners.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    description: "Workers update jobs and upload media from any device on the shop floor.",
  },
  {
    icon: Gauge,
    title: "Live Dashboard",
    description: "Revenue charts, staff performance, and real-time job pipeline at a glance.",
    accent: true,
  },
  {
    icon: Palette,
    title: "Multi-Category",
    description: "Cars, bikes, trucks, vans, and scooters — each with tailored zone maps.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, rotateX: 10 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function FeatureShowcase() {
  return (
    <section className="py-24 lg:py-32 relative">
      {/* Red accent line */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-racing"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Built for the{" "}
            <span className="text-gradient-racing">Detail-Obsessed</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every feature engineered by detailing professionals, for detailing
            professionals.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.25 },
              }}
              className={`group relative p-6 rounded-xl border transition-all duration-300 ${
                feature.accent
                  ? "border-racing/30 bg-racing/5 hover:border-racing/60 hover:shadow-lg hover:shadow-racing/10"
                  : "border-border bg-card hover:border-racing/30 hover:bg-surface-elevated"
              }`}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: feature.accent
                    ? "radial-gradient(ellipse at 50% 0%, hsl(var(--racing-red) / 0.08) 0%, transparent 70%)"
                    : "radial-gradient(ellipse at 50% 0%, hsl(var(--racing-red) / 0.04) 0%, transparent 70%)",
                }}
              />
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-lg mb-4 transition-all duration-300 ${
                  feature.accent
                    ? "bg-racing/20 text-racing group-hover:shadow-md group-hover:shadow-racing/20"
                    : "bg-secondary text-muted-foreground group-hover:text-racing group-hover:bg-racing/10"
                }`}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="relative font-display text-base font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="relative text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
