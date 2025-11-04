import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChatInterface } from "@/components/ChatInterface";
import { DietStats } from "@/components/DietStats";
import { MealHistory } from "@/components/MealHistory";
import { FoodSearchDialog } from "@/components/FoodSearchDialog";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { RecipeBuilder } from "@/components/RecipeBuilder";
import { Settings } from "@/components/Settings";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "@/lib/auditLog";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foodSearchOpen, setFoodSearchOpen] = useState(false);
  const currentTab = searchParams.get('tab') || 'chat';

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'chat' });
    }
  }, [searchParams, setSearchParams]);

  const handleAddFood = async (food: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const mealData = {
        user_id: user.id,
        meal_name: food.name,
        meal_type: "snack",
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fat,
        notes: `${food.servings} × ${food.serving_size} ${food.serving_unit}`,
      };

      const { error } = await supabase.from("meals").insert(mealData);

      if (error) throw error;

      await logAuditEvent('meal_logged', 'meals', undefined, undefined, mealData);
      window.dispatchEvent(new Event('meals-updated'));
      toast.success('Food logged successfully! 🎉');
    } catch (error) {
      toast.error('Failed to save food data');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-soft">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-soft">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
              </div>
              <Button onClick={() => setFoodSearchOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Food
              </Button>
            </div>
          </header>

          <FoodSearchDialog 
            open={foodSearchOpen} 
            onOpenChange={setFoodSearchOpen}
            onAddFood={handleAddFood}
          />

          <div className="flex-1 container mx-auto p-4">
            {currentTab === 'chat' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
                <div className="lg:col-span-2 bg-card rounded-lg shadow-soft border overflow-hidden flex flex-col">
                  <ChatInterface />
                </div>
                <div className="hidden lg:block space-y-6 overflow-y-auto">
                  <DietStats />
                  <MealHistory />
                </div>
              </div>
            )}

            {currentTab === 'progress' && <ProgressDashboard />}

            {currentTab === 'recipes' && <RecipeBuilder />}

            {currentTab === 'meals' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DietStats />
                <MealHistory />
              </div>
            )}

            {currentTab === 'settings' && <Settings />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
