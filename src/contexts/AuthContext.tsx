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

  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{
              id: userId,
              role: "reader"
            }]);

          if (insertError) throw insertError;
          return "reader";
        }
        throw error;
      }

      return profile?.role || "reader";
    } catch (error) {
      console.error("Error in checkUserProfile:", error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("AuthProvider: Initializing...");

    const handleSession = async (session: any) => {
      try {
        if (!session) {
          if (mounted) {
            setUser(null);
            setUserRole("");
            setIsLoading(false);
          }
          return;
        }

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

  return (
    <AuthContext.Provider value={{ user, userRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};