import { motion } from "framer-motion";
import { TrendingUp, Clock, Users, BarChart3 } from "lucide-react";

const stats = [
  { icon: TrendingUp, stat: "35%", label: "Revenue Increase", desc: "Average revenue growth in the first 6 months" },
  { icon: Clock, stat: "2hrs", label: "Time Saved Daily", desc: "Less time on admin, more time on cars" },
  { icon: Users, stat: "40%", label: "More Referrals", desc: "Customers love photo reports and tracking" },
  { icon: BarChart3, stat: "99.9%", label: "Uptime", desc: "Enterprise-grade reliability for your studio" },
];

export function WhySection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            Results
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            All-in-One Software That{" "}
            <span className="text-gradient-primary">Delivers Results</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real numbers from real studios using DetailFlow every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-xl border border-border bg-card"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="font-display text-3xl font-bold text-primary mb-1">{s.stat}</div>
              <h3 className="font-display font-semibold text-sm mb-1">{s.label}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
