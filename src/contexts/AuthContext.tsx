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

    const fetchUserRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) throw error;
        return data?.role || "";
      } catch (error) {
        console.error("Error fetching user role:", error);
        return "";
      }
    };

    const handleAuthStateChange = async (session: any) => {
      console.log("Auth state change handler called", { session });
      
      if (!mounted) {
        console.log("Component unmounted, skipping state update");
        return;
      }

      try {
        if (!session) {
          console.log("No session found, clearing auth state");
          setUser(null);
          setUserRole("");
          return;
        }

        const role = await fetchUserRole(session.user.id);
        console.log("Fetched user role:", role);
        
        if (mounted) {
          setUser(session.user);
          setUserRole(role);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        if (mounted) {
          setUser(null);
          setUserRole("");
        }
      }
    };

    // Initial auth check
    console.log("Starting initial auth check");
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(session).finally(() => {
        if (mounted) {
          console.log("Initial auth check complete, setting loading to false");
          setIsLoading(false);
        }
      });
    });

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event);
        if (mounted) {
          setIsLoading(true);
          await handleAuthStateChange(session);
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log("Cleaning up auth context");
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