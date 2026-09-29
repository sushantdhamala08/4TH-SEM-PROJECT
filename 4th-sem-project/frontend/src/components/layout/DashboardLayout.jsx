import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, PanelLeftClose, PanelLeftOpen, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden">
      
      <div className="hidden md:block shadow-sm z-20">
        <Sidebar isCollapsed={isCollapsed} />
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-50 h-full">
             <Sidebar isCollapsed={false} className="shadow-2xl" />
             <button 
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 -right-10 text-white p-2 bg-gray-800 rounded-full"
             >
                <X size={20} />
             </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex text-gray-500 hover:text-blue-600" 
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex items-center gap-3 relative" ref={userMenuRef}>
             <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 pl-3 outline-none"
             >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-none">{user?.name || "User"}</p>
                </div>
                <div className="h-9 w-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold border border-blue-200 hover:bg-blue-200 transition-colors">
                   {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
             </button>

             {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || "user@example.com"}</p>
                  </div>
                  
                  <div className="p-1">
                    <button 
                       onClick={() => {
                           navigate("/profile");
                           setIsUserMenuOpen(false);
                       }}
                       className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                       <User size={16} className="text-gray-500" />
                       Profile
                    </button>
                    
                    <button 
                       onClick={logout}
                       className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                       <LogOut size={16} />
                       Sign Out
                    </button>
                  </div>
                </div>
             )}
          </div>

        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}