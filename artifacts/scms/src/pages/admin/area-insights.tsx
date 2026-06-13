import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListComplaints } from "@workspace/api-client-react";

export default function AreaInsights() {
  const { data: complaints, isLoading } = useListComplaints();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <AdminLayout>
        <p>Loading...</p>
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Area Insights</h1>
          <p className="text-slate-500">View complaints grouped by area.</p>
        </div>

        <div className="grid gap-4">
          {Object.entries(groupedComplaints).map(([area, areaComplaints]) => (
            <div
              key={area}
              onClick={() =>
                setLocation(
                  `/admin/complaints?area=${encodeURIComponent(area)}`,
                )
              }
              className="bg-white border rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md hover:border-primary transition-all"
            >
              <h2 className="text-xl font-semibold">{area}</h2>

              <p className="text-slate-500">
                {areaComplaints.length} complaint
                {areaComplaints.length !== 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
