import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid 
} from "recharts";
import api from "@/api/axios";
import { Loader2, TrendingUp, Calendar } from "lucide-react";
import FinancialReport from "@/components/analytics/FinancialReport";
import BalanceSheet from "@/components/analytics/BalanceSheet";  

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]); 

  const fetchAnalytics = useCallback(async () => {
    try {
      const catRes = await api.get('/analytics/getMonthlySummary.php');
      if (catRes.data.status) {
        setCategoryData(catRes.data.byCategory.map(item => ({
          name: item.category,
          amount: parseFloat(item.total)
        })));
      }

      const trendRes = await api.get('/analytics/getDailyTrend.php');
      if (trendRes.data.status) {
        setTrendData(trendRes.data.data);
      }

    } catch (error) {
      console.error("Error fetching analytics", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  const topCategory = categoryData.length > 0 
    ? categoryData.reduce((prev, current) => (prev.amount > current.amount) ? prev : current)
    : { name: 'None', amount: 0 };

   return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your spending habits</p>
        </div>

        {/* 2. Balance Sheet (ADD THIS BELOW) */}
        <div className="grid gap-6">
           <BalanceSheet />
        </div>


        {/* 1. Health Report */}
        <div className="grid gap-6">
           <FinancialReport />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        formatter={(value) => `NPR ${value}`}
                        labelFormatter={(label) => `Day ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8b5cf6" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: "#8b5cf6" }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="h-full flex items-center justify-center text-gray-400">
                     No spending data found for this month.
                   </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}