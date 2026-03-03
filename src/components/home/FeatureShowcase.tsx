import { motion } from "framer-motion";
import {
  Car, Users, ClipboardCheck, Camera, Shield, Smartphone, Gauge, Palette,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const features = [
  { icon: Car, title: "3D Vehicle Mapping", description: "Tap zones on an interactive 3D model to assign services — no guesswork." },
  { icon: Users, title: "Team Management", description: "Role-based access for owners, staff, and mechanics with approval workflows." },
  { icon: ClipboardCheck, title: "Job Lifecycle", description: "Track every job from intake to delivery with zone-level granularity." },
  { icon: Camera, title: "Media Documentation", description: "Before & after photos and videos attached to each zone." },
  { icon: Shield, title: "Customer Portal", description: "Share secure, read-only status links with vehicle owners." },
  { icon: Smartphone, title: "Mobile-First", description: "Workers update jobs and upload media from any device on the shop floor." },
  { icon: Gauge, title: "Live Dashboard", description: "Revenue charts, staff performance, and real-time job pipeline at a glance." },
  { icon: Palette, title: "Multi-Category", description: "Cars, bikes, trucks, vans, and scooters — each with tailored zone maps." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function FeatureShowcase() {
  return (
    <section className="py-14 lg:py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-2">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Everything You Need for{" "}
            <span className="text-gradient-primary">Modern Shops</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From intake to delivery — one platform to run your entire studio.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mt-8"
        >
          <Button variant="outline" size="lg" asChild>
            <Link to="/features">
              View All Features
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
