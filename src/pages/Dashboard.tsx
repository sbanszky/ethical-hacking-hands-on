import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import MenuForm from "@/components/dashboard/MenuForm";
import PageForm from "@/components/dashboard/PageForm";
import UserManagement from "@/components/dashboard/UserManagement";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useContent } from "@/hooks/useContent";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoading } = useAuthCheck();
  const { 
    menus, 
    pages, 
    fetchMenus, 
    fetchPages, 
    handleDeleteMenu, 
    handleDeletePage 
  } = useContent();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error in Dashboard:", sessionError);
        toast.error("Session error. Please log in again.");
        navigate("/login");
        return;
      }

      if (!session) {
        console.log("No session found in Dashboard, redirecting to login");
        navigate("/login");
        return;
      }
    };

    checkSession();
    
    if (!isLoading) {
      fetchMenus();
      fetchPages();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in Dashboard:", event, session);
      if (event === 'SIGNED_OUT' || !session) {
        toast.info("Session ended. Please log in again.");
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoading, fetchMenus, fetchPages, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-hack-background text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hack-accent mx-auto mb-4"></div>
          <p className="text-hack-accent">Loading...</p>
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