import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <span className="font-display text-[10px] font-extrabold text-primary-foreground">DF</span>
              </div>
              <span className="font-display text-base font-bold">
                Detail<span className="text-primary">Flow</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
              Professional job management for car detailing studios. Streamline your workflow and scale with confidence.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-xs text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/signup" className="text-xs text-muted-foreground hover:text-primary transition-colors">Get Started</Link></li>
              <li><Link to="/track" className="text-xs text-muted-foreground hover:text-primary transition-colors">Track Vehicle</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-xs text-muted-foreground cursor-default">Privacy Policy</span></li>
              <li><span className="text-xs text-muted-foreground cursor-default">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} DetailFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-muted-foreground">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
