import { Button } from "@/components/ui/button";
import { GripVertical, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { useState } from "react";

interface MenuListProps {
  menus: any[];
  pages: any[];
  onDeleteMenu: (id: string) => void;
  onReorderMenus: (reorderedMenus: any[]) => void;
}

const MenuList = ({ menus, pages, onDeleteMenu, onReorderMenus }: MenuListProps) => {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const handleDragStart = (menu: any) => {
    console.log("Drag started with menu:", menu);
    setDraggedItem(menu);
  };

  const handleDragOver = (e: React.DragEvent, targetMenu: any) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetMenu.id) return;

    const reorderedMenus = [...menus];
    const draggedIndex = menus.findIndex(m => m.id === draggedItem.id);
    const targetIndex = menus.findIndex(m => m.id === targetMenu.id);

    reorderedMenus.splice(draggedIndex, 1);
    reorderedMenus.splice(targetIndex, 0, draggedItem);

    const updatedMenus = reorderedMenus.map((menu, index) => ({
      ...menu,
      order_index: index
    }));

    console.log("Reordered menus:", updatedMenus);
    onReorderMenus(updatedMenus);
  };

  const handleDragEnd = () => {
    console.log("Drag ended");
    setDraggedItem(null);
  };

  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const getMenuPages = (menuId: string) => {
    return pages.filter(page => page.menu_id === menuId);
  };

  return (
    <div className="space-y-2 mt-4">
      {menus && menus.length > 0 ? (
        menus.map((menu: any) => {
          const menuPages = getMenuPages(menu.id);
          const isExpanded = expandedMenus[menu.id];

          return (
            <div key={menu.id} className="space-y-2">
              <div
                className="flex items-center justify-between p-3 bg-gray-700 rounded cursor-move"
                draggable
                onDragStart={() => handleDragStart(menu)}
                onDragOver={(e) => handleDragOver(e, menu)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMenuExpansion(menu.id)}
                        className="hover:bg-gray-600 rounded p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <span className="font-medium">{menu.title}</span>
                      <span className="text-sm text-gray-400">
                        ({menuPages.length} {menuPages.length === 1 ? 'page' : 'pages'})
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">{menu.parent_category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log("Edit menu:", menu.id)}
                    className="px-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteMenu(menu.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {isExpanded && menuPages.length > 0 && (
                <div className="ml-8 space-y-2">
                  {menuPages.map((page: any) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-2 bg-gray-600 rounded"
                    >
                      <span className="text-sm">{page.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-gray-400 text-center py-4">No menus created yet</p>
      )}
    </div>
  );
};

export default MenuList;