import { useParams, Link } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const MenuPages = () => {
  const { menuId } = useParams();
  const { menus, pages, isLoading } = useContent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const menu = menus.find(m => m.id === menuId);
  const menuPages = pages.filter(page => page.menu_id === menuId);

  if (!menu) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Menu not found</h1>
          <Link to="/" className="text-blue-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{menu.title}</h1>
        </div>

        {menuPages.length > 0 ? (
          <div className="space-y-4">
            {menuPages.map(page => (
              <Link
                key={page.id}
                to={`/pages/${page.slug}`}
                className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <h2 className="text-lg font-medium text-white">{page.title}</h2>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No pages found in this menu.</p>
        )}
      </div>
    </div>
  );
};

export default MenuPages;