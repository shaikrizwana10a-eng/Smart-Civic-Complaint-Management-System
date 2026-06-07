import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Building2, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Building2 className="h-6 w-6" />
            <span className="font-bold text-lg text-foreground tracking-tight">SCMS</span>
          </Link>
          
          <nav className="flex items-center gap-1 md:gap-4">
            <Link href="/register">
              <Button variant={location === "/register" ? "secondary" : "ghost"} size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Register Complaint</span>
              </Button>
            </Link>
            <Link href="/track">
              <Button variant={location === "/track" ? "secondary" : "ghost"} size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Track Status</span>
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="ml-2">
                Admin
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>© {new Date().getFullYear()} SCMS Portal. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/track" className="hover:text-foreground transition-colors">Track</Link>
            <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}