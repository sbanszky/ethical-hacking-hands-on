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
          setUser(null);
          setUserRole("");
          setIsLoading(false);
          return;
        }

        if (!session) {
          console.log("AuthProvider: No session found");
          setUser(null);
          setUserRole("");
          setIsLoading(false);
          return;
        }

        console.log("AuthProvider: Session found, checking profile...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!mounted) return;

        if (profileError) {
          console.error("AuthProvider: Profile error:", profileError);
          // If profile doesn't exist, create it with default role
          if (profileError.code === "PGRST116") {
            const { error: insertError } = await supabase
              .from("profiles")
              .insert([{
                id: session.user.id,
                role: "reader",
                email: session.user.email
              }]);

            if (!mounted) return;

            if (insertError) {
              console.error("AuthProvider: Profile creation error:", insertError);
              toast.error("Error creating user profile");
              setUser(null);
              setUserRole("");
              setIsLoading(false);
              return;
            }

            setUser(session.user);
            setUserRole("reader");
            setIsLoading(false);
            return;
          }
          
          toast.error("Error fetching user profile");
          setUser(null);
          setUserRole("");
          setIsLoading(false);
          return;
        }

        setUser(session.user);
        setUserRole(profile?.role || "reader");
        console.log("AuthProvider: Auth check complete", { user: session.user.id, role: profile?.role });
      } catch (error) {
        console.error("AuthProvider: Unexpected error:", error);
        if (mounted) {
          toast.error("An unexpected error occurred");
          setUser(null);
          setUserRole("");
          setIsLoading(false);
        }
      }
    };

    // Initial auth check
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthProvider: Auth state changed:", event);
      
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        console.log("AuthProvider: User signed out or session ended");
        setUser(null);
        setUserRole("");
        setIsLoading(false);
        return;
      }

      if (event === "SIGNED_IN") {
        console.log("AuthProvider: User signed in, checking auth...");
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