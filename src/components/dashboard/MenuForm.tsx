import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MenuForm = ({ onMenuCreated }: { onMenuCreated: () => void }) => {
  const [newMenu, setNewMenu] = useState({ title: "", slug: "" });

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("menus").insert([
      { ...newMenu, user_id: user.id },
    ]);

    if (error) {
      toast.error("Error creating menu");
      return;
    }

    toast.success("Menu created successfully");
    setNewMenu({ title: "", slug: "" });
    onMenuCreated();
  };

  return (
    <form onSubmit={handleCreateMenu} className="mb-6 space-y-4">
      <Input
        placeholder="Menu Title"
        value={newMenu.title}
        onChange={(e) => setNewMenu({ ...newMenu, title: e.target.value })}
        className="bg-gray-700"
      />
      <Input
        placeholder="Menu Slug"
        value={newMenu.slug}
        onChange={(e) => setNewMenu({ ...newMenu, slug: e.target.value })}
        className="bg-gray-700"
      />
      <Button type="submit" className="w-full">Create Menu</Button>
    </form>
  );
};

export default MenuForm;