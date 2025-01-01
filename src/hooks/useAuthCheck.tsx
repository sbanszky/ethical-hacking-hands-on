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
        console.log("Starting auth check...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast.error("Authentication error. Please log in again.");
          setIsLoading(false);
          navigate("/login");
          return;
        }

        if (!session) {
          console.log("No session found, redirecting to login");
          setIsLoading(false);
          navigate("/login");
          return;
        }

        console.log("Session found, checking profile...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          toast.error("Error fetching user profile");
          setIsLoading(false);
          return;
        }

        if (!profile) {
          console.log("No profile found, creating new profile");
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ 
              id: session.user.id,
              role: 'reader',
              email: session.user.email
            }]);

          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast.error("Error creating user profile");
            setIsLoading(false);
            return;
          }

          setUserRole('reader');
          setIsLoading(false);
          navigate("/username-setup");
        } else if (!profile.username) {
          console.log("Profile found but no username, redirecting to setup");
          setUserRole(profile.role);
          setIsLoading(false);
          navigate("/username-setup");
        } else {
          console.log("Profile complete, setting role:", profile.role);
          setUserRole(profile.role);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        toast.error("Error checking authentication");
        setIsLoading(false);
        navigate("/login");
      }
    };

    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === 'SIGNED_OUT' || !session) {
        setIsLoading(false);
        navigate("/login");
      } else if (session) {
        await checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { userRole, isLoading };
};