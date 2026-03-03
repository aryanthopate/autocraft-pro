import { motion } from "framer-motion";
import { TrendingUp, Clock, Users, BarChart3 } from "lucide-react";

const stats = [
  { icon: TrendingUp, stat: "35%", label: "Revenue Increase", desc: "Average growth in the first 6 months" },
  { icon: Clock, stat: "2hrs", label: "Time Saved Daily", desc: "Less admin, more time on cars" },
  { icon: Users, stat: "40%", label: "More Referrals", desc: "Customers love photo reports" },
  { icon: BarChart3, stat: "99.9%", label: "Uptime", desc: "Enterprise-grade reliability" },
];

export function WhySection() {
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
            Results
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Software That{" "}
            <span className="text-gradient-primary">Delivers Results</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Real numbers from real studios using DetailFlow every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-5 rounded-xl border border-border bg-card"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-primary mb-0.5">{s.stat}</div>
              <h3 className="font-semibold text-sm mb-0.5">{s.label}</h3>
              <p className="text-[11px] text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
