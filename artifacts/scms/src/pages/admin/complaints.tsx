import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListComplaints,
  useUpdateComplaint,
  useDeleteComplaint,
  useGetAdminSession,
  getListComplaintsQueryKey,
  getGetAdminSessionQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Trash2, Loader2, AlertTriangle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["Pending", "In Progress", "Resolved"];
const CATEGORIES = [
  "Water Supply", "Electricity", "Road Damage", "Drainage",
  "Street Light", "Sanitation", "Garbage Collection", "Public Property Damage", "Other",
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    Resolved: "bg-green-50 text-green-700 border-green-200",
  };
  return <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${map[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

export default function AdminComplaints() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({ query: { queryKey: getGetAdminSessionQueryKey(), retry: false } });

  useEffect(() => {
    if (!sessionLoading && (!session || !session.authenticated)) {
      setLocation("/admin/login");
    }
  }, [session, sessionLoading, setLocation]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const params = {
    ...(statusFilter !== "all" && { status: statusFilter as "Pending" | "In Progress" | "Resolved" }),
    ...(categoryFilter !== "all" && { category: categoryFilter }),
    ...(search && { search }),
  };

  const { data: complaints, isLoading } = useListComplaints(params, {
    query: { queryKey: getListComplaintsQueryKey(params) },
  });

  const updateComplaint = useUpdateComplaint();
  const deleteComplaint = useDeleteComplaint();

  function handleStatusChange(id: number, status: string) {
    updateComplaint.mutate(
      { params: { id }, data: { status: status as "Pending" | "In Progress" | "Resolved" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListComplaintsQueryKey() });
          toast({ title: "Status updated", description: `Complaint status changed to ${status}` });
        },
        onError: () => toast({ title: "Error", description: "Failed to update status", variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: number) {
    setDeletingId(id);
    deleteComplaint.mutate(
      { params: { id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListComplaintsQueryKey() });
          toast({ title: "Complaint deleted" });
          setDeletingId(null);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete complaint", variant: "destructive" });
          setDeletingId(null);
        },
      }
    );
  }

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 overflow-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Complaints</h1>
          <p className="text-sm text-slate-500">Manage and update all civic complaints</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search by name, ID, area..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : complaints && complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    {["ID", "Name", "Mobile", "Area", "Category", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b last:border-0 hover:bg-slate-50 group">
                      <td className="px-4 py-3 font-mono text-xs text-primary whitespace-nowrap">{c.complaintId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.mobile}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.area}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded">{c.category}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Select value={c.status} onValueChange={(v) => handleStatusChange(c.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-36 border-0 p-0 bg-transparent focus:ring-0">
                            <StatusBadge status={c.status} />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                        >
                          {deletingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <AlertTriangle className="h-8 w-8 opacity-30" />
              <p className="text-sm">No complaints found matching your filters</p>
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); }}>
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {complaints && (
          <p className="text-xs text-slate-400 text-right">{complaints.length} complaint{complaints.length !== 1 ? "s" : ""} found</p>
        )}
      </div>
    </AdminLayout>
  );
}
