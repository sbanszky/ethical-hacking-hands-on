import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import MenuForm from "@/components/dashboard/MenuForm";
import PageForm from "@/components/dashboard/PageForm";
import UserManagement from "@/components/dashboard/UserManagement";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useContent } from "@/hooks/useContent";

const Dashboard = () => {
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
    if (!isLoading) {
      fetchMenus();
      fetchPages();
    }
  }, [isLoading, fetchMenus, fetchPages]);

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