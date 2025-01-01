import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Initial session check:", session);
        
        if (error) {
          console.error("Session error:", error);
          await supabase.auth.signOut();
          setUser(null);
          return;
        }
        
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        navigate("/login");
        return;
      }

      if (event === 'SIGNED_IN' && session) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return;
          }

          if (!profile?.username) {
            navigate("/username-setup");
            return;
          }

          setUser(session.user);
        } catch (error) {
          console.error("Profile check error:", error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Error signing out. Please try again.");
        return;
      }
      console.log("Successfully signed out");
      setUser(null);
      navigate("/");
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const menuItems = [
    { title: "Documentation", href: "/docs" },
    { title: "Tools", href: "/tools" },
    { title: "How To", href: "/howto" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-hack-background border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-white font-mono text-xl">HackNotes</h1>
            <div className="hidden md:flex items-center gap-4">
              {menuItems.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                  onClick={() => navigate(item.href)}
                >
                  {item.title}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64 md:w-96">
              <Input
                type="search"
                placeholder="Search documentation..."
                className="w-full bg-gray-800 border-gray-700 text-white pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
                <Button
                  variant="default"
                  className="bg-hack-accent hover:bg-hack-accent/90"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;