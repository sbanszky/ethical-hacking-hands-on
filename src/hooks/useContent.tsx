import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useContent = () => {
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenus = useCallback(async () => {
    console.log("Fetching menus...");
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPages = useCallback(async () => {
    console.log("Fetching pages...");
    setIsLoading(true);
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
      
      console.log("Pages fetched:", data);
      setPages(data);
    } catch (error) {
      console.error("Error in fetchPages:", error);
      toast.error("Failed to fetch pages");
    } finally {
      setIsLoading(false);
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
    handleDeletePage
  };
};