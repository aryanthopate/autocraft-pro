import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function PublicFooter() {
  return (
    <footer className="relative border-t border-border bg-card/50 overflow-hidden">
      {/* Red accent top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-racing/40 to-transparent" />

      {/* Subtle red glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[80%] opacity-[0.04] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center bottom, hsl(var(--racing-red)) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-racing to-racing-dark">
                <span className="font-display text-sm font-bold text-white tracking-tighter">DF</span>
              </div>
              <span className="font-display text-xl font-bold">
                Detail<span className="text-racing">Flow</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-6">
              Professional job management software for car detailing studios.
              Streamline your workflow, delight your customers, and scale with confidence.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-racing/20 to-transparent" />
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-sm uppercase tracking-wider text-foreground/70">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/features"
                  className="text-sm text-muted-foreground hover:text-racing transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-sm text-muted-foreground hover:text-racing transition-colors"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-racing transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-5 text-sm uppercase tracking-wider text-foreground/70">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-muted-foreground cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-14 pt-8 border-t border-border"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} DetailFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-racing animate-pulse" />
              <span className="text-xs text-muted-foreground">Systems Operational</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
