import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireOwner?: boolean;
  requireApproved?: boolean;
  allowedRoles?: ("owner" | "staff" | "mechanic")[];
}

export function ProtectedRoute({
  children,
  requireOwner = false,
  requireApproved = true,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, profile, loading, isOwner, isApproved, isPending, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!profile) {
      // User exists but no profile - check if staff needs onboarding
      const metadata = user.user_metadata || {};
      if (metadata.role === "staff" || metadata.role === "mechanic") {
        if (!metadata.studio_key) {
          navigate("/staff-onboarding");
        } else {
          navigate("/setup");
        }
      } else {
        navigate("/setup");
      }
      return;
    }

    if (requireApproved && !isApproved && !isOwner) {
      // Staff/mechanic needs approval
      if (isPending) {
        navigate("/pending-approval");
      } else {
        navigate("/access-denied");
      }
      return;
    }

    if (requireOwner && !isOwner) {
      navigate(getDashboardRoute());
      return;
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = profile.role;
      if (!allowedRoles.includes(userRole)) {
        navigate(getDashboardRoute());
        return;
      }
    }
  }, [user, profile, loading, isOwner, isApproved, isPending, requireOwner, requireApproved, allowedRoles, navigate, location, getDashboardRoute]);

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

  // Check role access
  if (allowedRoles && allowedRoles.length > 0 && profile) {
    if (!allowedRoles.includes(profile.role)) {
      return null;
    }
  }

  return <>{children}</>;
}
