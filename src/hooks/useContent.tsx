import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useContent = () => {
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);

  const fetchMenus = useCallback(async () => {
    console.log("Fetching menus...");
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
  }, []);

  const fetchPages = useCallback(async () => {
    console.log("Fetching pages...");
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("order_index");
    
    if (error) {
      console.error("Error fetching pages:", error);
      toast.error("Error fetching pages");
      return;
    }
    
    console.log("Pages fetched:", data);
    setPages(data);
  }, []);

  const handleDeleteMenu = useCallback(async (menuId: string) => {
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
    fetchMenus();
  }, [fetchMenus]);

  const handleDeletePage = useCallback(async (pageId: string) => {
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
    fetchPages();
  }, [fetchPages]);

  // Initial fetch when the hook is mounted
  useEffect(() => {
    console.log("useContent hook mounted, fetching initial data...");
    fetchMenus();
    fetchPages();
  }, [fetchMenus, fetchPages]);

  return {
    menus,
    pages,
    fetchMenus,
    fetchPages,
    handleDeleteMenu,
    handleDeletePage
  };
};