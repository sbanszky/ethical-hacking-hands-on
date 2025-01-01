import { useParams, Link } from "react-router-dom";
import { useContent } from "@/hooks/useContent";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const MenuPages = () => {
  const { menuId } = useParams();
  const { menus, pages, isLoading } = useContent();

  console.log("MenuPages - Current menuId:", menuId);
  console.log("MenuPages - Available pages:", pages);
  console.log("MenuPages - Pages content check:", pages.map(p => ({ id: p.id, title: p.title, content: p.content })));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const menu = menus.find(m => m.id === menuId);
  const menuPages = pages.filter(page => page.menu_id === menuId);

  console.log("MenuPages - Filtered pages for menu:", menuPages);

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
          <div className="space-y-6">
            {menuPages.map(page => (
              <div key={page.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4">
                  <Link
                    to={`/pages/${page.slug}`}
                    className="block hover:text-blue-400 transition-colors"
                  >
                    <h2 className="text-xl font-semibold mb-4">{page.title}</h2>
                  </Link>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="prose prose-invert max-w-none">
                      {page.content ? (
                        <div className="whitespace-pre-wrap text-gray-300">{page.content}</div>
                      ) : (
                        <p className="text-gray-500 italic">No content available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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