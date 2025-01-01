import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useContent } from "@/hooks/useContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserManagement from "@/components/dashboard/UserManagement";
import ContentManager from "@/components/dashboard/ContentManager";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: isAuthLoading } = useAuthCheck();
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
    console.log("Dashboard mounting, current user role:", userRole);
    
    if (!isAuthLoading && !userRole) {
      console.log("No user role found, redirecting to login");
      navigate("/login");
      return;
    }

    const loadContent = async () => {
      if (!isAuthLoading && userRole) {
        console.log("Loading content for user with role:", userRole);
        await Promise.all([fetchMenus(), fetchPages()]);
      }
    };

    loadContent();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in Dashboard:", event);
      if (event === 'SIGNED_OUT' || !session) {
        toast.info("Session ended. Please log in again.");
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchMenus, fetchPages, navigate, userRole, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen pt-20 bg-hack-background text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hack-accent mx-auto"></div>
            <p className="text-hack-accent">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isContentLoading) {
    return (
      <div className="min-h-screen pt-20 bg-hack-background text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hack-accent mx-auto"></div>
            <p className="text-hack-accent">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  const canManageContent = userRole === "admin" || userRole === "editor";

  if (!canManageContent) {
    return (
      <div className="min-h-screen pt-20 bg-hack-background text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-hack-background text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {userRole === "admin" && <UserManagement />}
        
        {canManageContent && (
          <ContentManager
            menus={menus}
            pages={pages}
            onMenuCreated={fetchMenus}
            onPageCreated={fetchPages}
            onDeleteMenu={handleDeleteMenu}
            onDeletePage={handleDeletePage}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;