import { Button } from "@/components/ui/button";
import { GripVertical, Copy, Check, Pencil } from "lucide-react";
import { useState } from "react";
import EditPageDialog from "./EditPageDialog";
import { Database, Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { MarkedSection } from "@/types/marked-sections";

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
  const [selectedText, setSelectedText] = useState<{ start: number; end: number } | null>(null);

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

  const handleCopySection = async (content: string, sectionIndex: number, pageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates({ ...copiedStates, [`${pageId}-${sectionIndex}`]: true });
      toast.success("Code section copied to clipboard");
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [`${pageId}-${sectionIndex}`]: false });
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy code section");
    }
  };

  const handleTextSelection = (e: React.MouseEvent<HTMLPreElement>, pageId: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const preElement = e.currentTarget;
      const start = range.startOffset;
      const end = range.endOffset;
      
      if (start !== end) {
        setSelectedText({ start, end });
        toast.success("Text selected! Click 'Mark Code' to save this section.");
      }
    }
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
              {/* Content preview with selection capability */}
              <div className="relative bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2 text-gray-300">Page Content:</h3>
                <pre
                  className="text-gray-300 whitespace-pre-wrap cursor-text"
                  onMouseUp={(e) => handleTextSelection(e, page.id)}
                >
                  <code>{page.content || 'No content'}</code>
                </pre>
                {selectedText && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      const content = page.content?.substring(selectedText.start, selectedText.end);
                      if (content) {
                        handleCopySection(content, 0, page.id);
                      }
                      setSelectedText(null);
                    }}
                  >
                    Mark Code
                  </Button>
                )}
              </div>

              {/* Marked sections */}
              {page.marked_sections && (page.marked_sections as unknown as MarkedSection[]).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300">Marked Code Sections:</h4>
                  {(page.marked_sections as unknown as MarkedSection[]).map((section, index) => (
                    <div key={index} className="relative bg-gray-800 p-4 rounded">
                      <pre className="text-gray-300 whitespace-pre-wrap">
                        <code>{section.content}</code>
                      </pre>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopySection(section.content, index, page.id)}
                      >
                        {copiedStates[`${page.id}-${index}`] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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