import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [newMenu, setNewMenu] = useState({ title: "", slug: "" });
  const [newPage, setNewPage] = useState({
    title: "",
    content: "",
    slug: "",
    menu_id: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
    fetchMenus();
    fetchPages();
  }, [navigate]);

  const fetchMenus = async () => {
    const { data, error } = await supabase.from("menus").select("*").order("order_index");
    if (error) {
      toast.error("Error fetching menus");
      return;
    }
    setMenus(data);
  };

  const fetchPages = async () => {
    const { data, error } = await supabase.from("pages").select("*").order("order_index");
    if (error) {
      toast.error("Error fetching pages");
      return;
    }
    setPages(data);
  };

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
    fetchMenus();
  };

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
    fetchPages();
  };

  return (
    <div className="min-h-screen pt-20 bg-hack-background text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Menus Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Manage Menus</h2>
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
            <div className="space-y-2">
              {menus.map((menu: any) => (
                <div key={menu.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <span>{menu.title}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      const { error } = await supabase
                        .from("menus")
                        .delete()
                        .eq("id", menu.id);
                      if (error) {
                        toast.error("Error deleting menu");
                        return;
                      }
                      toast.success("Menu deleted");
                      fetchMenus();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Pages Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Manage Pages</h2>
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
            <div className="space-y-2">
              {pages.map((page: any) => (
                <div key={page.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <span>{page.title}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      const { error } = await supabase
                        .from("pages")
                        .delete()
                        .eq("id", page.id);
                      if (error) {
                        toast.error("Error deleting page");
                        return;
                      }
                      toast.success("Page deleted");
                      fetchPages();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;