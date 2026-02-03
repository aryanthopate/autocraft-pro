import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Car, 
  Users, 
  ClipboardCheck, 
  Camera, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";

const features = [
  {
    icon: Car,
    title: "Visual Car Customization",
    description: "Zone-based job creation with photo documentation for every detail.",
  },
  {
    icon: Users,
    title: "Multi-tenant Architecture",
    description: "Each studio operates in complete isolation with role-based access.",
  },
  {
    icon: ClipboardCheck,
    title: "Job Management",
    description: "Track every job from intake to delivery with detailed checklists.",
  },
  {
    icon: Camera,
    title: "Media Documentation",
    description: "Before and after photos, videos, and voice notes for every service.",
  },
  {
    icon: Shield,
    title: "Customer Portal",
    description: "Secure view-only links for customers to track their vehicle status.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Workers can update job status and upload media from any device.",
  },
];

const benefits = [
  "Complete service history for every vehicle",
  "Staff approval and permission management",
  "Pickup and drop-off documentation",
  "Professional billing and invoicing",
  "Customer communication automation",
  "Real-time job status tracking",
];

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-radial-dark" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                Professional Detailing Software
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6"
            >
              Run Your Detailing Studio{" "}
              <span className="text-gradient-primary">Like a Pro</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              The complete job management platform for car detailing studios. 
              Track every vehicle, manage your team, and deliver exceptional results.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/features">See All Features</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Grid */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for car detailing studios, with features designed 
              by industry professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-xl border border-border bg-card hover:bg-surface-elevated transition-colors duration-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 lg:py-32 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Built for Studios That{" "}
                <span className="text-gradient-primary">Mean Business</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you're a single-bay operation or a multi-location enterprise, 
                DetailFlow scales with your business.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-border overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Car className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="font-display text-xl font-semibold">
                      Visual Job Management
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Coming soon: Interactive preview
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
            
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Studio?
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Join hundreds of detailing professionals who trust DetailFlow 
                to run their operations.
              </p>
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
