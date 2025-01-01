import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContent } from "@/hooks/useContent";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { menus } = useContent();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log("Searching for:", searchQuery);
    }
  };

  const menuItems = [
    {
      title: "Documentation",
      menus: menus.filter(menu => menu.parent_category === "documentation")
    },
    {
      title: "Tools",
      menus: menus.filter(menu => menu.parent_category === "tools")
    },
    {
      title: "How To",
      menus: menus.filter(menu => menu.parent_category === "howto")
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 
              onClick={() => navigate('/')} 
              className="text-white font-mono text-xl cursor-pointer"
            >
              HackNotes
            </h1>
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              {menuItems.map((item) => (
                <div 
                  key={item.title} 
                  className="relative group"
                  onMouseEnter={() => {
                    console.log(`Mouse entered ${item.title}`);
                    setActiveDropdown(item.title);
                  }}
                  onMouseLeave={(e) => {
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    const isMovingToDropdown = relatedTarget?.closest('.group') === e.currentTarget;
                    const isMovingToAnotherMenuItem = relatedTarget?.closest('.group');
                    
                    if (!isMovingToDropdown && !isMovingToAnotherMenuItem) {
                      console.log(`Mouse left ${item.title} completely`);
                      setActiveDropdown(null);
                    }
                  }}
                >
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white"
                  >
                    {item.title}
                  </Button>
                  {item.menus.length > 0 && activeDropdown === item.title && (
                    <div 
                      className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg"
                    >
                      {item.menus.map((menu) => (
                        <Button
                          key={menu.id}
                          variant="ghost"
                          className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-700"
                          onClick={() => navigate(`/menus/${menu.id}`)}
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

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:block">
              <Input
                type="search"
                placeholder="Search..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {/* Add mobile menu handler */}}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;