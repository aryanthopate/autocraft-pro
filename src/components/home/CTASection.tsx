import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-primary/20 overflow-hidden"
        >
          {/* Glow background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 100%, hsl(38 92% 50% / 0.08) 0%, transparent 60%)",
            }}
          />
          <div className="absolute inset-0 bg-card/80" />

          {/* Racing stripe accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="relative px-8 py-20 sm:px-16 sm:py-24 text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Ready to Run Your Studio{" "}
              <span className="text-gradient-primary">Like a Pro?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Join hundreds of detailing professionals who trust DetailFlow to
              deliver flawless results, every time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="premium" size="xl" asChild className="group">
                <Link to="/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
