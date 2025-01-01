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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        toast.error("Error fetching user role");
        return;
      }

      setUserRole(profile.role);
    };

    checkAuth();
    fetchMenus();
    fetchPages();
  }, [navigate]);

  const fetchMenus = async () => {
    const { data, error } = await supabase.from("menus").select("*").order("order_index");
    if (error) {
      toast.error("Error fetching menus");
      return;
    }
    setMenus(data);
  };

  const fetchPages = async () => {
    const { data, error } = await supabase.from("pages").select("*").order("order_index");
    if (error) {
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
      toast.error("Error deleting page");
      return;
    }
    
    toast.success("Page deleted");
    fetchPages();
  };

  const canManageContent = userRole === "admin" || userRole === "editor";

  return (
    <div className="min-h-screen pt-20 bg-hack-background text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <UserManagement />
        
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