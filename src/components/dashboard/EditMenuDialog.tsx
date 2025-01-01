import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Menu = Database['public']['Tables']['menus']['Row'];

const PARENT_CATEGORIES = [
  { id: "documentation", title: "Documentation" },
  { id: "tools", title: "Tools" },
  { id: "howto", title: "How To" }
];

interface EditMenuDialogProps {
  menu: Menu;
  onMenuUpdated: (menus: Menu[]) => void;
}

const EditMenuDialog = ({ menu, onMenuUpdated }: EditMenuDialogProps) => {
  const [open, setOpen] = useState(false);
  const [editedMenu, setEditedMenu] = useState({
    title: menu.title,
    slug: menu.slug,
    parent_category: menu.parent_category || ""
  });

  const handleUpdateMenu = async () => {
    console.log("Updating menu with data:", editedMenu);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to update a menu");
      return;
    }

    if (!editedMenu.title || !editedMenu.slug) {
      toast.error("Title and slug are required");
      return;
    }

    const { error } = await supabase
      .from("menus")
      .update({
        title: editedMenu.title,
        slug: editedMenu.slug,
        parent_category: editedMenu.parent_category || null
      })
      .eq("id", menu.id);

    if (error) {
      console.error("Error updating menu:", error);
      toast.error("Error updating menu");
      return;
    }

    // Fetch updated menus to pass to the callback
    const { data: updatedMenus, error: fetchError } = await supabase
      .from("menus")
      .select("*")
      .order("order_index");

    if (fetchError) {
      console.error("Error fetching updated menus:", fetchError);
      toast.error("Error fetching updated menus");
      return;
    }

    toast.success("Menu updated successfully");
    setOpen(false);
    onMenuUpdated(updatedMenus);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit Menu</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Menu Title"
            value={editedMenu.title}
            onChange={(e) => setEditedMenu({ ...editedMenu, title: e.target.value })}
            className="bg-gray-700"
          />
          <Input
            placeholder="Menu Slug"
            value={editedMenu.slug}
            onChange={(e) => setEditedMenu({ ...editedMenu, slug: e.target.value })}
            className="bg-gray-700"
          />
          <Select
            value={editedMenu.parent_category}
            onValueChange={(value) => setEditedMenu({ ...editedMenu, parent_category: value })}
          >
            <SelectTrigger className="bg-gray-700">
              <SelectValue placeholder="Select Parent Category" />
            </SelectTrigger>
            <SelectContent>
              {PARENT_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleUpdateMenu} className="w-full">
            Update Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditMenuDialog;