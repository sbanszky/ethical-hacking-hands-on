import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-hack-background border-b border-gray-800 flex items-center px-4 z-50">
      <div className="flex-1 flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-white font-mono text-xl">HackNotes</h1>
        <div className="relative w-96">
          <Input
            type="search"
            placeholder="Search documentation..."
            className="w-full bg-gray-800 border-gray-700 text-white pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;