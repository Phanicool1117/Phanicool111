import { ChatInterface } from "@/components/ChatInterface";
import { DietStats } from "@/components/DietStats";
import { MealHistory } from "@/components/MealHistory";
import { FoodSearchDialog } from "@/components/FoodSearchDialog";
import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const [foodSearchOpen, setFoodSearchOpen] = useState(false);

  const handleAddFood = (food: any) => {
    try {
      const stored = localStorage.getItem('diet_meals');
      const meals = stored ? JSON.parse(stored) : [];
      
      const newMeal = {
        id: crypto.randomUUID(),
        meal_name: food.name,
        meal_type: "snack",
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        serving_info: `${food.servings} × ${food.serving_size} ${food.serving_unit}`,
        meal_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      
      meals.push(newMeal);
      localStorage.setItem('diet_meals', JSON.stringify(meals));
      
      window.dispatchEvent(new Event('meals-updated'));
      toast.success('Food logged successfully! 🎉');
    } catch (error) {
      console.error('Error saving food:', error);
      toast.error('Failed to save food data');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🥗</div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Diet Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setFoodSearchOpen(true)} size="sm" className="hidden md:flex">
              <Plus className="h-4 w-4 mr-2" />
              Add Food
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your Stats</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <Button onClick={() => setFoodSearchOpen(true)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Food
                  </Button>
                  <DietStats />
                  <MealHistory />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <FoodSearchDialog 
        open={foodSearchOpen} 
        onOpenChange={setFoodSearchOpen}
        onAddFood={handleAddFood}
      />

      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-5rem)]">
        <div className="lg:col-span-2 bg-card rounded-lg shadow-soft border overflow-hidden flex flex-col">
          <ChatInterface />
        </div>

        <div className="hidden lg:block space-y-6 overflow-y-auto">
          <DietStats />
          <MealHistory />
        </div>
      </div>
    </div>
  );
};

export default Index;
