import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Headphones, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: Zap, text: "Setup in under 5 minutes" },
  { icon: Headphones, text: "Live chat support" },
  { icon: Shield, text: "Free data migration" },
];

export function CTASection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-card to-accent/[0.04] overflow-hidden"
        >
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

          <div className="relative px-8 py-14 sm:px-16 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Ready to Run Your Shop{" "}
              <span className="text-gradient-primary">Like a Pro?</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm sm:text-base">
              Join hundreds of professionals who trust DetailFlow to deliver flawless results, every time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Button size="lg" asChild className="font-semibold shadow-lg shadow-primary/25 h-12 px-8 text-base">
                <Link to="/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-12 px-8 text-base">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {perks.map((perk) => (
                <span key={perk.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <perk.icon className="h-4 w-4 text-primary" />
                  {perk.text}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
