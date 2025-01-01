import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PageForm = ({ 
  menus, 
  onPageCreated 
}: { 
  menus: any[];
  onPageCreated: () => void;
}) => {
  const [newPage, setNewPage] = useState({
    title: "",
    content: "",
    slug: "",
    menu_id: "",
  });

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("pages").insert([
      { ...newPage, user_id: user.id },
    ]);

    if (error) {
      toast.error("Error creating page");
      return;
    }

    toast.success("Page created successfully");
    setNewPage({ title: "", content: "", slug: "", menu_id: "" });
    onPageCreated();
  };

  return (
    <form onSubmit={handleCreatePage} className="mb-6 space-y-4">
      <Input
        placeholder="Page Title"
        value={newPage.title}
        onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
        className="bg-gray-700"
      />
      <Input
        placeholder="Page Slug"
        value={newPage.slug}
        onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
        className="bg-gray-700"
      />
      <select
        value={newPage.menu_id}
        onChange={(e) => setNewPage({ ...newPage, menu_id: e.target.value })}
        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
      >
        <option value="">Select Menu</option>
        {menus.map((menu: any) => (
          <option key={menu.id} value={menu.id}>
            {menu.title}
          </option>
        ))}
      </select>
      <Textarea
        placeholder="Page Content"
        value={newPage.content}
        onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
        className="bg-gray-700"
      />
      <Button type="submit" className="w-full">Create Page</Button>
    </form>
  );
};

export default PageForm;