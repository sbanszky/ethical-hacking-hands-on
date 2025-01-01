import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const UsernameSetup = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingUsername();
  }, []);

  const checkExistingUsername = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", session.user.id)
      .single();

    if (profile?.username) {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("id", session.user.id);

    if (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to set username");
      return;
    }

    toast.success("Username set successfully");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen pt-16 bg-hack-background">
      <div className="max-w-md mx-auto p-8 bg-gray-800 rounded-lg shadow-lg mt-8">
        <h1 className="text-2xl font-bold text-white mb-8 text-center">Set Your Username</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="bg-gray-700"
          />
          <Button type="submit" className="w-full">
            Set Username
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UsernameSetup;