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
  },
  {
    icon: Palette,
    title: "Multi-Category",
    description: "Cars, bikes, trucks, vans, and scooters — each with tailored zone maps.",
  },
];

export function FeatureShowcase() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Built for the <span className="text-gradient-primary">Detail-Obsessed</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every feature engineered by detailing professionals, for detailing
            professionals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`group relative p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                feature.accent
                  ? "border-primary/30 bg-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
                  : "border-border bg-card hover:border-border hover:bg-surface-elevated"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg mb-4 transition-colors duration-300 ${
                  feature.accent
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                }`}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
