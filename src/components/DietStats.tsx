import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Flame, TrendingUp, Utensils } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";

export const DietStats = () => {
  const { data: weeklyStats } = useQuery({
    queryKey: ["weekly-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const weekStart = format(startOfWeek(new Date()), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(new Date()), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("meal_date", weekStart)
        .lte("meal_date", weekEnd);

      if (error) throw error;

      const totalCalories = data.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const totalProtein = data.reduce((sum, meal) => sum + (Number(meal.protein) || 0), 0);
      const totalMeals = data.length;

      return {
        calories: totalCalories,
        protein: Math.round(totalProtein),
        meals: totalMeals,
        avgCalories: totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0,
      };
    },
  });

  const stats = [
    {
      title: "This Week",
      value: weeklyStats?.calories || 0,
      unit: "calories",
      icon: Flame,
      color: "text-orange-500",
    },
    {
      title: "Protein",
      value: weeklyStats?.protein || 0,
      unit: "grams",
      icon: Apple,
      color: "text-primary",
    },
    {
      title: "Meals Logged",
      value: weeklyStats?.meals || 0,
      unit: "meals",
      icon: Utensils,
      color: "text-accent",
    },
    {
      title: "Avg per Meal",
      value: weeklyStats?.avgCalories || 0,
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
