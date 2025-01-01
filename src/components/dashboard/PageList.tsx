import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import EditPageDialog from "./EditPageDialog";
import { Database, Json } from "@/integrations/supabase/types";
import { MarkedSection } from "@/types/marked-sections";
import TextSelectionArea from "./TextSelectionArea";
import MarkedSections from "./MarkedSections";
import { toast } from "sonner";

type Menu = Database['public']['Tables']['menus']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

interface PageListProps {
  pages: Page[];
  menus: Menu[];
  onDeletePage: (id: string) => void;
  onReorderPages: (reorderedPages: Page[]) => void;
}

const PageList = ({ pages, menus, onDeletePage, onReorderPages }: PageListProps) => {
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const handleDragStart = (page: any) => {
    setDraggedItem(page);
  };

  const handleDragOver = (e: React.DragEvent, targetPage: any) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetPage.id) return;

    const reorderedPages = [...pages];
    const draggedIndex = pages.findIndex(p => p.id === draggedItem.id);
    const targetIndex = pages.findIndex(p => p.id === targetPage.id);

    reorderedPages.splice(draggedIndex, 1);
    reorderedPages.splice(targetIndex, 0, draggedItem);

    const updatedPages = reorderedPages.map((page, index) => ({
      ...page,
      order_index: index
    }));

    onReorderPages(updatedPages);
  };

  const getMenuTitle = (menuId: string | null) => {
    if (!menuId) return 'No menu';
    const menu = menus.find(m => m.id === menuId);
    return menu ? menu.title : 'No menu';
  };

  const handleMarkSection = (page: Page, section: MarkedSection) => {
    const currentSections = (page.marked_sections as unknown as MarkedSection[]) || [];
    const updatedPage = {
      ...page,
      marked_sections: [...currentSections, section] as unknown as Json
    };
    onReorderPages(pages.map(p => p.id === page.id ? updatedPage : p));
    toast.success("Code section marked successfully");
  };

  return (
    <div className="space-y-4 mt-4">
      {pages && pages.length > 0 ? (
        pages.map((page) => (
          <div
            key={page.id}
            className="flex flex-col bg-gray-700 rounded overflow-hidden"
            draggable
            onDragStart={() => handleDragStart(page)}
            onDragOver={(e) => handleDragOver(e, page)}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-600">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                <div className="flex flex-col">
                  <span className="font-medium">{page.title}</span>
                  <span className="text-sm text-gray-400">
                    Menu: {getMenuTitle(page.menu_id)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <EditPageDialog 
                  page={page} 
                  menus={menus} 
                  onPageUpdated={onReorderPages} 
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeletePage(page.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <TextSelectionArea 
                content={page.content || ''} 
                onMarkSection={(section) => handleMarkSection(page, section)}
              />
              
              <MarkedSections 
                sections={(page.marked_sections as unknown as MarkedSection[]) || []}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center py-4">No pages created yet</p>
      )}
    </div>
  );
};

export default PageList;