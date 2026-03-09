import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "DetailFlow transformed how we run our shop. Jobs never fall through the cracks now.",
    name: "Raj Mehta",
    role: "Studio Owner, Mumbai",
    rating: 5,
  },
  {
    quote: "The zone-based workflow is genius. My team knows exactly what to do without asking twice.",
    name: "Carlos Rivera",
    role: "Lead Detailer, Austin",
    rating: 5,
  },
  {
    quote: "Customers love the photo reports. Our referral rate jumped 40% in three months.",
    name: "Sarah Kim",
    role: "Operations Manager, Seoul",
    rating: 5,
  },
];

export function SocialProofStrip() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Loved by Professionals
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Join 500+ studios that run on DetailFlow every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative p-5 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
            >
              <Quote className="absolute top-4 right-4 h-5 w-5 text-primary/10 group-hover:text-primary/20 transition-colors" />
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-xs">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
