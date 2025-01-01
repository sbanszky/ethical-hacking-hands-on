import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Json } from "@/integrations/supabase/types";
import { MarkedSection } from "@/types/marked-sections";
import TextSelectionArea from "./TextSelectionArea";
import MarkedSections from "./MarkedSections";

type Menu = Database['public']['Tables']['menus']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

interface EditPageDialogProps {
  page: Page;
  menus: Menu[];
  onPageUpdated: (pages: Page[]) => void;
}

const EditPageDialog = ({ page, menus, onPageUpdated }: EditPageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [editedPage, setEditedPage] = useState({
    title: page.title,
    content: page.content || "",
    slug: page.slug,
    menu_id: page.menu_id || "",
    markedSections: (page.marked_sections as unknown as MarkedSection[]) || []
  });

  const handleUpdatePage = async () => {
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
        marked_sections: editedPage.markedSections as unknown as Json[]
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
          
          <TextSelectionArea
            content={editedPage.content}
            onMarkSection={(section) => {
              setEditedPage({
                ...editedPage,
                markedSections: [...editedPage.markedSections, section]
              });
              toast.success("Code section marked successfully");
            }}
          />
          
          <MarkedSections
            sections={editedPage.markedSections}
            onRemoveSection={(index) => {
              const updatedSections = [...editedPage.markedSections];
              updatedSections.splice(index, 1);
              setEditedPage({
                ...editedPage,
                markedSections: updatedSections
              });
              toast.success("Marked section removed");
            }}
          />
          
          <Button onClick={handleUpdatePage} className="w-full">
            Update Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPageDialog;