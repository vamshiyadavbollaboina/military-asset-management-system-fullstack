import {
  LayoutDashboard,
  ShoppingCart,
  ArrowLeftRight,
  ClipboardCheck,
  PackageX,
  FileText,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid user data in localStorage");
    user = null;
  }

  const role = user?.role?.trim()?.toUpperCase();

  console.log("Logged in user:", user);
  console.log("Logged in role:", role);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"],
    },

    {
      label: "Purchases",
      path: "/purchases",
      icon: ShoppingCart,
      roles: ["ADMIN", "LOGISTICS_OFFICER"],
    },

    {
      label: "Transfers",
      path: "/transfers",
      icon: ArrowLeftRight,
      roles: ["ADMIN", "LOGISTICS_OFFICER"],
    },

    {
      label: "Assignments",
      path: "/assignments",
      icon: ClipboardCheck,
      roles: ["ADMIN", "BASE_COMMANDER"],
    },

    {
      label: "Expenditures",
      path: "/expenditures",
      icon: PackageX,
      roles: ["ADMIN", "BASE_COMMANDER"],
    },

    {
      label: "Audit Logs",
      path: "/audit-logs",
      icon: FileText,
      roles: ["ADMIN"],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(role),
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="px-4 py-5 border-b border-slate-700">
        <p className="text-sm font-semibold">{user?.username || "User"}</p>

        <p className="text-xs text-slate-400 mt-1">
          {role ? role.replaceAll("_", " ") : "Unknown Role"}
        </p>

        {user?.baseId && (
          <p className="text-xs text-slate-500 mt-1">Base #{user.baseId}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition"
        ></button>
      </div>
    </aside>
  );
};

export default Sidebar;
