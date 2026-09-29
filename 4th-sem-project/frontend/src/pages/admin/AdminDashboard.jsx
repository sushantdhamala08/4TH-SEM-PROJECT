import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, TrendingDown, TrendingUp, Wallet, LayoutDashboard } from "lucide-react";
import api from "@/api/axios";

// Constants for filters
const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [period, setPeriod] = useState("Monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [data, setData] = useState({ 
    stats: {}, 
    pieData: { income: [], expense: [], budget: [] } 
  });

  const INCOME_COLORS = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#047857'];
  const EXPENSE_COLORS = ['#ef4444', '#f87171', '#dc2626', '#fca5a5', '#b91c1c', '#f59e0b', '#d97706'];
  const BUDGET_COLORS = ['#3b82f6', '#60a5fa', '#2563eb', '#93c5fd', '#1d4ed8'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Pass the filter parameters to the backend
        const res = await api.get(`/admin/getDashboardStats.php?period=${period}&month=${selectedMonth}&year=${selectedYear}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period, selectedMonth, selectedYear]); // Re-fetch when filters change

  // Helper component to render empty state or the PieChart
  const ChartDisplay = ({ chartData, colors, name }) => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No data available for {name}
        </div>
      );
    }
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
                formatter={(value) => `NPR ${value.toLocaleString()}`} 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300 pb-10">
        
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-gray-800" /> System Overview
            </h1>
            <p className="text-muted-foreground mt-1">Combined financial statistics across all registered users.</p>
          </div>

          {/* Filter UI */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
            <select 
                className="p-2 bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer" 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
            >
                <option value="Weekly">Weekly View</option>
                <option value="Monthly">Monthly View</option>
                <option value="Yearly">Yearly View</option>
            </select>
            
            {period === "Monthly" && (
                <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
                    <select 
                        className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer p-1" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {MONTHS.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                    </select>
                    <select 
                        className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer p-1" 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {YEARS.map(y => (<option key={y} value={y}>{y}</option>))}
                    </select>
                </div>
            )}
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-40">
               <Loader2 className="animate-spin text-gray-800 h-10 w-10" />
            </div>
        ) : (
            <>
                {/* Top Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-500">Total System Income</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        NPR {parseFloat(data.stats.total_income || 0).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-500">Total System Expenses</CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        NPR {parseFloat(data.stats.total_expense || 0).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-500">Total Budgets Set</CardTitle>
                      <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        NPR {parseFloat(data.stats.total_budget || 0).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Three Pie Charts Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-center text-lg text-gray-800">Income Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartDisplay chartData={data.pieData.income} colors={INCOME_COLORS} name="Incomes" />
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-center text-lg text-gray-800">Expense Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartDisplay chartData={data.pieData.expense} colors={EXPENSE_COLORS} name="Expenses" />
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-center text-lg text-gray-800">Budget Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartDisplay chartData={data.pieData.budget} colors={BUDGET_COLORS} name="Budgets" />
                    </CardContent>
                  </Card>
                </div>
            </>
        )}
      </div>
    </DashboardLayout>
  );
}