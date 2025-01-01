import { Profile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserRoleSelectProps {
  profile: Profile;
  onRoleUpdate: () => void;
}

export const UserRoleSelect = ({ profile, onRoleUpdate }: UserRoleSelectProps) => {
  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user role:", error);
      toast.error("Error updating user role");
      return;
    }

    toast.success("User role updated successfully");
    onRoleUpdate();
  };

  return (
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
  );
};