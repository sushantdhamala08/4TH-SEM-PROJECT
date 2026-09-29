import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarClock, 
  Activity, 
  Plus, 
  Loader2, 
  History, 
  AlertCircle 
} from "lucide-react";
import api from "@/api/axios";
import AddExpenseModal from "@/components/dashboard/AddExpenseModal";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Fetch both system logs and pending future expenses
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [logRes, pendingRes] = await Promise.all([
        api.get("/user/getLogs.php"),
        api.get("/expense/getPendingExpenses.php")
      ]);

      if (logRes.data.success) {
        setLogs(logRes.data.data);
      }
      if (pendingRes.data.success) {
        setPending(pendingRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch activity data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Logic to determine badge color based on action type
   * Handles: Added, Updated, Deleted, Scheduled, Income, Budget, and Profile
   */
  const getStatusStyle = (action) => {
    const act = action.toUpperCase();
    
    // Money In / Success actions
    if (act.includes('ADDED') || act.includes('INCOME') || act.includes('CONFIRMED')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    
    // Deletions / Danger
    if (act.includes('DELETED') || act.includes('CANCELLED')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    // Modifications / Settings / Budgets
    if (act.includes('UPDATED') || act.includes('SET') || act.includes('BUDGET') || act.includes('PROFILE')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    
    // Future Planning
    if (act.includes('SCHEDULED') || act.includes('PLANNED')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }

    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Activity Log</h1>
            <p className="text-muted-foreground">Monitoring all transactions, budget changes, and income updates.</p>
          </div>
          <Button 
            onClick={() => setIsAddOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Schedule Expense
          </Button>
        </div>

        {/* 1. UPCOMING / SCHEDULED SECTION */}
        <Card className="border-l-4 border-l-yellow-500 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 bg-yellow-50/30 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-yellow-700 text-lg">
              <CalendarClock className="h-5 w-5" /> Upcoming Scheduled Items
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-yellow-500" /></div>
            ) : pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <History className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No upcoming expenses found.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pending.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-yellow-100 p-4 rounded-xl shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">
                        {item.date}
                      </span>
                      <span className="font-bold text-gray-900">NPR {parseFloat(item.amount).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 truncate">{item.category_name}</p>
                    <p className="text-xs text-gray-500 italic mt-1 line-clamp-1">
                      {item.description || "No specific details provided."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. FULL AUDIT LOG TABLE */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b bg-gray-50/50 py-4">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Activity className="h-5 w-5 text-blue-600" /> System Activity Audit
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : logs.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-gray-200 mb-2" />
                  <p className="text-gray-400">Your transaction history is empty.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-bold border-b">Action Type</th>
                      <th className="px-6 py-3 font-bold border-b">Description of Change</th>
                      <th className="px-6 py-3 font-bold border-b text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-tighter ${getStatusStyle(log.action)}`}>
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {log.details}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 text-xs font-mono">
                          {new Date(log.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Floating Add Modal */}
        <AddExpenseModal 
          isOpen={isAddOpen} 
          onClose={() => setIsAddOpen(false)} 
          onSuccess={fetchData} 
        />

      </div>
    </DashboardLayout>
  );
}