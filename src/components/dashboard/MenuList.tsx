import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { useState } from "react";

interface MenuListProps {
  menus: any[];
  onDeleteMenu: (id: string) => void;
  onReorderMenus: (reorderedMenus: any[]) => void;
}

const MenuList = ({ menus, onDeleteMenu, onReorderMenus }: MenuListProps) => {
  const [draggedItem, setDraggedItem] = useState<any>(null);

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

    // Update order_index for each menu while preserving all other properties
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

  return (
    <div className="space-y-2 mt-4">
      {menus && menus.length > 0 ? (
        menus.map((menu: any) => (
          <div
            key={menu.id}
            className="flex items-center justify-between p-3 bg-gray-700 rounded cursor-move"
            draggable
            onDragStart={() => handleDragStart(menu)}
            onDragOver={(e) => handleDragOver(e, menu)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="font-medium">{menu.title}</span>
                <span className="text-sm text-gray-400">{menu.parent_category}</span>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteMenu(menu.id)}
            >
              Delete
            </Button>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center py-4">No menus created yet</p>
      )}
    </div>
  );
};

export default MenuList;