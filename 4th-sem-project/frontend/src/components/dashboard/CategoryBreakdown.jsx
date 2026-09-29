import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function CategoryBreakdown({ categories, categoryBudgets }) {
  const sortedCategories = [...categories].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-gray-800">Budget Usage by Category</CardTitle>
        <Wallet className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {sortedCategories.length > 0 ? (
          sortedCategories.map((cat, index) => {
            const spent = cat.value;
            const limit = categoryBudgets[cat.name] || 0; 
            
            let percentage = 0;
            let barColor = "bg-green-500";
            let label = "No limit set";

            if (limit > 0) {
                percentage = Math.min(((spent / limit) * 100), 100);
                label = `Limit: ${limit.toLocaleString()}`;
                
                if (percentage > 90) barColor = "bg-red-500";
                else if (percentage > 70) barColor = "bg-yellow-500";
                else barColor = "bg-blue-500";
            }

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{cat.name}</span>
                  <div className="text-right">
                    <span className="font-bold block">NPR {spent.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                </div>
                
                {/* Custom Progress Bar */}
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: limit > 0 ? `${percentage}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 py-4">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}