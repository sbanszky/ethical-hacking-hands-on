import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { handleAuthStateChange } from "@/utils/authUtils";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log("useAuthState: Initializing...");

    const updateState = async (session: any) => {
      if (!mounted) return;
      
      setIsLoading(true);
      const state = await handleAuthStateChange(session);
      
      if (!mounted) return;
      
      setUser(state.user);
      setUserRole(state.userRole);
      setIsLoading(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session found" : "No session");
      updateState(session);
    });

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      updateState(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, userRole, isLoading };
};