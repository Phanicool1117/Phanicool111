import { MessageSquare, TrendingUp, ChefHat, Utensils, Settings as SettingsIcon, LogOut, Dumbbell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "@/lib/auditLog";

const navigationItems = [
  { title: "Chat", icon: MessageSquare, tab: "chat" },
  { title: "Progress", icon: TrendingUp, tab: "progress" },
  { title: "Recipes", icon: ChefHat, tab: "recipes" },
  { title: "Meals", icon: Utensils, tab: "meals" },
  { title: "Exercise", icon: Dumbbell, tab: "exercise" },
  { title: "Settings", icon: SettingsIcon, tab: "settings" },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentTab = new URLSearchParams(location.search).get('tab') || 'chat';

  const handleNavigation = (tab: string) => {
    navigate(`/?tab=${tab}`);
  };

  const handleSignOut = async () => {
    await logAuditEvent('user_logout', 'auth', undefined);
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-4">
            {open && (
              <div className="flex items-center gap-2">
                <div className="text-2xl">🥗</div>
                <span className="font-semibold text-lg bg-gradient-primary bg-clip-text text-transparent">
                  Diet Tracker
                </span>
              </div>
            )}
            {!open && (
              <div className="text-2xl mx-auto">🥗</div>
            )}
          </div>
          
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = currentTab === item.tab;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.tab)}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
