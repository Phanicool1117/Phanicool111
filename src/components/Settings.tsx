import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Settings as SettingsIcon, FileJson, FileImage } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "@/lib/auditLog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Settings = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [showRecipes, setShowRecipes] = useState(
    localStorage.getItem('showRecipes') !== 'false'
  );
  const [showMealHistory, setShowMealHistory] = useState(
    localStorage.getItem('showMealHistory') !== 'false'
  );

  const handleToggleRecipes = (checked: boolean) => {
    setShowRecipes(checked);
    localStorage.setItem('showRecipes', String(checked));
    window.dispatchEvent(new Event('settings-updated'));
  };

  const handleToggleMealHistory = (checked: boolean) => {
    setShowMealHistory(checked);
    localStorage.setItem('showMealHistory', String(checked));
    window.dispatchEvent(new Event('settings-updated'));
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    setExportLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all user data
      const [profileRes, mealsRes, recipesRes, weightLogsRes, chatRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('meals').select('*').eq('user_id', user.id),
        supabase.from('recipes').select('*, recipe_ingredients(*)').eq('user_id', user.id),
        supabase.from('weight_logs').select('*').eq('user_id', user.id),
        supabase.from('chat_messages').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email,
        profile: profileRes.data,
        meals: mealsRes.data,
        recipes: recipesRes.data,
        weight_logs: weightLogsRes.data,
        chat_messages: chatRes.data,
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diet-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Create CSV for meals
        const mealsCSV = [
          ['Date', 'Meal Name', 'Type', 'Calories', 'Protein', 'Carbs', 'Fat', 'Notes'],
          ...(mealsRes.data || []).map(m => [
            m.meal_date,
            m.meal_name,
            m.meal_type || '',
            m.calories || '',
            m.protein || '',
            m.carbs || '',
            m.fats || '',
            m.notes || ''
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([mealsCSV], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diet-tracker-meals-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      await logAuditEvent('data_export', 'all_tables', user.id);
      toast.success(`Your data has been exported as ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold">Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>
            Customize which sections you want to see in the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="recipes-toggle">Show Recipes Section</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable the recipes builder section
              </p>
            </div>
            <Switch
              id="recipes-toggle"
              checked={showRecipes}
              onCheckedChange={handleToggleRecipes}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="meals-toggle">Show Meal History</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable the meal history display
              </p>
            </div>
            <Switch
              id="meals-toggle"
              checked={showMealHistory}
              onCheckedChange={handleToggleMealHistory}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>
            Download your data in different formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => handleExportData('json')} 
            disabled={exportLoading}
            className="w-full sm:w-auto"
            variant="outline"
          >
            <FileJson className="h-4 w-4 mr-2" />
            {exportLoading ? "Exporting..." : "Export as JSON"}
          </Button>
          <Button 
            onClick={() => handleExportData('csv')} 
            disabled={exportLoading}
            className="w-full sm:w-auto"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {exportLoading ? "Exporting..." : "Export Meals as CSV"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
