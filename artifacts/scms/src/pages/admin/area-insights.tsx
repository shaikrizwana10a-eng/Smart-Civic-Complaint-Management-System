import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListComplaints } from "@workspace/api-client-react";
import { Building2, Loader2 } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function AreaInsights() {
  useDocumentTitle("Area Insights");
  const { data: complaints, isLoading } = useListComplaints();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const groupedComplaints =
    complaints?.reduce(
      (acc, complaint) => {
        const area = complaint.area;

        if (!acc[area]) {
          acc[area] = [];
        }

        acc[area].push(complaint);

        return acc;
      },
      {} as Record<string, typeof complaints>,
    ) ?? {};

  const areaEntries = Object.entries(groupedComplaints);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 overflow-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Area Insights</h1>
          <p className="text-sm text-slate-500">
            Complaints grouped by area — select an area to view its complaints in detail.
          </p>
        </div>

        {areaEntries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {areaEntries.map(([area, areaComplaints]) => (
              <button
                key={area}
                type="button"
                onClick={() =>
                  setLocation(
                    `/admin/complaints?area=${encodeURIComponent(area)}`,
                  )
                }
                className="text-left bg-white border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="bg-primary/10 p-1.5 rounded-md shrink-0">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 truncate">{area}</h2>
                </div>
                <p className="text-sm text-slate-500">
                  {areaComplaints.length} complaint
                  {areaComplaints.length !== 1 ? "s" : ""}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white border rounded-xl py-16 text-center text-sm text-slate-400">
            No complaints have been registered yet.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
