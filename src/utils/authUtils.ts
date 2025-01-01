import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const checkUserProfile = async (userId: string) => {
  try {
    console.log("Checking user profile for:", userId);
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error checking profile:", error);
      throw error;
    }

    if (!profile) {
      console.log("Profile not found, creating new profile");
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([{
          id: userId,
          role: "reader"
        }]);

      if (insertError) {
        console.error("Error creating profile:", insertError);
        throw insertError;
      }
      return "reader";
    }

    console.log("Profile found:", profile);
    return profile.role;
  } catch (error) {
    console.error("Error in checkUserProfile:", error);
    throw error;
  }
};

export const handleAuthStateChange = async (session: any) => {
  if (!session) {
    console.log("No session found");
    return { user: null, userRole: "", isLoading: false };
  }

  try {
    console.log("Session found, checking profile");
    const role = await checkUserProfile(session.user.id);
    return {
      user: session.user,
      userRole: role,
      isLoading: false
    };
  } catch (error) {
    console.error("Error in handleAuthStateChange:", error);
    toast.error("Error checking user profile");
    return { user: null, userRole: "", isLoading: false };
  }
};