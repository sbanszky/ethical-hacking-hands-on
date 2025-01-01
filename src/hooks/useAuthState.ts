import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const checkUserProfile = async (userId: string) => {
    try {
      console.log("Checking user profile for:", userId);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Profile not found, creating new profile");
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{
              id: userId,
              role: "reader"
            }]);

          if (insertError) {
            console.error("Error creating profile:", insertError);
            throw insertError;
          }
          return "reader";
        }
        throw error;
      }

      console.log("Profile found:", profile);
      return profile?.role || "reader";
    } catch (error) {
      console.error("Error in checkUserProfile:", error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("useAuthState: Initializing...");

    const handleSession = async (session: any) => {
      try {
        if (!session) {
          console.log("No session found");
          if (mounted) {
            setUser(null);
            setUserRole("");
            setIsLoading(false);
          }
          return;
        }

        console.log("Session found, checking profile");
        const role = await checkUserProfile(session.user.id);
        
        if (mounted) {
          setUser(session.user);
          setUserRole(role);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in handleSession:", error);
        if (mounted) {
          toast.error("Error checking user profile");
          setUser(null);
          setUserRole("");
          setIsLoading(false);
        }
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session found" : "No session");
      handleSession(session);
    });

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      handleSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, userRole, isLoading };
};