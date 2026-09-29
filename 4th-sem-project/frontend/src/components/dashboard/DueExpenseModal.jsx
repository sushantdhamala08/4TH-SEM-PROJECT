import { useState } from "react";
import { X, Check, Loader2, Calendar, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function DueExpenseModal({ isOpen, expense, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !expense) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Confirm the future expense (moves it to main expenses table)
      const res = await api.post("/expense/confirmFuture.php", {
        id: expense.id,
        amount: expense.amount, // Use current amount or allow editing if needed
        date: new Date().toISOString().split('T')[0] // Set payment date to today
      });

      if (res.data.success) {
        onSuccess(); // Triggers refresh in parent
      } else {
        alert("Failed to process: " + res.data.message);
      }
    } catch (error) {
      console.error("Confirmation error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 z-50 animate-in zoom-in-95 border-t-4 border-yellow-500">
        
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Due!</h2>
                <p className="text-sm text-gray-500">A scheduled payment is due today.</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-full">
                <Calendar className="text-yellow-600 h-6 w-6" />
            </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-500">Category</span>
                <span className="font-bold text-gray-800">{expense.category_name}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-500">Scheduled Date</span>
                <span className="text-sm text-gray-800">{expense.date}</span>
            </div>
            <div className="my-2 border-t border-gray-200 border-dashed"></div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Amount</span>
                <span className="text-xl font-bold text-blue-600">NPR {parseFloat(expense.amount).toLocaleString()}</span>
            </div>
            {expense.description && (
                <p className="mt-2 text-xs text-gray-400 italic">"{expense.description}"</p>
            )}
        </div>

        <div className="space-y-3">
            <Button 
                onClick={handleConfirm} 
                className="w-full bg-green-600 hover:bg-green-700 h-11 text-base shadow-md" 
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-5 w-5"/>}
                Confirm & Pay Now
            </Button>
            
            <Button 
                onClick={onClose} 
                variant="ghost" 
                className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
                <SkipForward className="mr-2 h-4 w-4" /> Skip for later
            </Button>
        </div>
      </div>
    </div>
  );
}