import { useEffect } from "react";
import { useContent } from "@/hooks/useContent";
import ContentManager from "@/components/dashboard/ContentManager";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

const Dashboard = () => {
  const { 
    menus, 
    pages, 
    fetchMenus, 
    fetchPages, 
    handleDeleteMenu, 
    handleDeletePage,
    handleReorderMenus,
    handleReorderPages,
    isLoading: isContentLoading 
  } = useContent();

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
        
        <ContentManager
          menus={menus}
          pages={pages}
          onMenuCreated={fetchMenus}
          onPageCreated={fetchPages}
          onDeleteMenu={handleDeleteMenu}
          onDeletePage={handleDeletePage}
          onReorderMenus={handleReorderMenus}
          onReorderPages={handleReorderPages}
        />
      </div>
    </div>
  );
};

export default Dashboard;