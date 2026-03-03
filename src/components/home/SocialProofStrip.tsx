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
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function SocialProofStrip() {
  return (
    <section className="py-14 lg:py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-2">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Trusted by <span className="text-gradient-primary">Garages</span>, Proven by Performance
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Join 500+ studios that rely on DetailFlow every day.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((t) => (
            <motion.blockquote
              key={t.name}
              variants={item}
              className="relative p-5 rounded-xl border border-border bg-card shadow-sm"
            >
              <Quote className="absolute top-4 right-4 h-4 w-4 text-primary/10" />
              <div className="flex gap-0.5 mb-2">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary/70 text-primary/70" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
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
