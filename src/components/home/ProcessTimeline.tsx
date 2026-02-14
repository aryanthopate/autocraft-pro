import { motion } from "framer-motion";
import { ClipboardCheck, Car, Wrench, CheckCircle2, Camera, Send } from "lucide-react";

const steps = [
  { icon: ClipboardCheck, title: "Intake", desc: "Log vehicle details, snap condition photos" },
  { icon: Car, title: "Zone Map", desc: "Select service zones on the 3D model" },
  { icon: Wrench, title: "Execute", desc: "Mechanics work through zone checklists" },
  { icon: Camera, title: "Document", desc: "Before & after media for every zone" },
  { icon: CheckCircle2, title: "QA Review", desc: "Owner inspects and approves work" },
  { icon: Send, title: "Deliver", desc: "Invoice, notify customer, and release" },
];

export function ProcessTimeline() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle top divider */}
      <div className="section-divider mb-24" />

      {/* Animated red accent bar */}
      <motion.div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-racing"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            From Intake to <span className="text-gradient-racing">Delivery</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A battle-tested workflow designed by detailing professionals.
          </p>
        </motion.div>

        {/* Timeline grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12, type: "spring", stiffness: 120 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative p-5 rounded-xl border border-border bg-card hover:border-racing/40 transition-all duration-300 h-full">
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 0%, hsl(var(--racing-red) / 0.06) 0%, transparent 70%)",
                  }}
                />
                {/* Step number - red */}
                <motion.div
                  className="absolute -top-3 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-racing text-accent-foreground text-xs font-bold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 200 }}
                >
                  {i + 1}
                </motion.div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-racing/10 text-racing mb-3 group-hover:shadow-md group-hover:shadow-racing/20 transition-all duration-300">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="relative font-display text-sm font-semibold mb-1">{step.title}</h3>
                <p className="relative text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
