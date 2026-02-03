import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireOwner?: boolean;
  requireApproved?: boolean;
}

export function ProtectedRoute({
  children,
  requireOwner = false,
  requireApproved = true,
}: ProtectedRouteProps) {
  const { user, profile, loading, isOwner, isApproved, isPending } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!profile) {
      // User exists but no profile - they need to complete setup
      navigate("/setup");
      return;
    }

    if (requireApproved && !isApproved && !isOwner) {
      // Staff needs approval
      if (isPending) {
        navigate("/pending-approval");
      } else {
        navigate("/access-denied");
      }
      return;
    }

    if (requireOwner && !isOwner) {
      navigate("/dashboard");
      return;
    }
  }, [user, profile, loading, isOwner, isApproved, isPending, requireOwner, requireApproved, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (requireApproved && !isApproved && !isOwner) || (requireOwner && !isOwner)) {
    return null;
  }

  return <>{children}</>;
}
