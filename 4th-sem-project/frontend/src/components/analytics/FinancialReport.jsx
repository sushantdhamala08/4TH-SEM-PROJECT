import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, AlertTriangle, CheckCircle, Info, CalendarDays } from "lucide-react";
import api from "@/api/axios";

export default function FinancialReport() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("Monthly"); // Weekly, Monthly, Yearly

  const [data, setData] = useState({
    Weekly: { budget: 0, spent: 0 },
    Monthly: { budget: 0, spent: 0 },
    Yearly: { budget: 0, spent: 0 },
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all data upfront so switching is instant
        const [
          wBudget, wExp,
          mBudget, mExp,
          yBudget, yExp
        ] = await Promise.all([
          api.get('/budget/getBudget.php?type=Weekly'),
          api.get('/analytics/getExpenseSummary.php?period=Weekly'),
          api.get('/budget/getBudget.php?type=Monthly'),
          api.get('/analytics/getExpenseSummary.php?period=Monthly'),
          api.get('/budget/getBudget.php?type=Yearly'),
          api.get('/analytics/getExpenseSummary.php?period=Yearly'),
        ]);

        setData({
          Weekly: { 
            budget: parseFloat(wBudget.data.data?.amount || 0), 
            spent: parseFloat(wExp.data.totalExpense || 0) 
          },
          Monthly: { 
            budget: parseFloat(mBudget.data.data?.amount || 0), 
            spent: parseFloat(mExp.data.totalExpense || 0) 
          },
          Yearly: { 
            budget: parseFloat(yBudget.data.data?.amount || 0), 
            spent: parseFloat(yExp.data.totalExpense || 0) 
          },
        });
      } catch (error) {
        console.error("Failed to generate report", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center text-gray-400">
          <div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Analyzing Finances...</div>
        </CardContent>
      </Card>
    );
  }

  // --- REPORT GENERATION LOGIC ---

  const currentData = data[view];
  
  // Logic to determine status
  let status = 'neutral';
  let diff = 0;
  let percent = 0;

  if (currentData.budget > 0) {
      diff = currentData.budget - currentData.spent;
      percent = ((currentData.spent / currentData.budget) * 100).toFixed(0);
      status = diff >= 0 ? 'good' : 'bad';
  }

  const getStatusColor = () => {
      if (status === 'good') return "bg-green-100 text-green-700 border-green-200";
      if (status === 'bad') return "bg-red-100 text-red-700 border-red-200";
      return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const StatusIcon = status === 'good' ? CheckCircle : AlertTriangle;

  return (
    <Card className="bg-white border-gray-200 shadow-sm transition-all duration-300">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <FileText className="h-5 w-5 text-blue-600" /> Financial Health Report
        </CardTitle>

        {/* Toggle Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {["Weekly", "Monthly", "Yearly"].map((v) => (
                <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        view === v 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    {v}
                </button>
            ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6 animate-in fade-in duration-300" key={view}>
        
        {/* Main Status Block */}
        <div className={`p-4 rounded-xl border flex items-start gap-4 ${getStatusColor()}`}>
            <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                <StatusIcon className={`h-6 w-6 ${status === 'good' ? 'text-green-500' : status === 'bad' ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            <div>
                <h3 className="font-bold text-lg mb-1">{view} Status: {status === 'good' ? "Healthy" : status === 'bad' ? "Over Budget" : "No Limit Set"}</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                    {currentData.budget === 0 ? (
                        <>You have spent <b>NPR {currentData.spent.toLocaleString()}</b>. Set a budget to track your progress.</>
                    ) : status === 'good' ? (
                        <>You are within your budget! You have spent <b>{percent}%</b> (NPR {currentData.spent.toLocaleString()}) of your limit, leaving <b>NPR {diff.toLocaleString()}</b> available.</>
                    ) : (
                        <>Critical: You have exceeded your {view.toLowerCase()} limit by <b>NPR {Math.abs(diff).toLocaleString()}</b>.</>
                    )}
                </p>
            </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Budget Limit</span>
                <div className="text-lg font-bold text-gray-800 mt-1">
                    {currentData.budget > 0 ? `NPR ${currentData.budget.toLocaleString()}` : 'Not Set'}
                </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Spent</span>
                <div className={`text-lg font-bold mt-1 ${status === 'bad' ? 'text-red-600' : 'text-gray-800'}`}>
                    NPR {currentData.spent.toLocaleString()}
                </div>
            </div>
        </div>
        
        {/* Contextual Recommendation */}
        <div className="flex gap-3 items-start text-sm text-gray-600 border-t border-gray-100 pt-4">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p>
                <strong>AI Insight:</strong> 
                {status === 'bad' 
                    ? ` Since you are over budget for the ${view.toLowerCase()}, consider delaying non-essential purchases until the next cycle.` 
                    : ` Great job maintaining your finances! If this trend continues, you will save roughly NPR ${(diff * (view === 'Weekly' ? 4 : 1)).toLocaleString()} this month.`}
            </p>
        </div>

      </CardContent>
    </Card>
  );
}