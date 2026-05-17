import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  UserCog,
  ChevronDown,
  Menu,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Patients", icon: Users, path: "/patients" },
  {
    name: "Appointments",
    icon: Calendar,
    path: "/appointments",
    submenu: [
      { name: "All Appointments", path: "/appointments/all" },
      { name: "Calendar View", path: "/appointments/calendar" },
    ],
  },
  { name: "Medical Records", icon: FileText, path: "/record" },
  {
    name: "Staff",
    icon: UserCog,
    path: "/staff",
    submenu: [
      { name: "All Staff", path: "/staff/all" },
      { name: "Departments", path: "/staff/departments" },
      { name: "Shift Management", path: "/staff/shifts" },
    ],
  },
  { name: "Audit Logs", icon: FileText, path: "/audit-logs" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const getActiveStateFromPath = (path) => {
    let main = null;
    let sub = null;
    const open = [];

    menuItems.forEach((item) => {
      if (item.path === path) {
        main = item.name;
      }
      if (item.submenu) {
        const activeSub = item.submenu.find((s) => s.path === path);
        if (activeSub) {
          sub = activeSub.name;
          open.push(item.name);
        }
      }
    });

    menuItems.forEach((item) => {
      if (item.submenu && !main && !sub) {
        if (path.startsWith(item.path) && item.path !== "/") {
          open.push(item.name);
        }
      }
    });

    return { main: sub ? null : main, sub, open };
  };

  const [activeState, setActiveState] = useState(() =>
    getActiveStateFromPath(location.pathname)
  );

  const [openMenus, setOpenMenus] = useState(() =>
    getActiveStateFromPath(location.pathname).open
  );

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed);
  }, [collapsed]);

  useEffect(() => {
    const newState = getActiveStateFromPath(location.pathname);
    setActiveState(newState);
    setOpenMenus((prev) => {
      const combined = [...new Set([...prev, ...newState.open])];
      return combined;
    });
  }, [location.pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", next);
      window.dispatchEvent(new CustomEvent("sidebar-collapse", { detail: next }));
      return next;
    });
  };

  const handleMainClick = (item) => {
    setActiveState({
      main: item.name,
      sub: null,
      open: activeState.open,
    });

    if (item.path && !item.submenu) {
      navigate(item.path);
    }

    if (item.submenu) {
      setOpenMenus((prev) =>
        prev.includes(item.name)
          ? prev.filter((m) => m !== item.name)
          : [...prev, item.name]
      );
    }
  };

  const handleSubClick = (sub, parentName) => {
    setActiveState({
      main: null,
      sub: sub.name,
      open: [...new Set([...activeState.open, parentName])],
    });
    if (sub.path) navigate(sub.path);
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isMainActive = (name) => activeState.main === name;
  const isParentActive = (submenu) =>
    submenu && activeState.sub && submenu.some((s) => s.name === activeState.sub);
  const isOpen = (name) => openMenus.includes(name);

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        {!collapsed && (
          <div className="p-5">
            <h1 className="text-lg font-bold text-black">Smart Health Care</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Predictive Care System
            </p>
            <div className="mt-4 h-px w-full bg-gray-200" />
          </div>
        )}

        <div className="mt-2 flex flex-col gap-0.5 px-2">
          {menuItems.map((item) => (
            <div key={item.name}>
              <div
                onClick={() => handleMainClick(item)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition ${
                  isMainActive(item.name)
                    ? "bg-black text-white"
                    : isParentActive(item.submenu)
                    ? "bg-gray-100 text-black"
                    : "text-black hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <item.icon size={20} strokeWidth={1.5} />}
                  {!collapsed && (
                    <span className="text-sm font-medium">
                      {item.name}
                    </span>
                  )}
                </div>

                {!collapsed && item.submenu && (
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isOpen(item.name) ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {item.submenu && !collapsed && (
                <div
                  className={`ml-9 mt-0.5 flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ${
                    isOpen(item.name) ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {item.submenu.map((sub) => (
                    <div
                      key={sub.name}
                      onClick={() => handleSubClick(sub, item.name)}
                      className={`px-3 py-2 rounded-md cursor-pointer text-[13px] font-medium transition ${
                        activeState.sub === sub.name
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-black"
                      }`}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 mt-auto flex flex-col gap-1">
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 transition text-sm"
        >
          <Menu size={18} strokeWidth={1.5} />
          {!collapsed && (
            <span className="font-medium text-black">
              Collapse
            </span>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-50 transition text-sm text-red-600"
        >
          <LogOut size={18} strokeWidth={1.5} />
          {!collapsed && (
            <span className="font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;