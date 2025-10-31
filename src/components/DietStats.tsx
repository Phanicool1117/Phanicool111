import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Flame, TrendingUp, Utensils } from "lucide-react";

const STORAGE_KEY = 'diet_meals';

export const DietStats = () => {
  const [weeklyStats, setWeeklyStats] = useState({
    calories: 0,
    protein: 0,
    meals: 0,
    avgCalories: 0,
  });

  useEffect(() => {
    fetchWeeklyStats();
    
    const handleStorage = () => fetchWeeklyStats();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('meals-updated', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('meals-updated', handleStorage);
    };
  }, []);

  const fetchWeeklyStats = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      
      const meals = JSON.parse(stored);
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      const weeklyMeals = meals.filter((meal: any) => {
        const mealDate = new Date(meal.meal_date);
        return mealDate >= sevenDaysAgo && mealDate <= today;
      });

      const totalCalories = weeklyMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
      const totalProtein = weeklyMeals.reduce((sum: number, meal: any) => sum + (Number(meal.protein) || 0), 0);
      const totalMeals = weeklyMeals.length;

      setWeeklyStats({
        calories: totalCalories,
        protein: Math.round(totalProtein),
        meals: totalMeals,
        avgCalories: totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const stats = [
    {
      title: "This Week",
      value: weeklyStats.calories,
      unit: "calories",
      icon: Flame,
      color: "text-orange-500",
    },
    {
      title: "Protein",
      value: weeklyStats.protein,
      unit: "grams",
      icon: Apple,
      color: "text-primary",
    },
    {
      title: "Meals Logged",
      value: weeklyStats.meals,
      unit: "meals",
      icon: Utensils,
      color: "text-accent",
    },
    {
      title: "Avg per Meal",
      value: weeklyStats.avgCalories,
      unit: "calories",
      icon: TrendingUp,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.unit}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
