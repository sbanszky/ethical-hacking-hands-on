import MenuForm from "./MenuForm";
import PageForm from "./PageForm";
import MenuList from "./MenuList";
import PageList from "./PageList";
import { Database } from "@/integrations/supabase/types";

type Menu = Database['public']['Tables']['menus']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

interface ContentManagerProps {
  menus: Menu[];
  pages: Page[];
  onMenuCreated: () => void;
  onPageCreated: () => void;
  onDeleteMenu: (id: string) => void;
  onDeletePage: (id: string) => void;
  onReorderMenus: (reorderedMenus: Menu[]) => void;
  onReorderPages: (reorderedPages: Page[]) => void;
}

const ContentManager = ({
  menus,
  pages,
  onMenuCreated,
  onPageCreated,
  onDeleteMenu,
  onDeletePage,
  onReorderMenus,
  onReorderPages,
}: ContentManagerProps) => {
  console.log("ContentManager received menus:", menus);
  console.log("ContentManager received pages:", pages);
  console.log("Pages content check:", pages.map(p => ({ title: p.title, content: p.content })));
  
  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Manage Menus</h2>
        <MenuForm onMenuCreated={onMenuCreated} />
        <MenuList 
          menus={menus} 
          pages={pages}
          onDeleteMenu={onDeleteMenu} 
          onReorderMenus={onReorderMenus}
        />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Manage Pages</h2>
        <PageForm menus={menus} onPageCreated={onPageCreated} />
        <PageList 
          pages={pages} 
          menus={menus} 
          onDeletePage={onDeletePage}
          onReorderPages={onReorderPages}
        />
      </div>
    </div>
  );
};

export default ContentManager;