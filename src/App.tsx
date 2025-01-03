import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import MenuPages from "./components/menu/MenuPages";
import Page from "./pages/Page";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Sidebar />
        <main className="pl-64">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menus/:menuId" element={<MenuPages />} />
            <Route path="/pages/:slug" element={<Page />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;