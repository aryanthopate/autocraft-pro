import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-sm font-bold text-primary-foreground tracking-tighter">DF</span>
              </div>
              <span className="font-display text-xl font-bold">
                Detail<span className="text-primary">Flow</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              Professional job management software for car detailing studios.
              Streamline your workflow, delight your customers, and scale with confidence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Get Started</Link></li>
              <li><Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link to="/track" className="text-sm text-muted-foreground hover:text-primary transition-colors">Track Vehicle</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-muted-foreground cursor-default">Privacy Policy</span></li>
              <li><span className="text-sm text-muted-foreground cursor-default">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DetailFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
