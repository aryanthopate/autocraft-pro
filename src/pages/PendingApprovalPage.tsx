import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function PendingApprovalPage() {
  const { user, profile, signOut, isApproved, isOwner, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      navigate("/login");
      return;
    }

    if (!loading && (isApproved || isOwner)) {
      navigate("/dashboard");
    }
  }, [user, profile, isApproved, isOwner, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10 text-warning mx-auto mb-6">
          <Clock className="h-10 w-10" />
        </div>

        <h1 className="font-display text-3xl font-bold mb-4">
          Awaiting Approval
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Your request to join the studio has been submitted. The studio owner 
          will review your request and grant access.
        </p>

        <div className="p-4 rounded-lg bg-card border border-border mb-8">
          <p className="text-sm text-muted-foreground">
            You'll be able to access the dashboard once your request is approved.
            Check back later or contact your studio owner.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Check Status
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm">DetailFlow</span>
        </div>
      </motion.div>
    </div>
  );
}
