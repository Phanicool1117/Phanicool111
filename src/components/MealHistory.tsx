import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = 'diet_meals';

type Meal = {
  id: string;
  meal_name: string;
  meal_type?: string;
  meal_date: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  serving_info?: string;
  notes?: string;
  created_at: string;
};

export const MealHistory = () => {
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    fetchRecentMeals();
    
    const handleStorage = () => fetchRecentMeals();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('meals-updated', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('meals-updated', handleStorage);
    };
  }, []);

  const fetchRecentMeals = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      
      const allMeals = JSON.parse(stored);
      const sorted = allMeals.sort((a: Meal, b: Meal) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setMeals(sorted.slice(0, 10));
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Meals</CardTitle>
        <CardDescription>Your latest meal entries</CardDescription>
      </CardHeader>
      <CardContent>
        {meals.length === 0 ? (
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
                  {meal.serving_info && (
                    <p className="text-xs text-muted-foreground">{meal.serving_info}</p>
                  )}
                  {meal.notes && (
                    <p className="text-sm text-muted-foreground italic">{meal.notes}</p>
                  )}
                </div>
                <div className="text-right space-y-1 ml-4">
                  {meal.calories && (
                    <p className="text-sm font-medium">{meal.calories} cal</p>
                  )}
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {meal.protein !== undefined && <p>P: {meal.protein}g</p>}
                    {meal.carbs !== undefined && <p>C: {meal.carbs}g</p>}
                    {meal.fat !== undefined && <p>F: {meal.fat}g</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
