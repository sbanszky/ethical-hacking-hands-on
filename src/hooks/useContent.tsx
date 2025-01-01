import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Menu = Database['public']['Tables']['menus']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

export const useContent = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenus = useCallback(async () => {
    console.log("Fetching menus...");
    try {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .order("order_index");
      
      if (error) {
        console.error("Error fetching menus:", error);
        toast.error("Error fetching menus");
        return;
      }
      
      console.log("Menus fetched:", data);
      setMenus(data);
    } catch (error) {
      console.error("Error in fetchMenus:", error);
      toast.error("Failed to fetch menus");
    }
  }, []);

  const fetchPages = useCallback(async () => {
    console.log("Fetching pages...");
    try {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("order_index");
      
      if (error) {
        console.error("Error fetching pages:", error);
        toast.error("Error fetching pages");
        return;
      }
      
      console.log("Pages fetched with content:", data);
      setPages(data);
    } catch (error) {
      console.error("Error in fetchPages:", error);
      toast.error("Failed to fetch pages");
    }
  }, []);

  const handleDeleteMenu = useCallback(async (menuId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("menus")
        .delete()
        .eq("id", menuId);
      
      if (error) {
        console.error("Error deleting menu:", error);
        toast.error("Error deleting menu");
        return;
      }
      
      toast.success("Menu deleted");
      await fetchMenus();
    } catch (error) {
      console.error("Error in handleDeleteMenu:", error);
      toast.error("Failed to delete menu");
    } finally {
      setIsLoading(false);
    }
  }, [fetchMenus]);

  const handleDeletePage = useCallback(async (pageId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", pageId);
      
      if (error) {
        console.error("Error deleting page:", error);
        toast.error("Error deleting page");
        return;
      }
      
      toast.success("Page deleted");
      await fetchPages();
    } catch (error) {
      console.error("Error in handleDeletePage:", error);
      toast.error("Failed to delete page");
    } finally {
      setIsLoading(false);
    }
  }, [fetchPages]);

  const handleReorderMenus = useCallback(async (reorderedMenus: Menu[]) => {
    try {
      console.log("Attempting to reorder menus:", reorderedMenus);
      
      const updates = reorderedMenus.map(menu => ({
        id: menu.id,
        order_index: menu.order_index,
        title: menu.title,
        slug: menu.slug,
        parent_category: menu.parent_category,
        user_id: menu.user_id
      }));

      console.log("Sending updates to Supabase:", updates);

      const { error } = await supabase
        .from("menus")
        .upsert(updates, {
          onConflict: 'id'
        });

      if (error) {
        console.error("Error reordering menus:", error);
        toast.error("Error reordering menus");
        return;
      }

      console.log("Successfully reordered menus");
      setMenus(reorderedMenus);
      toast.success("Menus reordered successfully");
    } catch (error) {
      console.error("Error in handleReorderMenus:", error);
      toast.error("Failed to reorder menus");
    }
  }, []);

  const handleReorderPages = useCallback(async (reorderedPages: Page[]) => {
    try {
      const { error } = await supabase
        .from("pages")
        .upsert(
          reorderedPages.map(page => ({
            id: page.id,
            order_index: page.order_index,
            title: page.title,
            slug: page.slug,
            content: page.content,
            menu_id: page.menu_id,
            parent_id: page.parent_id,
            user_id: page.user_id
          }))
        );

      if (error) {
        console.error("Error reordering pages:", error);
        toast.error("Error reordering pages");
        return;
      }

      setPages(reorderedPages);
    } catch (error) {
      console.error("Error in handleReorderPages:", error);
      toast.error("Failed to reorder pages");
    }
  }, []);

  // Initial fetch when the hook is mounted
  useEffect(() => {
    console.log("useContent hook mounted, fetching initial data...");
    Promise.all([fetchMenus(), fetchPages()]).finally(() => {
      setIsLoading(false);
    });
  }, [fetchMenus, fetchPages]);

  return {
    menus,
    pages,
    isLoading,
    fetchMenus,
    fetchPages,
    handleDeleteMenu,
    handleDeletePage,
    handleReorderMenus,
    handleReorderPages
  };
};
