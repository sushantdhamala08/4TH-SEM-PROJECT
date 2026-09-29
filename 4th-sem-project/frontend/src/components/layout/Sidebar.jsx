import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  PieChart, 
  Wallet, 
  LogOut,
  Layers,
  Banknote,
  ScrollText,
  CalendarClock,
  Users,
  ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar({ className, isCollapsed }) {
  const { logout, user } = useAuth(); 

  // Define routes and who is allowed to see them
  const allNavItems = [
    { label: "Overview", icon: user?.role === 'parent' ? Users : LayoutDashboard, path: "/dashboard", roles: ['student', 'parent', 'admin'] },
    { label: "Manage Users", icon: ShieldCheck, path: "/admin/users", roles: ['admin'] },
    { label: "Analytics", icon: PieChart, path: "/analytics", roles: ['student'] },
    { label: "Income", icon: Banknote, path: "/income", roles: ['student'] },
    { label: "Budgets", icon: Wallet, path: "/budgets", roles: ['student'] },
    { label: "Expenses", icon: Wallet, path: "/expenses", roles: ['student'] },
    { label: "Categories", icon: Layers, path: "/categories", roles: ['student'] },
    { label: "Future Expenses", icon: CalendarClock, path: "/future-expenses", roles: ['student'] },
    { label: "Activity", icon: ScrollText, path: "/activity", roles: ['student'] }, 
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role || 'student'));

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 shrink-0 transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className={cn(
        "h-16 flex items-center border-b border-gray-100",
        isCollapsed ? "justify-center px-0" : "px-6 gap-3"
      )}>
        <div className={`h-8 w-8 rounded-lg shrink-0 shadow-sm flex items-center justify-center text-white font-bold text-xs ${user?.role === 'admin' ? 'bg-gradient-to-tr from-gray-900 to-gray-700' : 'bg-gradient-to-tr from-blue-600 to-blue-400'}`}>
            {user?.role === 'admin' ? 'ADM' : user?.role === 'parent' ? 'FAM' : 'STU'}
        </div>
        <div className={cn(
          "font-bold text-lg tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300",
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}>
          <span className="text-gray-800">Set</span><span className="text-blue-600">Trade</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : ""}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-lg transition-all duration-200 group whitespace-nowrap",
                isCollapsed ? "justify-center p-3" : "px-3 py-2 gap-3",
                isActive 
                  ? "bg-blue-50 text-blue-600 font-medium" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            <item.icon className={cn("shrink-0", isCollapsed ? "h-6 w-6" : "h-5 w-5")} />
            <span className={cn(
              "transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={logout}
          title={isCollapsed ? "Logout" : ""}
          className={cn(
            "w-full flex items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors whitespace-nowrap",
             isCollapsed ? "justify-center p-3" : "px-3 py-2 gap-3"
          )}
        >
          <LogOut className={cn("shrink-0", isCollapsed ? "h-6 w-6" : "h-5 w-5")} />
          <span className={cn(
              "transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}