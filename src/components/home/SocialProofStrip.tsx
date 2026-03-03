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
    <section className="py-24 relative overflow-hidden">
      <div className="section-divider mb-20" />

      {/* Red ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[80%] opacity-[0.06] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--racing-red) / 0.4) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              >
                <Star className="h-5 w-5 fill-racing text-racing" />
              </motion.div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Trusted by <span className="text-racing font-semibold">500+</span> studios worldwide
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((t) => (
            <motion.blockquote
              key={t.name}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative p-6 rounded-xl border border-border bg-card/60 backdrop-blur-sm group hover:border-racing/30 transition-all duration-300"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 50% 100%, hsl(var(--racing-red) / 0.06) 0%, transparent 70%)",
                }}
              />
              <Quote className="absolute top-4 right-4 h-6 w-6 text-racing/15 group-hover:text-racing/30 transition-colors" />
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-racing/60 text-racing/60" />
                ))}
              </div>
              <p className="relative text-sm text-foreground/90 leading-relaxed mb-5 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="relative">
                <p className="text-sm font-semibold font-display">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
