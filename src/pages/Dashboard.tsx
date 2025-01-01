import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MenuForm from "@/components/dashboard/MenuForm";
import PageForm from "@/components/dashboard/PageForm";
import UserManagement from "@/components/dashboard/UserManagement";

const Dashboard = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session check:", session);
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        // Fetch user profile with maybeSingle instead of single
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        console.log("Profile fetch result:", { profile, profileError });

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Error fetching user role");
          return;
        }

        // If no profile exists, create one with default role
        if (!profile) {
          console.log("No profile found, creating new profile");
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              { 
                id: session.user.id,
                role: 'reader' // Default role
              }
            ]);

          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast.error("Error creating user profile");
            return;
          }

          setUserRole('reader');
        } else {
          setUserRole(profile.role);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check error:", error);
        toast.error("Error checking authentication");
        navigate("/login");
      }
    };

    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (!session) {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!isLoading) {
      fetchMenus();
      fetchPages();
    }
  }, [isLoading]);

  const fetchMenus = async () => {
    const { data, error } = await supabase.from("menus").select("*").order("order_index");
    if (error) {
      console.error("Error fetching menus:", error);
      toast.error("Error fetching menus");
      return;
    }
    setMenus(data);
  };

  const fetchPages = async () => {
    const { data, error } = await supabase.from("pages").select("*").order("order_index");
    if (error) {
      console.error("Error fetching pages:", error);
      toast.error("Error fetching pages");
      return;
    }
    setPages(data);
  };

  const handleDeleteMenu = async (menuId: string) => {
    const { error } = await supabase
      .from("menus")
      .delete()
      .eq("id", menuId);
    
    if (error) {
      console.error("Error deleting menu:", error);
      toast.error("Error deleting menu");
      return;
    }
    
    toast.success("Menu deleted");
    fetchMenus();
  };

  const handleDeletePage = async (pageId: string) => {
    const { error } = await supabase
      .from("pages")
      .delete()
      .eq("id", pageId);
    
    if (error) {
      console.error("Error deleting page:", error);
      toast.error("Error deleting page");
      return;
    }
    
    toast.success("Page deleted");
    fetchPages();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-hack-background text-white">
        <div className="max-w-7xl mx-auto px-4">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const canManageContent = userRole === "admin" || userRole === "editor";

  return (
    <div className="min-h-screen pt-20 bg-hack-background text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {userRole === "admin" && <UserManagement />}
        
        {canManageContent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Manage Menus</h2>
              <MenuForm onMenuCreated={fetchMenus} />
              <div className="space-y-2">
                {menus.map((menu: any) => (
                  <div key={menu.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <span>{menu.title}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMenu(menu.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Manage Pages</h2>
              <PageForm menus={menus} onPageCreated={fetchPages} />
              <div className="space-y-2">
                {pages.map((page: any) => (
                  <div key={page.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <span>{page.title}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePage(page.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;