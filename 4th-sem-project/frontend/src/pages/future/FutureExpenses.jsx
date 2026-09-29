import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, CheckCircle, Plus, Loader2, CalendarClock } from "lucide-react";
import api from "@/api/axios";
import ScheduleExpenseModal from "@/components/dashboard/ScheduleExpenseModal";
import EditFutureExpenseModal from "@/components/dashboard/EditFutureExpenseModal";
import ProcessFutureExpenseModal from "@/components/dashboard/ProcessFutureExpenseModal";

export default function FutureExpenses() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Get today's date in YYYY-MM-DD format (local timezone safe)
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const fetchPending = async () => {
    try {
      const res = await api.get("/expense/getPendingExpenses.php");
      if (res.data.success) {
        setPending(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this scheduled expense?")) return;
    try {
      await api.post("/expense/deleteFutureExpense.php", { id });
      fetchPending();
    } catch (err) { console.error(err); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Future Expenses</h1>
                <p className="text-muted-foreground">Add, Edit or Process scheduled transactions.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600">
                <Plus size={18} className="mr-2"/> Schedule New
            </Button>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pending.map((item) => {
              // Check if the item's date is today or in the past
              const isProcessable = item.date <= todayString;

              return (
                <Card key={item.id} className="border-l-4 border-l-blue-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{item.date}</span>
                      <span className="font-bold">NPR {parseFloat(item.amount).toLocaleString()}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">{item.category_name}</h3>
                    <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{item.description || "No description"}</p>
                    
                    <div className="flex gap-2 border-t pt-3">
                      {/* Process Button - Disabled if date is in the future */}
                      <Button 
                          variant="outline" 
                          size="sm" 
                          className={`flex-1 border-green-100 ${isProcessable ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 bg-gray-50'}`} 
                          onClick={() => { setSelected(item); setIsProcessOpen(true); }}
                          disabled={!isProcessable}
                          title={!isProcessable ? "Cannot process before scheduled date" : "Process Expense"}
                      >
                          <CheckCircle size={14} className="mr-1"/> Process
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => { setSelected(item); setIsEditOpen(true); }}>
                          <Pencil size={14}/>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={14}/>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {pending.length === 0 && (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
                    <CalendarClock className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-400">No upcoming expenses scheduled.</p>
                </div>
            )}
          </div>
        )}

        {/* MODALS */}
        <ScheduleExpenseModal 
            isOpen={isAddOpen} 
            onClose={() => setIsAddOpen(false)} 
            onSuccess={fetchPending} 
        />

        {selected && (
            <>
                <EditFutureExpenseModal 
                    isOpen={isEditOpen} 
                    expense={selected} 
                    onClose={() => { setIsEditOpen(false); setSelected(null); }} 
                    onSuccess={fetchPending} 
                />
                <ProcessFutureExpenseModal 
                    isOpen={isProcessOpen} 
                    expense={selected} 
                    onClose={() => { setIsProcessOpen(false); setSelected(null); }} 
                    onSuccess={fetchPending} 
                />
            </>
        )}
      </div>
    </DashboardLayout>
  );
}