import { useState } from "react";
import { Book, Folder, HelpCircle, ChevronDown, ChevronRight, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContent } from "@/hooks/useContent";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  children?: MenuItem[];
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

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors",
          "focus:outline-none focus:bg-gray-800",
          level > 0 && "pl-8"
        )}
      >
        {item.icon}
        <span className="flex-1 text-left">{item.title}</span>
        {hasChildren && (
          <span className="text-gray-500">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </button>
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
  const { menus } = useContent();
  console.log("Sidebar menus:", menus);

  // Group menus by parent_category
  const groupedMenus = menus.reduce((acc: Record<string, any[]>, menu) => {
    const category = menu.parent_category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(menu);
    return acc;
  }, {});

  const menuItems: MenuItem[] = Object.entries(groupedMenus).map(([category, categoryMenus]) => ({
    id: category,
    title: category.charAt(0).toUpperCase() + category.slice(1),
    icon: getIconForCategory(category),
    children: categoryMenus.map(menu => ({
      id: menu.id,
      title: menu.title,
      icon: <File className="h-4 w-4" />
    }))
  }));

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