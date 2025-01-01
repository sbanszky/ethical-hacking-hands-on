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
    const timeoutId = setTimeout(() => {
      console.log("Dashboard: Auth state check", { user, isAuthLoading });
      if (!isAuthLoading && !user) {
        console.log("Dashboard: No authenticated user, redirecting to login");
        navigate("/login");
      }
    }, 1000); // Add a small delay to prevent flash

    return () => clearTimeout(timeoutId);
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" message="Checking authentication..." />
      </div>
    );
  }

  if (!user) {
    console.log("Dashboard: No user found, redirecting...");
    navigate("/login");
    return null;
  }

  const canManageContent = userRole === "admin" || userRole === "editor";

  if (!canManageContent) {
    return (
      <div className="min-h-screen pt-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {userRole === "admin" && <UserManagement />}
        
        {isContentLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" message="Loading content..." />
          </div>
        ) : (
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