import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/profile";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRoleSelect } from "./UserRoleSelect";
import { User } from "@supabase/supabase-js";

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
      .select("*")
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

    // Fetch emails separately since we can't join with auth.users
    const userEmails = new Map<string, string>();
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching user emails:", userError);
    } else if (userData?.users) {
      userData.users.forEach((user: User) => {
        userEmails.set(user.id, user.email || "No email available");
      });
    }

    // Combine profile data with emails
    const profilesWithEmails = profilesData.map(profile => ({
      ...profile,
      user: {
        email: userEmails.get(profile.id) || "No email available"
      }
    }));

    console.log("Fetched profiles with emails:", profilesWithEmails);
    setProfiles(profilesWithEmails);
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
            <span>{profile.user?.email || "No email available"}</span>
            <UserRoleSelect profile={profile} onRoleUpdate={fetchProfiles} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;