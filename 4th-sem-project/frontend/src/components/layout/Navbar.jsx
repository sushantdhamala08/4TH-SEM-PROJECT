import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-2 font-bold text-xl text-primary">
        <Wallet className="h-6 w-6" />
        <span>ExpenseTracker</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Hello, {user?.name}</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </nav>
  );
}