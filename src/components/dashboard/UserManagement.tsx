import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/profile";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRoleSelect } from "./UserRoleSelect";

const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { currentUserRole } = useUserRole();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    console.log("Fetching profiles...");
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        role,
        username,
        avatar_url,
        created_at,
        email
      `)
      .order("created_at");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      toast.error("Error fetching users");
      return;
    }

    if (!profilesData) {
      console.log("No profiles found");
      setProfiles([]);
      return;
    }

    console.log("Fetched profiles:", profilesData);
    setProfiles(profilesData);
  };

  if (currentUserRole !== "admin") {
    return null;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <div className="flex flex-col">
              <span className="text-sm text-gray-300">{profile.email}</span>
              <span>{profile.username || "No username set"}</span>
            </div>
            <UserRoleSelect profile={profile} onRoleUpdate={fetchProfiles} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;