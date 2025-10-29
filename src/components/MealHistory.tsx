import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export const MealHistory = () => {
  const { data: meals, isLoading } = useQuery({
    queryKey: ["recent-meals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .order("meal_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case "breakfast":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "lunch":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "dinner":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "snack":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Meals</CardTitle>
        <CardDescription>Your latest meal entries</CardDescription>
      </CardHeader>
      <CardContent>
        {!meals || meals.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No meals logged yet. Start chatting to track your first meal!
          </p>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{meal.meal_name}</p>
                    {meal.meal_type && (
                      <Badge variant="secondary" className={getMealTypeColor(meal.meal_type)}>
                        {meal.meal_type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(meal.meal_date), "MMM d, yyyy")}
                  </p>
                  {meal.notes && (
                    <p className="text-sm text-muted-foreground italic">{meal.notes}</p>
                  )}
                </div>
                <div className="text-right space-y-1 ml-4">
                  {meal.calories && (
                    <p className="text-sm font-medium">{meal.calories} cal</p>
                  )}
                  {meal.protein && (
                    <p className="text-xs text-muted-foreground">{meal.protein}g protein</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
