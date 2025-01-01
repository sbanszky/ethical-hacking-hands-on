import { useState } from "react";
import { Book, Folder, HelpCircle, ChevronDown, ChevronRight, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContent } from "@/hooks/useContent";
import { Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

type Menu = Database['public']['Tables']['menus']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  type: 'category' | 'menu' | 'page';
  children?: MenuItem[];
  slug?: string;
  parent_category?: string;
}

const getIconForCategory = (category: string) => {
  switch (category) {
    case "documentation":
      return <Book className="h-4 w-4" />;
    case "tools":
      return <Folder className="h-4 w-4" />;
    case "howto":
      return <HelpCircle className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const MenuItem = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const content = (
    <>
      {item.icon}
      <span className="flex-1 text-left">{item.title}</span>
      {hasChildren && (
        <span className="text-gray-500">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      )}
    </>
  );

  return (
    <div>
      {item.type === 'page' ? (
        <Link
          to={`/pages/${item.slug}`}
          className={cn(
            "w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors",
            "focus:outline-none focus:bg-gray-800",
            level > 0 && "pl-8"
          )}
        >
          {content}
        </Link>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors",
            "focus:outline-none focus:bg-gray-800",
            level > 0 && "pl-8"
          )}
        >
          {content}
        </button>
      )}
      {hasChildren && isOpen && (
        <div className="ml-4">
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { menus, pages } = useContent();
  console.log("Sidebar menus:", menus);
  console.log("Sidebar pages:", pages);

  // First, organize menus by category
  const menusByCategory = (menus || []).reduce((acc: Record<string, Menu[]>, menu: Menu) => {
    const category = menu.parent_category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(menu);
    return acc;
  }, {});

  console.log("Menus grouped by category:", menusByCategory);

  // Create menu items structure with proper hierarchy
  const menuItems: MenuItem[] = Object.entries(menusByCategory).map(([category, categoryMenus]) => {
    console.log(`Processing category: ${category} with menus:`, categoryMenus);
    
    // Sort menus by order_index
    const sortedMenus = [...categoryMenus].sort((a, b) => a.order_index - b.order_index);
    
    // Map the menus for this category
    const menuChildren = sortedMenus.map(menu => {
      // Find pages for this menu
      const menuPages = pages?.filter(page => page.menu_id === menu.id) || [];
      console.log(`Menu ${menu.title} (${menu.id}) has pages:`, menuPages);

      // Sort pages by order_index
      const sortedPages = [...menuPages].sort((a, b) => a.order_index - b.order_index);

      return {
        id: menu.id,
        title: menu.title,
        icon: <File className="h-4 w-4" />,
        type: 'menu' as const,
        parent_category: menu.parent_category,
        children: sortedPages.map(page => ({
          id: page.id,
          title: page.title,
          icon: <File className="h-4 w-4" />,
          type: 'page' as const,
          slug: page.slug
        }))
      };
    });

    return {
      id: category,
      title: category.charAt(0).toUpperCase() + category.slice(1),
      icon: getIconForCategory(category),
      type: 'category' as const,
      children: menuChildren
    };
  });

  console.log("Final menu items structure:", menuItems);

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-hack-background border-r border-gray-800 overflow-y-auto">
      <div className="py-4">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;