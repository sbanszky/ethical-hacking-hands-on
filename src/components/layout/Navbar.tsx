import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useContent } from "@/hooks/useContent";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { menus } = useContent();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching all content for:", searchQuery);
    
    try {
      const [pagesResult, menusResult] = await Promise.all([
        supabase
          .from('pages')
          .select('*')
          .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`),
        supabase
          .from('menus')
          .select('*')
          .ilike('title', `%${searchQuery}%`)
      ]);

      console.log("Search results:", { pages: pagesResult.data, menus: menusResult.data });
      
      const totalResults = (pagesResult.data?.length || 0) + (menusResult.data?.length || 0);
      toast.info(`Found ${totalResults} results`);
      
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error performing search");
    }
  };

  // Group menus by parent category
  const groupedMenus = menus.reduce((acc: Record<string, typeof menus>, menu) => {
    const category = menu.parent_category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(menu);
    return acc;
  }, {});

  const menuItems = [
    { title: "Documentation", href: "/docs", menus: groupedMenus['documentation'] || [] },
    { title: "Tools", href: "/tools", menus: groupedMenus['tools'] || [] },
    { title: "How To", href: "/howto", menus: groupedMenus['howto'] || [] },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-hack-background border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-white font-mono text-xl">HackNotes</h1>
            <div className="hidden md:flex items-center gap-4">
              {menuItems.map((item) => (
                <div key={item.title} className="relative group">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white"
                    onClick={() => navigate(item.href)}
                  >
                    {item.title}
                  </Button>
                  {item.menus.length > 0 && (
                    <div 
                      className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out"
                      onMouseEnter={(e) => {
                        const target = e.currentTarget;
                        target.style.opacity = "1";
                        target.style.visibility = "visible";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget;
                        target.style.opacity = "0";
                        target.style.visibility = "hidden";
                      }}
                    >
                      {item.menus.map((menu) => (
                        <Button
                          key={menu.id}
                          variant="ghost"
                          className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700"
                          onClick={() => navigate(`${item.href}/${menu.slug}`)}
                        >
                          {menu.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search site content..."
                  className="w-full bg-gray-800 border-gray-700 text-white pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </form>
            
            <Button
              variant="default"
              className="bg-hack-accent hover:bg-hack-accent/90"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;