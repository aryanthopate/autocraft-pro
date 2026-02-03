import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Loader2, Building2, CheckCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const keySchema = z.object({
  studioKey: z
    .string()
    .trim()
    .min(6, "Studio key must be at least 6 characters")
    .max(50, "Studio key is too long"),
});

export function JoinStudioCard() {
  const { user, profile, refetchProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [studioKey, setStudioKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = keySchema.safeParse({ studioKey });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (!user) return;

    setIsLoading(true);

    try {
      // Find studio by join key
      const { data: studioData, error: studioError } = await supabase
        .from("studios")
        .select("id, name")
        .eq("join_key", studioKey.toUpperCase())
        .maybeSingle();

      if (studioError || !studioData) {
        toast({
          variant: "destructive",
          title: "Invalid studio key",
          description: "The studio key you entered is not valid. Please check with your studio owner.",
        });
        setIsLoading(false);
        return;
      }

      // Get user metadata
      const metadata = user.user_metadata || {};

      // Create staff profile with pending status
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          studio_id: studioData.id,
          full_name: metadata.full_name || user.email?.split("@")[0] || "Staff",
          email: user.email!,
          phone: metadata.phone || null,
          role: "staff",
          status: "pending",
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not join studio. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Request submitted!",
        description: `You've requested to join ${studioData.name}. Please wait for the owner to approve your request.`,
      });

      await refetchProfile();
    } catch (error) {
      console.error("Join error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <CardTitle className="font-display text-2xl">Join a Studio</CardTitle>
          <CardDescription>
            Enter the studio join key provided by your studio owner to request access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studioKey">Studio Join Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="studioKey"
                  placeholder="Enter 8-character key"
                  value={studioKey}
                  onChange={(e) => setStudioKey(e.target.value.toUpperCase())}
                  className={`pl-10 font-mono uppercase ${error ? "border-destructive" : ""}`}
                  disabled={isLoading}
                  maxLength={20}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !studioKey}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting request...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Request to Join
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-medium text-foreground">What happens next?</span>
              <br />
              The studio owner will review your request. Once approved, you'll have full access to the dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
