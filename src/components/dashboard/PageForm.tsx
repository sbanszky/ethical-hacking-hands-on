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
    parent_category: "" // Keep this for filtering menus only
  });

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating new page with data:", newPage);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a page");
      return;
    }

    if (!newPage.title || !newPage.slug) {
      toast.error("Title and slug are required");
      return;
    }

    // Only send the necessary page data to Supabase
    const pageData = {
      title: newPage.title,
      content: newPage.content,
      slug: newPage.slug,
      menu_id: newPage.menu_id || null,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from("pages")
      .insert([pageData])
      .select();

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

  // Log available menus and their categories for debugging
  console.log("All available menus:", menus.map(m => ({ 
    title: m.title, 
    category: m.parent_category 
  })));
  console.log("Selected parent category:", newPage.parent_category);

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
        onValueChange={(value) => {
          console.log("Parent category selected:", value);
          setNewPage({ ...newPage, parent_category: value, menu_id: "" });
        }}
        required
      >
        <SelectTrigger className="bg-gray-700">
          <SelectValue placeholder="Select Parent Category" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {PARENT_CATEGORIES.map((category) => (
            <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-700">
              {category.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={newPage.menu_id}
        onValueChange={(value) => {
          console.log("Menu selected:", value);
          setNewPage({ ...newPage, menu_id: value });
        }}
      >
        <SelectTrigger className="bg-gray-700">
          <SelectValue placeholder="Select Menu" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {menus
            .filter(menu => !newPage.parent_category || menu.parent_category === newPage.parent_category)
            .map((menu) => (
              <SelectItem 
                key={menu.id} 
                value={menu.id} 
                className={`text-white hover:bg-gray-700 ${menu.parent_category ? 'pl-6' : ''}`}
              >
                {menu.title}
                {menu.parent_category && <span className="text-gray-400 ml-2">({menu.parent_category})</span>}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Page Content"
        value={newPage.content}
        onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
        className="bg-gray-700 min-h-[400px]"
      />
      <Button type="submit" className="w-full">Create Page</Button>
    </form>
  );
};

export default PageForm;