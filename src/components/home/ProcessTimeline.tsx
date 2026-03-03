import { motion } from "framer-motion";
import { ClipboardCheck, Car, Wrench, CheckCircle2, Camera, Send } from "lucide-react";

const steps = [
  { icon: ClipboardCheck, title: "Intake", desc: "Log vehicle details & snap condition photos" },
  { icon: Car, title: "Zone Map", desc: "Select service zones on the 3D model" },
  { icon: Wrench, title: "Execute", desc: "Mechanics work through zone checklists" },
  { icon: Camera, title: "Document", desc: "Before & after media for every zone" },
  { icon: CheckCircle2, title: "QA Review", desc: "Owner inspects and approves work" },
  { icon: Send, title: "Deliver", desc: "Invoice, notify customer, and release" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function ProcessTimeline() {
  return (
    <section className="py-14 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-2">
            Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            From Intake to{" "}
            <span className="text-gradient-primary">Delivery</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A battle-tested 6-step workflow designed by detailing professionals.
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            className="hidden lg:block absolute top-[48px] left-[8%] right-[8%] h-px bg-border"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {steps.map((step, i) => (
              <motion.div key={step.title} variants={item} className="group relative">
                <div className="relative p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 h-full text-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold shadow-md">
                    {i + 1}
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2.5 mx-auto group-hover:bg-primary/15 transition-colors">
                    <step.icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
