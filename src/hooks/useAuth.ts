import { useEffect, useState, useCallback } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data: adminId } = await supabase
        .rpc("check_is_admin", { p_user_id: userId });
      return !!adminId;
    } catch {
      return false;
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return null;
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
        return profileData;
      }
      return null;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Listener for ONGOING auth changes (does NOT control isLoading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Fire and forget - don't await, don't set loading
        if (newSession?.user) {
          setTimeout(() => {
            if (!isMounted) return;
            checkAdminRole(newSession.user.id).then(admin => {
              if (isMounted) setIsAdmin(admin);
            });
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setStudio(null);
          setIsAdmin(false);
        }
      }
    );

    // INITIAL load (controls isLoading)
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        // Fetch role BEFORE setting loading false
        if (existingSession?.user) {
          const [adminStatus] = await Promise.all([
            checkAdminRole(existingSession.user.id),
            fetchProfile(existingSession.user.id),
          ]);
          if (isMounted) setIsAdmin(adminStatus);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setStudio(null);
    setIsAdmin(false);
  };

  const isOwner = profile?.role === "owner";
  const isStaff = profile?.role === "staff";
  const isMechanic = profile?.role === "mechanic";
  const isApproved = profile?.status === "approved";
  const isPending = profile?.status === "pending";

  // Helper to get dashboard route based on role
  const getDashboardRoute = useCallback(() => {
    // Admins go to admin panel
    if (isAdmin) return "/admin";
    
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
  }, [isAdmin, profile]);

  return {
    user,
    session,
    profile,
    studio,
    loading,
    isAdmin,
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
