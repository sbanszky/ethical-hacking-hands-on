import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
                  onClick={() => supabase.auth.signOut()}
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