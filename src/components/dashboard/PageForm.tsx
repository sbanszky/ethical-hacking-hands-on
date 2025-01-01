import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const PageForm = ({ 
  menus, 
  onPageCreated 
}: { 
  menus: Menu[];
  onPageCreated: () => void;
}) => {
  const [newPage, setNewPage] = useState({
    title: "",
    content: "",
    slug: "",
    menu_id: "",
    parent_category: ""
  });

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a page");
      return;
    }

    if (!newPage.parent_category) {
      toast.error("Please select a parent category");
      return;
    }

    if (!newPage.title || !newPage.slug) {
      toast.error("Title and slug are required");
      return;
    }

    const { data, error } = await supabase.from("pages").insert([
      { 
        ...newPage,
        user_id: user.id,
      },
    ]).select();

    if (error) {
      console.error("Error creating page:", error);
      toast.error("Error creating page");
      return;
    }

    console.log("Page created successfully:", data);
    toast.success("Page created successfully");
    setNewPage({ title: "", content: "", slug: "", menu_id: "", parent_category: "" });
    onPageCreated();
  };

  // Filter menus based on selected parent category
  const filteredMenus = menus.filter(menu => 
    menu.parent_category === newPage.parent_category
  );

  console.log("Selected parent category:", newPage.parent_category);
  console.log("Available menus for category:", filteredMenus);

  return (
    <form onSubmit={handleCreatePage} className="mb-6 space-y-4">
      <Input
        placeholder="Page Title"
        value={newPage.title}
        onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
        className="bg-gray-700"
        required
      />
      <Input
        placeholder="Page Slug"
        value={newPage.slug}
        onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
        className="bg-gray-700"
        required
      />
      <Select
        value={newPage.parent_category}
        onValueChange={(value) => setNewPage({ ...newPage, parent_category: value, menu_id: "" })}
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
      {newPage.parent_category && filteredMenus.length > 0 && (
        <Select
          value={newPage.menu_id}
          onValueChange={(value) => setNewPage({ ...newPage, menu_id: value })}
        >
          <SelectTrigger className="bg-gray-700">
            <SelectValue placeholder="Select Menu" />
          </SelectTrigger>
          <SelectContent>
            {filteredMenus.map((menu) => (
              <SelectItem key={menu.id} value={menu.id}>
                {menu.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
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