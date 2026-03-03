import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Headphones, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: Database, title: "Data Migration", desc: "We move your existing data for free" },
  { icon: Headphones, title: "Live Support", desc: "Chat with our team in under 2 minutes" },
  { icon: Shield, title: "Help Center", desc: "Step-by-step guides and video tutorials" },
];

export function CTASection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Support perks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20"
        >
          {perks.map((perk) => (
            <div key={perk.title} className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <perk.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold mb-1">{perk.title}</h3>
              <p className="text-sm text-muted-foreground">{perk.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl border border-primary/20 bg-primary/[0.03] overflow-hidden"
        >
          <div className="px-8 py-16 sm:px-16 sm:py-20 text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Experience the #1 Auto{" "}
              <span className="text-gradient-primary">Detailing Software</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Join hundreds of detailing professionals who trust DetailFlow to
              deliver flawless results, every time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild className="font-semibold shadow-lg shadow-primary/20">
                <Link to="/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
