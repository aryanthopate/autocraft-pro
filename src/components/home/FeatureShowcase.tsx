import { motion } from "framer-motion";
import {
  Car, Users, ClipboardCheck, Camera, Shield, Smartphone, Gauge, Palette,
} from "lucide-react";

const features = [
  { icon: Car, title: "3D Vehicle Mapping", description: "Interactive 3D models with tap-to-assign zone services.", tag: "Core" },
  { icon: Users, title: "Team Management", description: "Role-based access for owners, staff, and mechanics.", tag: "Teams" },
  { icon: ClipboardCheck, title: "Job Lifecycle", description: "Intake to delivery with zone-level tracking.", tag: "Workflow" },
  { icon: Camera, title: "Media Documentation", description: "Before & after photos per zone, auto-organized.", tag: "Media" },
  { icon: Shield, title: "Customer Portal", description: "Secure, real-time status links for vehicle owners.", tag: "Transparency" },
  { icon: Smartphone, title: "Mobile-First", description: "Update jobs and upload media from any device.", tag: "Mobile" },
  { icon: Gauge, title: "Live Analytics", description: "Revenue, staff performance, and pipeline at a glance.", tag: "Insights" },
  { icon: Palette, title: "Multi-Category", description: "Cars, bikes, trucks — each with tailored zone maps.", tag: "Flexible" },
];

export function FeatureShowcase() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/40 pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Everything Your Shop Needs
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            One platform to manage intake, execution, quality control, and delivery.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="group relative p-4 lg:p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
