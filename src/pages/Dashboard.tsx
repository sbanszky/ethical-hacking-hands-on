import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { supabase } from "@/integrations/supabase/client";
import UserManagement from "@/components/dashboard/UserManagement";
import ContentManager from "@/components/dashboard/ContentManager";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    menus, 
    pages, 
    fetchMenus, 
    fetchPages, 
    handleDeleteMenu, 
    handleDeletePage,
    isLoading: isContentLoading 
  } = useContent();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          toast.error("Authentication error");
          navigate("/");
          return;
        }

        if (!session) {
          console.log("No session found, redirecting to home");
          navigate("/");
          return;
        }

        console.log("Session found, user authenticated");
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication error");
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  if (isContentLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-900 text-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <UserManagement />
        
        <ContentManager
          menus={menus}
          pages={pages}
          onMenuCreated={fetchMenus}
          onPageCreated={fetchPages}
          onDeleteMenu={handleDeleteMenu}
          onDeletePage={handleDeletePage}
        />
      </div>
    </div>
  );
};

export default Dashboard;