import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log("useAuthCheck: Starting authentication check...");

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log("useAuthCheck: Component unmounted, stopping auth check");
          return;
        }

        if (sessionError) {
          console.error("useAuthCheck: Session error:", sessionError);
          toast.error("Authentication error occurred");
          setIsLoading(false);
          navigate("/login");
          return;
        }

        if (!session) {
          console.log("useAuthCheck: No session found, redirecting to login");
          setIsLoading(false);
          navigate("/login");
          return;
        }

        console.log("useAuthCheck: Session found, checking profile...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", session.user.id)
          .single();

        if (!mounted) return;

        if (profileError) {
          console.error("useAuthCheck: Profile error:", profileError);
          if (profileError.code === "PGRST116") {
            console.log("useAuthCheck: Creating new profile...");
            const { error: insertError } = await supabase
              .from("profiles")
              .insert([{
                id: session.user.id,
                role: "reader",
                email: session.user.email
              }]);

            if (insertError) {
              console.error("useAuthCheck: Profile creation error:", insertError);
              toast.error("Error creating user profile");
              setIsLoading(false);
              return;
            }

            setUserRole("reader");
            setIsLoading(false);
            navigate("/username-setup");
            return;
          }
          
          toast.error("Error fetching user profile");
          setIsLoading(false);
          return;
        }

        if (!profile.username) {
          console.log("useAuthCheck: No username set, redirecting to setup");
          setUserRole(profile.role);
          setIsLoading(false);
          navigate("/username-setup");
          return;
        }

        console.log("useAuthCheck: Profile complete, role:", profile.role);
        setUserRole(profile.role);
        setIsLoading(false);
      } catch (error) {
        console.error("useAuthCheck: Unexpected error:", error);
        if (mounted) {
          toast.error("An unexpected error occurred");
          setIsLoading(false);
          navigate("/login");
        }
      }
    };

    // Initial auth check
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("useAuthCheck: Auth state changed:", event);
      
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        console.log("useAuthCheck: User signed out or session ended");
        setUserRole("");
        setIsLoading(false);
        navigate("/login");
        return;
      }

      if (event === "SIGNED_IN") {
        console.log("useAuthCheck: User signed in, checking auth...");
        setIsLoading(true);
        await checkAuth();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { userRole, isLoading };
};