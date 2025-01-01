import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string | null;
  role: string;
  email?: string;
}

const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  useEffect(() => {
    fetchProfiles();
    getCurrentUserRole();
  }, []);

  const fetchProfiles = async () => {
    console.log("Fetching profiles with emails...");
    // Join profiles with auth.users to get emails
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        email:auth_users!inner(email)
      `)
      .order("created_at");

    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
      return;
    }

    console.log("Fetched profiles:", data);
    // Transform the data to match our Profile interface
    const transformedData = data.map((profile: any) => ({
      ...profile,
      email: profile.auth_users?.email
    }));

    setProfiles(transformedData);
  };

  const getCurrentUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      toast.error("Error fetching user role");
      return;
    }

    setCurrentUserRole(data.role);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      toast.error("Error updating user role");
      return;
    }

    toast.success("User role updated successfully");
    fetchProfiles();
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
            <span>{profile.email || "No email available"}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Current role: {profile.role}</span>
              <select
                value={profile.role}
                onChange={(e) => updateUserRole(profile.id, e.target.value)}
                className="bg-gray-600 border border-gray-500 rounded px-2 py-1"
              >
                <option value="reader">Reader</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;