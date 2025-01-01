import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  userRole: string;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: "",
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session) {
          setUser(null);
          setUserRole("");
          setIsLoading(false);
          return;
        }

        // Get user role
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setUser(null);
          setUserRole("");
          setIsLoading(false);
          return;
        }

        if (mounted) {
          setUser(session.user);
          setUserRole(profile?.role || "");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
        if (mounted) {
          setUser(null);
          setUserRole("");
          setIsLoading(false);
        }
      }
    }

    // Initialize auth state
    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (!mounted) return;

      setIsLoading(true);

      if (!session) {
        setUser(null);
        setUserRole("");
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          throw error;
        }

        if (mounted) {
          setUser(session.user);
          setUserRole(profile?.role || "");
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        if (mounted) {
          setUser(null);
          setUserRole("");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};