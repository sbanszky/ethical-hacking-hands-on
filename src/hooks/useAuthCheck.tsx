import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Session check in useAuthCheck:", session);
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate("/login");
          return;
        }

        if (!session) {
          console.log("No session found in useAuthCheck, redirecting to login");
          navigate("/login");
          return;
        }

        // Fetch user profile with explicit UUID casting
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        console.log("Profile fetch result:", { profile, profileError });

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Error fetching user role");
          return;
        }

        // If no profile exists, create one with reader role
        if (!profile) {
          console.log("No profile found, creating new profile with reader role");
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ 
              id: session.user.id,
              role: 'reader'
            }]);

          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast.error("Error creating user profile");
            return;
          }

          setUserRole('reader');
        } else {
          setUserRole(profile.role);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check error:", error);
        toast.error("Error checking authentication");
        navigate("/login");
      }
    };

    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in useAuthCheck:", event, session);
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { userRole, isLoading };
};