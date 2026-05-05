import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    setOpenMenus(newState.open);
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

  const handleSubClick = (sub) => {
    setActiveState({
      main: null,
      sub: sub.name,
      open: activeState.open,
    });
    if (sub.path) navigate(sub.path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isMainActive = (name) => activeState.main === name;
  const isParentActive = (submenu) =>
    submenu && activeState.sub && submenu.some((s) => s.name === activeState.sub);
  const isOpen = (name) => openMenus.includes(name);

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-300/20 z-50 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        {!collapsed && (
          <div className="p-4">
            <h1 className="text-lg font-bold text-black">Smart Health</h1>
            <p className="text-xs text-black opacity-60">Predictive Care System</p>
            <div className="mt-3 h-px w-full bg-gray-300/50" />
          </div>
        )}

        <div className="mt-2 flex flex-col gap-1">
          {menuItems.map((item) => (
            <div key={item.name}>
              <div
                onClick={() => handleMainClick(item)}
                className={`flex items-center justify-between px-4 py-3 mx-2 rounded-lg cursor-pointer transition ${
                  isMainActive(item.name)
                    ? "bg-black text-white"
                    : isParentActive(item.submenu)
                    ? "bg-gray-200 text-black"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <item.icon size={22} />}
                  {!collapsed && (
                    <span className="text-[15px] font-semibold">{item.name}</span>
                  )}
                </div>

                {!collapsed && item.submenu && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isOpen(item.name) ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {item.submenu && !collapsed && (
                <div
                  className={`ml-10 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${
                    isOpen(item.name) ? "max-h-40" : "max-h-0"
                  }`}
                >
                  {item.submenu.map((sub) => (
                    <div
                      key={sub.name}
                      onClick={() => handleSubClick(sub)}
                      className={`px-2 py-1.5 rounded-md cursor-pointer text-[14px] font-semibold transition ${
                        activeState.sub === sub.name
                          ? "bg-black text-white"
                          : "text-black hover:bg-gray-100"
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

      <div className="p-4 mt-auto flex flex-col gap-2">
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu size={22} />
          {!collapsed && (
            <span className="text-[15px] font-semibold text-black">Collapse</span>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-red-100 transition text-black-600"
        >
          <LogOut size={22} />
          {!collapsed && (
            <span className="text-[15px] font-semibold">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;