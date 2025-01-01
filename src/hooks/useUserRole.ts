import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserRole = () => {
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  useEffect(() => {
    getCurrentUserRole();
  }, []);

  const getCurrentUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      toast.error("Error fetching user role");
      return;
    }

    setCurrentUserRole(data.role);
  };

  return { currentUserRole };
};