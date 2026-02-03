import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Car,
  Users,
  ClipboardCheck,
  Camera,
  Shield,
  Smartphone,
  Truck,
  FileText,
  History,
  UserCheck,
  Bell,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";

const featureCategories = [
  {
    title: "Job Management",
    description: "Complete workflow from intake to delivery",
    features: [
      {
        icon: Car,
        title: "Visual Car Customization",
        description:
          "Tap on zones to document work needed. Add photos, videos, voice notes, and detailed service instructions for each area.",
      },
      {
        icon: ClipboardCheck,
        title: "Service Checklists",
        description:
          "Create standardized checklists for different service packages. Workers follow step-by-step instructions.",
      },
      {
        icon: Camera,
        title: "Media Documentation",
        description:
          "Capture before and after photos, short videos, and voice notes. All media linked to specific jobs and zones.",
      },
      {
        icon: Truck,
        title: "Pickup & Drop-off",
        description:
          "Document vehicle condition at intake. Record existing damage with photos and notes.",
      },
    ],
  },
  {
    title: "Customer & Vehicle Management",
    description: "Complete history for every customer and car",
    features: [
      {
        icon: Users,
        title: "Customer Database",
        description:
          "Manage customers by phone number. One customer can own multiple vehicles with separate histories.",
      },
      {
        icon: History,
        title: "Service History",
        description:
          "Permanent service records for every vehicle. View complete history including all work done and media.",
      },
      {
        icon: Shield,
        title: "Customer Portal",
        description:
          "Generate secure view-only links. Customers see their details, car info, job status, and before/after photos.",
      },
      {
        icon: FileText,
        title: "Billing & Invoices",
        description:
          "Generate professional invoices for completed work. Track payment status and service costs.",
      },
    ],
  },
  {
    title: "Team & Studio Management",
    description: "Role-based access for your entire team",
    features: [
      {
        icon: Layers,
        title: "Multi-tenant Architecture",
        description:
          "Each studio operates in complete isolation. Your data never mixes with other studios.",
      },
      {
        icon: UserCheck,
        title: "Staff Approval System",
        description:
          "Staff request access with a Studio Key. Owners approve, assign roles, and set granular permissions.",
      },
      {
        icon: Bell,
        title: "Notifications",
        description:
          "Alert customers when jobs are complete. Notify owners when workers submit for review.",
      },
      {
        icon: Smartphone,
        title: "Mobile Ready",
        description:
          "Workers update status and upload media from any device. Built for the workshop floor.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 gradient-radial-dark" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            >
              Features Built for{" "}
              <span className="text-gradient-primary">Real Studios</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              Every feature designed by detailing professionals who understand 
              what it takes to run a successful operation.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, categoryIndex) => (
        <section
          key={category.title}
          className={`py-20 lg:py-28 ${
            categoryIndex % 2 === 1 ? "bg-card/50" : ""
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                {category.title}
              </h2>
              <p className="text-muted-foreground">{category.description}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {category.features.map((feature, featureIndex) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: featureIndex * 0.1,
                  }}
                  className="p-6 rounded-xl border border-border bg-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Start your free trial today. No credit card required.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
