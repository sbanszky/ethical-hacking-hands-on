import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Menu = Database['public']['Tables']['menus']['Row'];

const PARENT_CATEGORIES = [
  { id: "documentation", title: "Documentation" },
  { id: "tools", title: "Tools" },
  { id: "howto", title: "How To" }
];

const MenuForm = ({ onMenuCreated }: { onMenuCreated: () => void }) => {
  const [newMenu, setNewMenu] = useState({ 
    title: "", 
    slug: "", 
    parent_category: "" 
  });

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating menu with data:", newMenu);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a menu");
      return;
    }

    if (!newMenu.parent_category) {
      toast.error("Please select a parent category");
      return;
    }

    if (!newMenu.title || !newMenu.slug) {
      toast.error("Please fill in all fields");
      return;
    }

    const { data, error } = await supabase.from("menus").insert([
      { 
        title: newMenu.title,
        slug: newMenu.slug,
        user_id: user.id,
        parent_category: newMenu.parent_category
      },
    ]).select();

    if (error) {
      console.error("Error creating menu:", error);
      toast.error("Error creating menu");
      return;
    }

    console.log("Menu created successfully:", data);
    toast.success("Menu created successfully");
    setNewMenu({ title: "", slug: "", parent_category: "" });
    onMenuCreated();
  };

  return (
    <form onSubmit={handleCreateMenu} className="mb-6 space-y-4">
      <Input
        placeholder="Menu Title"
        value={newMenu.title}
        onChange={(e) => setNewMenu({ ...newMenu, title: e.target.value })}
        className="bg-gray-700"
        required
      />
      <Input
        placeholder="Menu Slug"
        value={newMenu.slug}
        onChange={(e) => setNewMenu({ ...newMenu, slug: e.target.value })}
        className="bg-gray-700"
        required
      />
      <Select
        value={newMenu.parent_category}
        onValueChange={(value) => setNewMenu({ ...newMenu, parent_category: value })}
        required
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
      <Button type="submit" className="w-full">Create Menu</Button>
    </form>
  );
};

export default MenuForm;