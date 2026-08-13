import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Top Navbar */}
      <Navbar />

      {/* Main Area */}
      <div className="flex">

        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

export default Layout;