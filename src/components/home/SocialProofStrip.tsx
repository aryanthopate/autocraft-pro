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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function SocialProofStrip() {
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
            Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Trusted by <span className="text-gradient-primary">Garages</span>, Proven by Performance
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Join 500+ studios that rely on DetailFlow every day.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((t) => (
            <motion.blockquote
              key={t.name}
              variants={item}
              className="relative p-6 rounded-xl border border-border bg-card shadow-sm"
            >
              <Quote className="absolute top-4 right-4 h-5 w-5 text-primary/10" />
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary/70 text-primary/70" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-display">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
