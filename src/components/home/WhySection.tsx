import { motion } from "framer-motion";
import { TrendingUp, Clock, Users, BarChart3 } from "lucide-react";

const stats = [
  { icon: TrendingUp, stat: "35%", label: "Revenue Increase", desc: "Average growth in 6 months" },
  { icon: Clock, stat: "2hrs", label: "Time Saved Daily", desc: "Less admin, more wrenching" },
  { icon: Users, stat: "40%", label: "More Referrals", desc: "Customers love photo reports" },
  { icon: BarChart3, stat: "99.9%", label: "Uptime", desc: "Enterprise-grade reliability" },
];

export function WhySection() {
  return (
    <section className="py-16 lg:py-24 relative">
      <div className="absolute inset-0 bg-secondary/40 pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            Results
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Real Numbers, Real Studios
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Measurable impact from day one.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden text-center p-6 rounded-xl border border-border bg-card group hover:border-primary/30 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-extrabold text-primary mb-1">{s.stat}</div>
                <h3 className="font-bold text-sm mb-0.5">{s.label}</h3>
                <p className="text-[11px] text-muted-foreground">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
