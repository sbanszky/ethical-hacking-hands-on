import { Button } from "@/components/ui/button";
import { GripVertical, Copy, Check } from "lucide-react";
import { useState } from "react";
import EditPageDialog from "./EditPageDialog";
import { Database } from "@/integrations/supabase/types";
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
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  console.log("PageList received pages:", pages);

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

  const handleCopyContent = async (pageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates({ ...copiedStates, [pageId]: true });
      toast.success("Content copied to clipboard");
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [pageId]: false });
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy content");
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {pages && pages.length > 0 ? (
        pages.map((page) => {
          console.log("Rendering page:", page.title, "with content:", page.content);
          return (
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
              <div className="relative">
                <pre className="p-4 bg-gray-800 text-gray-300 whitespace-pre-wrap min-h-[100px] overflow-x-auto">
                  <code className="block">{page.content || 'No content'}</code>
                </pre>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyContent(page.id, page.content || '')}
                >
                  {copiedStates[page.id] ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-400 text-center py-4">No pages created yet</p>
      )}
    </div>
  );
};

export default PageList;