import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "DetailFlow transformed how we run our shop. Jobs never fall through the cracks now.",
    name: "Raj Mehta",
    role: "Studio Owner, Mumbai",
  },
  {
    quote: "The zone-based workflow is genius. My team knows exactly what to do without asking twice.",
    name: "Carlos Rivera",
    role: "Lead Detailer, Austin",
  },
  {
    quote: "Customers love the photo reports. Our referral rate jumped 40% in three months.",
    name: "Sarah Kim",
    role: "Operations Manager, Seoul",
  },
];

export function SocialProofStrip() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ minHeight: '400px' }}>
      <div className="section-divider mb-20" />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[80%] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--racing-red) / 0.3) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-racing text-racing" />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Trusted by <span className="text-racing font-semibold">500+</span> studios worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <motion.blockquote
              key={t.name}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 },
              }}
              className="relative p-6 rounded-xl border border-border bg-card/60 backdrop-blur-sm group hover:border-racing/30 transition-colors"
            >
              <Quote className="absolute top-4 right-4 h-6 w-6 text-racing/20 group-hover:text-racing/40 transition-colors" />
              <p className="text-sm text-foreground/90 leading-relaxed mb-4 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer>
                <p className="text-sm font-semibold font-display">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
