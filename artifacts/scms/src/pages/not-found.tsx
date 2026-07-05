import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Building2, Home, SearchX } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function NotFound() {
  useDocumentTitle("Page Not Found");

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 p-4 rounded-2xl mb-6">
          <SearchX className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-500 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-10">
          <Building2 className="h-3.5 w-3.5" />
          Smart Civic Complaint Management System
        </div>
      </div>
    </div>
  );
}
