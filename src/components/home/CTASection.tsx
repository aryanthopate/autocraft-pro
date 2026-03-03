import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Headphones, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: Database, title: "Data Migration", desc: "We move your existing data for free" },
  { icon: Headphones, title: "Live Support", desc: "Chat with our team in under 2 minutes" },
  { icon: Shield, title: "Help Center", desc: "Step-by-step guides and tutorials" },
];

export function CTASection() {
  return (
    <section className="py-14 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Support perks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-14"
        >
          {perks.map((perk) => (
            <div key={perk.title} className="text-center p-5 rounded-xl border border-border bg-card">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <perk.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{perk.title}</h3>
              <p className="text-xs text-muted-foreground">{perk.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-primary/20 bg-primary/[0.03] overflow-hidden"
        >
          <div className="px-8 py-12 sm:px-16 sm:py-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Experience the #1 Auto{" "}
              <span className="text-gradient-primary">Detailing Software</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Join hundreds of professionals who trust DetailFlow to
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
