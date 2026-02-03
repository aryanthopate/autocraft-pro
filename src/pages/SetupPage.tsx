import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function SetupPage() {
  const { user, profile, loading, refetchProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    // If profile already exists, redirect appropriately
    if (profile) {
      if (profile.status === "approved" || profile.role === "owner") {
        navigate("/dashboard");
      } else if (profile.status === "pending") {
        navigate("/pending-approval");
      }
      return;
    }

    // Check if this is an owner or staff signup
    const metadata = user.user_metadata || {};
    
    // Staff without studio_key go to onboarding to enter key
    if (metadata.role === "staff" && !metadata.studio_key) {
      navigate("/staff-onboarding");
      return;
    }

    // Create profile for new user (owner or staff with key)
    setupProfile();
  }, [user, profile, loading]);

  const setupProfile = async () => {
    if (!user || isSettingUp) return;
    
    setIsSettingUp(true);
    
    try {
      const metadata = user.user_metadata || {};
      const isOwner = metadata.role === "owner";
      const studioName = metadata.studio_name;
      const studioKey = metadata.studio_key;

      if (isOwner && studioName) {
        // Create studio and owner profile
        const joinKey = await generateJoinKey();
        
        // Create studio
        const { data: studioData, error: studioError } = await supabase
          .from("studios")
          .insert({
            name: studioName,
            join_key: joinKey,
            owner_id: user.id,
            email: user.email,
            phone: metadata.phone,
          })
          .select()
          .single();

        if (studioError) {
          console.error("Error creating studio:", studioError);
          toast({
            variant: "destructive",
            title: "Setup failed",
            description: "Could not create your studio. Please try again.",
          });
          return;
        }

        // Create owner profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            studio_id: studioData.id,
            full_name: metadata.full_name || user.email?.split("@")[0] || "Owner",
            email: user.email!,
            phone: metadata.phone,
            role: "owner",
            status: "approved",
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast({
            variant: "destructive",
            title: "Setup failed",
            description: "Could not create your profile. Please try again.",
          });
          return;
        }

        toast({
          title: "Studio created!",
          description: `Your studio "${studioName}" is ready.`,
        });

        await refetchProfile();
        navigate("/dashboard");

      } else if (studioKey) {
        // Staff joining a studio
        const { data: studioData, error: studioError } = await supabase
          .from("studios")
          .select("id")
          .eq("join_key", studioKey.toUpperCase())
          .maybeSingle();

        if (studioError || !studioData) {
          toast({
            variant: "destructive",
            title: "Invalid studio key",
            description: "The studio key you entered is not valid.",
          });
          navigate("/join");
          return;
        }

        // Create staff profile with pending status
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            studio_id: studioData.id,
            full_name: metadata.full_name || user.email?.split("@")[0] || "Staff",
            email: user.email!,
            phone: metadata.phone,
            role: "staff",
            status: "pending",
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast({
            variant: "destructive",
            title: "Setup failed",
            description: "Could not create your profile. Please try again.",
          });
          return;
        }

        await refetchProfile();
        navigate("/pending-approval");

      } else {
        // Unknown signup type - shouldn't happen
        toast({
          variant: "destructive",
          title: "Setup error",
          description: "Invalid account type. Please sign up again.",
        });
        await supabase.auth.signOut();
        navigate("/signup");
      }
    } catch (error) {
      console.error("Setup error:", error);
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const generateJoinKey = async (): Promise<string> => {
    // Generate random 8-character alphanumeric key
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let key = "";
    for (let i = 0; i < 8; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-6">
          <Sparkles className="h-10 w-10" />
        </div>

        <h1 className="font-display text-3xl font-bold mb-4">
          Setting Up Your Account
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Please wait while we configure your workspace...
        </p>

        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      </motion.div>
    </div>
  );
}
