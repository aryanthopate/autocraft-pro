import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Sparkles, Shield } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

interface ForgotPasswordPageProps {
  isAdmin?: boolean;
}

export default function ForgotPasswordPage({ isAdmin = false }: ForgotPasswordPageProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password${isAdmin ? "?admin=true" : ""}`;
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: resetError.message,
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isAdmin ? Shield : Sparkles;
  const backLink = isAdmin ? "/admin-login" : "/login";
  const title = isAdmin ? "DetailFlow Admin" : "DetailFlow";

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isAdmin ? "bg-racing" : "bg-primary"}`}>
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">{title}</span>
          </Link>

          {emailSent ? (
            <div className="text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isAdmin ? "bg-racing/10 text-racing" : "bg-primary/10 text-primary"} mx-auto mb-6`}>
                <Mail className="h-8 w-8" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">Check your email</h1>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className={`font-medium ${isAdmin ? "text-racing" : "text-primary"} hover:underline`}
                >
                  try again
                </button>
              </p>
              <Link to={backLink}>
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold mb-2">Forgot password?</h1>
                <p className="text-muted-foreground">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={error ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className={`w-full ${isAdmin ? "bg-racing hover:bg-racing/90" : ""}`}
                  variant={isAdmin ? "default" : "hero"}
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to={backLink}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-card border-l border-border items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${isAdmin ? "bg-racing/10 text-racing" : "bg-primary/10 text-primary"} mx-auto mb-8`}>
            <Icon className="h-10 w-10" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-4">
            {isAdmin ? "Admin Control Panel" : "Professional Detailing Software"}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin 
              ? "Manage all studios, users, and system settings from a centralized dashboard."
              : "Manage your studio, track every job, and deliver exceptional results to your customers."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
