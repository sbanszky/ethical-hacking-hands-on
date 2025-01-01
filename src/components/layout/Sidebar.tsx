import { useState } from "react";
import { Book, Folder, HelpCircle, ChevronDown, ChevronRight, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "documentation",
    title: "Documentation",
    icon: <Book className="h-4 w-4" />,
    children: [
      { id: "getting-started", title: "Getting Started", icon: <File className="h-4 w-4" /> },
      { id: "fundamentals", title: "Fundamentals", icon: <File className="h-4 w-4" /> },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    icon: <Folder className="h-4 w-4" />,
    children: [
      { id: "nmap", title: "Nmap", icon: <File className="h-4 w-4" /> },
      { id: "metasploit", title: "Metasploit", icon: <File className="h-4 w-4" /> },
    ],
  },
  {
    id: "howto",
    title: "How To",
    icon: <HelpCircle className="h-4 w-4" />,
    children: [
      { id: "tutorials", title: "Tutorials", icon: <File className="h-4 w-4" /> },
      { id: "guides", title: "Guides", icon: <File className="h-4 w-4" /> },
    ],
  },
];

const MenuItem = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors",
          "focus:outline-none focus:bg-gray-800",
          level > 0 && "pl-8"
        )}
      >
        {item.icon}
        <span className="flex-1 text-left">{item.title}</span>
        {hasChildren && (
          <span className="text-gray-500">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </button>
      {hasChildren && isOpen && (
        <div className="ml-4">
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-hack-background border-r border-gray-800 overflow-y-auto">
      <div className="py-4">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;