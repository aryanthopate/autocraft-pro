import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Car, ClipboardList, FileText, Settings,
  Menu, X, LogOut, Key, Sparkles, Wrench, Sun, Moon,
  Package, Calculator, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, studio, signOut, isOwner } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const role = profile?.role;

  const getNavigation = () => {
    if (isOwner) {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Jobs", href: "/dashboard/jobs", icon: ClipboardList },
        { name: "Customers", href: "/dashboard/customers", icon: Users },
        { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
        { name: "Staff", href: "/dashboard/staff", icon: Users },
        { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ];
    }
    if (role === "mechanic") {
      return [
        { name: "Workbench", href: "/mechanic", icon: Wrench },
        { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
      ];
    }
    return [
      { name: "My Jobs", href: "/staff", icon: ClipboardList },
      { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
    ];
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-between px-5 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-sidebar-foreground">
                DetailFlow
              </span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Studio info */}
          {studio && (
            <div className="px-4 py-3 border-b border-sidebar-border">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{studio.name}</p>
              {isOwner && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Key className="h-3 w-3 text-sidebar-foreground/50" />
                  <span className="text-[10px] text-sidebar-foreground/50 font-mono">{studio.join_key}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Theme toggle + User section */}
          <div className="p-3 border-t border-sidebar-border space-y-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>

            {/* User */}
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">
                  {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 capitalize">{profile?.role || "staff"}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <NotificationBell />
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
