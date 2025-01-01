import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-hack-background text-white">
      <Navbar />
      <Sidebar />
      <main className="pt-16 pl-64">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-6">Welcome to HackNotes</h1>
          <p className="text-gray-300 mb-4">
            Your comprehensive resource for ethical hacking documentation, tools, and guides.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
              <p className="text-gray-300">
                Begin your journey into ethical hacking with our comprehensive guides and tutorials.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Popular Tools</h2>
              <p className="text-gray-300">
                Explore the most commonly used tools in ethical hacking and penetration testing.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;