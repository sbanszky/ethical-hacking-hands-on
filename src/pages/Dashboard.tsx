import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/hooks/useContent";
import UserManagement from "@/components/dashboard/UserManagement";
import ContentManager from "@/components/dashboard/ContentManager";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, isLoading: isAuthLoading } = useAuth();
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
    console.log("Dashboard: Mounting, auth state:", { user, userRole, isAuthLoading });
    
    if (!isAuthLoading && !user) {
      console.log("Dashboard: No user found, redirecting to login");
      navigate("/login");
      return;
    }

    const loadContent = async () => {
      if (!isAuthLoading && userRole) {
        console.log("Dashboard: Loading content for user with role:", userRole);
        await Promise.all([fetchMenus(), fetchPages()]);
      }
    };

    loadContent();
  }, [fetchMenus, fetchPages, navigate, user, userRole, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen pt-20 bg-hack-background text-white">
        <div className="max-w-7xl mx-auto px-4">
          <LoadingSpinner message="Checking authentication..." />
        </div>
      </div>
    );
  }

  if (isContentLoading) {
    return (
      <div className="min-h-screen pt-20 bg-hack-background text-white">
        <div className="max-w-7xl mx-auto px-4">
          <LoadingSpinner message="Loading content..." />
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