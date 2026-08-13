import { Menu, LogOut, Shield, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = () => {
    const username = user?.username || "User";

    return username
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 shadow-sm">
      <div className="h-full flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="
              lg:hidden
              w-10
              h-10
              flex
              items-center
              justify-center
              rounded-lg
              text-slate-600
              hover:bg-slate-100
              hover:text-slate-900
              transition
            "
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
              <Shield size={19} className="text-white" />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">
                Operations Dashboard
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Military Asset Management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {getInitials()}
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {user?.username || "Unknown User"}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">
                  {user?.role || "UNKNOWN"}
                </span>

                {user?.baseName && (
                  <>
                    <span className="text-slate-300">•</span>

                    <span className="text-xs text-slate-400">
                      {user.baseName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200" />

          <button
            type="button"
            onClick={handleLogout}
            className="
              group
              flex
              items-center
              gap-2
              px-3
              py-2
              rounded-lg
              text-sm
              font-medium
              text-slate-600
              hover:bg-red-50
              hover:text-red-600
              transition
            "
          >
            <LogOut size={18} className="group-hover:text-red-600 transition" />

            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
