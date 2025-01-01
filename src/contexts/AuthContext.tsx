import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

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
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log("AuthProvider: Initializing...");

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error("AuthProvider: Session error:", sessionError);
          setIsLoading(false);
          return;
        }

        if (!session) {
          console.log("AuthProvider: No session found");
          setIsLoading(false);
          return;
        }

        console.log("AuthProvider: Session found, checking profile...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!mounted) return;

        if (profileError) {
          console.error("AuthProvider: Profile error:", profileError);
          toast.error("Error fetching user profile");
          setIsLoading(false);
          return;
        }

        setUser(session.user);
        setUserRole(profile?.role || "reader");
        console.log("AuthProvider: Auth check complete", { role: profile?.role });
      } catch (error) {
        console.error("AuthProvider: Unexpected error:", error);
        if (mounted) {
          toast.error("An unexpected error occurred");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthProvider: Auth state changed:", event);
      
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setUserRole("");
        setIsLoading(false);
        return;
      }

      if (event === "SIGNED_IN" && session) {
        setIsLoading(true);
        await checkAuth();
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