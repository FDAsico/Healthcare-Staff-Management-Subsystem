import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  UserCog,
  BarChart3,
  ChevronDown,
  Menu,
  UserCheck,
} from "lucide-react";

// Menu (may abang na "path" pero hindi pa ginagamit)
const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: null },
  { name: "Patients", icon: Users, path: null },
  { name: "Appointments", icon: Calendar, path: null,
    submenu: [
      { name: "All Appointments", path: null },
      { name: "Calendar View", path: null },
    ], 
},
  { name: "Medical Records", icon: FileText, path: null,},
  { name: "Shift Management", icon: UserCheck, path: "/shiftmanagement" },
];

// Sidebar
const Sidebar = ({collapsed, setCollapsed}) => {
  const [openMenus, setOpenMenus] = useState([]);
  const [activeMain, setActiveMain] = useState("Dashboard");
  const [activeSub, setActiveSub] = useState(null);

  /*const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );*/

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed);
  }, [collapsed]);

  const handleMainClick = (item) => {
    setActiveMain(item.name);
    setActiveSub(null);

    if (item.submenu) {
      setOpenMenus((prev) =>
        prev.includes(item.name)
          ? prev.filter((m) => m !== item.name)
          : [...prev, item.name]
      );
    } else {
      // ABANG LANG (wala munang navigation)
      console.log("Clicked main:", item.name);
    }
  };

  const handleSubClick = (mainName, sub) => {
    setActiveSub(sub.name);
    setActiveMain(null);

    // ABANG LANG
    console.log("Clicked submenu:", sub.name);
  };

  const isMainActive = (name) => activeMain === name;

  const isParentActive = (submenu) =>
    submenu && submenu.some((s) => s.name === activeSub);

  const isOpen = (name) => openMenus.includes(name);

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-300/20 z-50 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* HEADER */}
      <div>
        {!collapsed && (
          <div className="p-4">
            <h1 className="text-lg font-bold text-black">Smart Health</h1>
            <p className="text-xs text-black opacity-60">
              Predictive Care System
            </p>
            <div className="mt-3 h-px w-full bg-gray-300/50" />
          </div>
        )}

        {/* MENU */}
        <div className="mt-2 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-110px)]">
          {menuItems.map(({ name, icon: Icon, submenu, path }) => (
            <div key={name}>
              {/* MAIN ITEM */}
              <div
                onClick={() =>
                  handleMainClick({ name, submenu, path })
                }
                className={`flex items-center justify-between px-4 py-3 mx-2 rounded-lg cursor-pointer transition ${
                  isMainActive(name)
                    ? "bg-black text-white"
                    : isParentActive(submenu)
                    ? "bg-gray-200 text-black"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={22} />
                  {!collapsed && (
                    <span className="text-[15px] font-semibold">
                      {name}
                    </span>
                  )}
                </div>

                {!collapsed && submenu && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isOpen(name) ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {/* SUBMENU */}
              {submenu && !collapsed && (
                <div
                  className={`ml-10 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${
                    isOpen(name) ? "max-h-40" : "max-h-0"
                  }`}
                >
                  {submenu.map((sub) => {
                    const active = activeSub === sub.name;

                    return (
                      <div
                        key={sub.name}
                        onClick={() => handleSubClick(name, sub)}
                        className={`px-2 py-1.5 rounded-md cursor-pointer text-[14px] font-semibold transition ${
                          active
                            ? "bg-black text-white"
                            : "text-black hover:bg-gray-100"
                        }`}
                      >
                        {sub.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu size={22} />
          {!collapsed && (
            <span className="text-[15px] font-semibold text-black">
              Collapse
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;