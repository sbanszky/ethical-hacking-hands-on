import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Menu = Database['public']['Tables']['menus']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

interface EditPageDialogProps {
  page: Page;
  menus: Menu[];
  onPageUpdated: (pages: Page[]) => void;
}

interface MarkedSection {
  start: number;
  end: number;
  content: string;
}

const EditPageDialog = ({ page, menus, onPageUpdated }: EditPageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [editedPage, setEditedPage] = useState({
    title: page.title,
    content: page.content || "",
    slug: page.slug,
    menu_id: page.menu_id || "",
    markedSections: (page.marked_sections as MarkedSection[]) || []
  });
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  const handleUpdatePage = async () => {
    console.log("Updating page with data:", editedPage);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to update a page");
      return;
    }

    if (!editedPage.title || !editedPage.slug) {
      toast.error("Title and slug are required");
      return;
    }

    const { error } = await supabase
      .from("pages")
      .update({
        title: editedPage.title,
        content: editedPage.content,
        slug: editedPage.slug,
        menu_id: editedPage.menu_id || null,
        marked_sections: editedPage.markedSections
      })
      .eq("id", page.id);

    if (error) {
      console.error("Error updating page:", error);
      toast.error("Error updating page");
      return;
    }

    const { data: updatedPages, error: fetchError } = await supabase
      .from("pages")
      .select("*")
      .order("order_index");

    if (fetchError) {
      console.error("Error fetching updated pages:", fetchError);
      toast.error("Error fetching updated pages");
      return;
    }

    toast.success("Page updated successfully");
    setOpen(false);
    onPageUpdated(updatedPages);
  };

  const handleTextSelection = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        setSelectionStart(start);
        setSelectionEnd(end);
      }
    }
  };

  const markSelectedCode = () => {
    if (selectionStart !== null && selectionEnd !== null) {
      const selectedContent = editedPage.content.substring(selectionStart, selectionEnd);
      const newMarkedSection = {
        start: selectionStart,
        end: selectionEnd,
        content: selectedContent
      };
      
      setEditedPage({
        ...editedPage,
        markedSections: [...editedPage.markedSections, newMarkedSection]
      });
      
      setSelectionStart(null);
      setSelectionEnd(null);
      toast.success("Code section marked successfully");
    }
  };

  const removeMarkedSection = (index: number) => {
    const updatedSections = [...editedPage.markedSections];
    updatedSections.splice(index, 1);
    setEditedPage({
      ...editedPage,
      markedSections: updatedSections
    });
    toast.success("Marked section removed");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Page Title"
            value={editedPage.title}
            onChange={(e) => setEditedPage({ ...editedPage, title: e.target.value })}
            className="bg-gray-700"
          />
          <Input
            placeholder="Page Slug"
            value={editedPage.slug}
            onChange={(e) => setEditedPage({ ...editedPage, slug: e.target.value })}
            className="bg-gray-700"
          />
          <Select
            value={editedPage.menu_id}
            onValueChange={(value) => setEditedPage({ ...editedPage, menu_id: value })}
          >
            <SelectTrigger className="bg-gray-700">
              <SelectValue placeholder="Select Menu" />
            </SelectTrigger>
            <SelectContent>
              {menus.map((menu) => (
                <SelectItem key={menu.id} value={menu.id}>
                  {menu.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-2">
            <Textarea
              placeholder="Page Content"
              value={editedPage.content}
              onChange={(e) => setEditedPage({ ...editedPage, content: e.target.value })}
              onSelect={handleTextSelection}
              className="bg-gray-700 min-h-[300px]"
            />
            {selectionStart !== null && selectionEnd !== null && (
              <Button onClick={markSelectedCode} className="w-full">
                Mark Selected Code
              </Button>
            )}
          </div>
          
          {editedPage.markedSections.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Marked Code Sections</h3>
              <div className="space-y-2">
                {editedPage.markedSections.map((section, index) => (
                  <div key={index} className="bg-gray-700 p-2 rounded flex justify-between items-start">
                    <pre className="text-sm overflow-x-auto">
                      <code>{section.content}</code>
                    </pre>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMarkedSection(index)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button onClick={handleUpdatePage} className="w-full">
            Update Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPageDialog;