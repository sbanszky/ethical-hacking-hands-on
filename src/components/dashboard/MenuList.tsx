import { Button } from "@/components/ui/button";

interface MenuListProps {
  menus: any[];
  onDeleteMenu: (id: string) => void;
}

const MenuList = ({ menus, onDeleteMenu }: MenuListProps) => {
  return (
    <div className="space-y-2 mt-4">
      {menus && menus.length > 0 ? (
        menus.map((menu: any) => (
          <div key={menu.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <div className="flex flex-col">
              <span className="font-medium">{menu.title}</span>
              <span className="text-sm text-gray-400">{menu.parent_category}</span>
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