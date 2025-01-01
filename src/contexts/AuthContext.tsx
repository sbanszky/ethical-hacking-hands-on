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
    console.log("AuthProvider: Initializing...");

    const checkUserRole = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          return "";
        }

        return profile?.role || "";
      } catch (error) {
        console.error("Unexpected error checking user role:", error);
        return "";
      }
    };

    const handleAuthChange = async (session: any) => {
      if (!mounted) return;
      
      if (!session) {
        console.log("AuthProvider: No session found, clearing state");
        setUser(null);
        setUserRole("");
        setIsLoading(false);
        return;
      }

      try {
        console.log("AuthProvider: Session found, fetching role");
        const role = await checkUserRole(session.user.id);
        
        if (mounted) {
          setUser(session.user);
          setUserRole(role);
        }
      } catch (error) {
        console.error("Error in handleAuthChange:", error);
        toast.error("Error checking authentication");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthProvider: Initial session check:", session ? "Session found" : "No session");
      handleAuthChange(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthProvider: Auth state changed:", _event);
      handleAuthChange(session);
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