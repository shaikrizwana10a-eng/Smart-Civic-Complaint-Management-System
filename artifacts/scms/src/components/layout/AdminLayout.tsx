import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ListTodo, 
  LogOut, 
  Building2,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAdminLogout } from "@workspace/api-client-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const logout = useAdminLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/admin/login");
      }
    });
  };

  const NavItems = () => (
    <>
      <Link href="/admin">
        <Button 
          variant={location === "/admin" ? "secondary" : "ghost"} 
          className="w-full justify-start gap-3"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      <Link href="/admin/complaints">
        <Button 
          variant={location === "/admin/complaints" ? "secondary" : "ghost"} 
          className="w-full justify-start gap-3"
        >
          <ListTodo className="h-4 w-4" />
          Complaints
        </Button>
      </Link>
    </>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between border-b bg-sidebar px-4 h-14 text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <span className="font-bold tracking-tight">SCMS Admin</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar border-sidebar-border text-sidebar-foreground p-0 flex flex-col">
            <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg tracking-tight">SCMS</span>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <NavItems />
            </div>
            <div className="p-4 border-t border-sidebar-border">
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground sticky top-0 h-[100dvh]">
        <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">SCMS</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItems />
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}