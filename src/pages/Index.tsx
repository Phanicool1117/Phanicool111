import { ChatInterface } from "@/components/ChatInterface";
import { DietStats } from "@/components/DietStats";
import { MealHistory } from "@/components/MealHistory";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {

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
                <DietStats />
                <MealHistory />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

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
