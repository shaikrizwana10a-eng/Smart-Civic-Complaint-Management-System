import { useEffect } from "react";

/**
 * Sets the browser tab title for the current page, always suffixed with the
 * SCMS brand so every tab is clearly identifiable across the app.
 */
export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = pageTitle ? `${pageTitle} — SCMS` : "SCMS — Smart Civic Complaint Management System";
    return () => {
      document.title = previousTitle;
    };
  }, [pageTitle]);
}
