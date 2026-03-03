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
  { icon: Camera, title: "Media Documentation", description: "Before & after photos, videos, and voice notes attached to each zone." },
  { icon: Shield, title: "Customer Portal", description: "Share secure, read-only status links with vehicle owners via WhatsApp." },
  { icon: Smartphone, title: "Mobile-First", description: "Workers update jobs and upload media from any device on the shop floor." },
  { icon: Gauge, title: "Live Dashboard", description: "Revenue charts, staff performance, and real-time job pipeline at a glance." },
  { icon: Palette, title: "Multi-Category", description: "Cars, bikes, trucks, vans, and scooters — each with tailored zone maps." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function FeatureShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Best Garage Management Features for{" "}
            <span className="text-gradient-primary">Modern Shops</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to run a professional detailing studio — from intake to delivery.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-10"
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
