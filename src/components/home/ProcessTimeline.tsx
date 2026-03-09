import { motion } from "framer-motion";
import { ClipboardCheck, Car, Wrench, Camera, CheckCircle2, Send } from "lucide-react";

const steps = [
  { icon: ClipboardCheck, title: "Intake", desc: "Log vehicle & snap condition photos", color: "bg-primary" },
  { icon: Car, title: "Zone Map", desc: "Assign services on the 3D model", color: "bg-accent" },
  { icon: Wrench, title: "Execute", desc: "Mechanics work through checklists", color: "bg-warning" },
  { icon: Camera, title: "Document", desc: "Before & after media per zone", color: "bg-success" },
  { icon: CheckCircle2, title: "QA Review", desc: "Owner inspects & approves work", color: "bg-racing" },
  { icon: Send, title: "Deliver", desc: "Invoice, notify, and release", color: "bg-primary" },
];

export function ProcessTimeline() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Six Steps to Perfection
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            A battle-tested workflow designed by detailing professionals.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-[8%] right-[8%] h-px bg-border" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative group"
              >
                <div className="text-center p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all h-full">
                  <div className={`relative mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${step.color} text-white shadow-sm`}>
                    <step.icon className="h-4.5 w-4.5" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border-2 border-border text-[10px] font-bold text-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold mb-1">{step.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
