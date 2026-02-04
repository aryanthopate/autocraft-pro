import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield } from "lucide-react";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login", { state: { from: "/admin" } });
        return;
      }

      // Check if user is in admins table using security definer function (bypasses RLS)
      const { data: adminId, error } = await supabase
        .rpc("check_is_admin", { p_user_id: user.id });

      if (error || !adminId) {
        // Get user's profile to determine where to redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        // Redirect based on role
        if (profile?.role === "owner") {
          navigate("/dashboard");
        } else {
          navigate("/staff");
        }
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-racing/20 text-racing mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-racing mx-auto mb-2" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
