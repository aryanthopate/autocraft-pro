import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  user_id: string;
  studio_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  role: "owner" | "staff" | "mechanic";
  status: "pending" | "approved" | "rejected";
  permissions: Record<string, boolean>;
  avatar_url: string | null;
}

export interface Studio {
  id: string;
  name: string;
  join_key: string;
  owner_id: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Defer profile fetch with setTimeout to avoid deadlock
        if (newSession?.user) {
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setStudio(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setLoading(false);
        return;
      }

      if (profileData) {
        setProfile(profileData as unknown as UserProfile);

        // Fetch studio if profile has studio_id
        if (profileData.studio_id) {
          const { data: studioData, error: studioError } = await supabase
            .from("studios")
            .select("*")
            .eq("id", profileData.studio_id)
            .maybeSingle();

          if (!studioError && studioData) {
            setStudio(studioData as unknown as Studio);
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setStudio(null);
  };

  const isOwner = profile?.role === "owner";
  const isStaff = profile?.role === "staff";
  const isMechanic = profile?.role === "mechanic";
  const isApproved = profile?.status === "approved";
  const isPending = profile?.status === "pending";

  // Helper to get dashboard route based on role
  const getDashboardRoute = () => {
    if (!profile) return "/dashboard";
    switch (profile.role) {
      case "owner":
        return "/dashboard";
      case "staff":
        return "/staff";
      case "mechanic":
        return "/mechanic";
      default:
        return "/dashboard";
    }
  };

  return {
    user,
    session,
    profile,
    studio,
    loading,
    signOut,
    isOwner,
    isStaff,
    isMechanic,
    isApproved,
    isPending,
    isAuthenticated: !!user,
    refetchProfile: () => user && fetchProfile(user.id),
    getDashboardRoute,
  };
}
