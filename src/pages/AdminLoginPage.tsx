import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
          });
        } else if (authError.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email not verified",
            description: "Please check your email and verify your account.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: authError.message,
          });
        }
        return;
      }

      if (authData.user) {
        // Check if user is in admins table
        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("id")
          .eq("user_id", authData.user.id)
          .maybeSingle();

        if (adminError || !adminData) {
          // Sign out if not an admin
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "This account is not registered as an admin.",
          });
          return;
        }

        toast({
          title: "Welcome back, Admin!",
          description: "You have been logged in successfully.",
        });
        navigate("/admin");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-racing">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">DetailFlow Admin</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Admin Login</h1>
            <p className="text-muted-foreground">
              Sign in to access the admin control panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={errors.email ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/admin-forgot-password"
                  className="text-sm text-muted-foreground hover:text-racing transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-racing hover:bg-racing/90"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in to Admin Panel"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an admin account?{" "}
            <Link
              to="/admin-signup"
              className="font-medium text-racing hover:underline"
            >
              Register as Admin
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to regular login
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-card border-l border-border items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-racing/10 text-racing mx-auto mb-8">
            <Shield className="h-10 w-10" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-4">
            Admin Control Panel
          </h2>
          <p className="text-muted-foreground">
            Manage all studios, users, and system settings from a centralized dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
