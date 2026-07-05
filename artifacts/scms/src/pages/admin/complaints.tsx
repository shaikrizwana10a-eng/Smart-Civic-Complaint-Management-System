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
import {
  Search,
  Trash2,
  Loader2,
  AlertTriangle,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDocumentTitle } from "@/hooks/use-document-title";

const PAGE_SIZE = 10;
const STATUSES = ["Pending", "In Progress", "Resolved"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const CATEGORIES = [
  "Water Supply",
  "Electricity",
  "Road Damage",
  "Drainage",
  "Street Light",
  "Sanitation",
  "Garbage Collection",
  "Public Property Damage",
  "Other",
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    Resolved: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${map[status] || "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Low: "bg-slate-100 text-slate-600",
    Medium: "bg-amber-50 text-amber-700",
    High: "bg-orange-50 text-orange-700",
    Urgent: "bg-red-50 text-red-700 font-semibold",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded font-medium ${map[priority] || "bg-slate-100 text-slate-600"}`}
    >
      {priority}
    </span>
  );
}

export default function AdminComplaints() {
  useDocumentTitle("Complaints");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });

  useEffect(() => {
    if (!sessionLoading && (!session || !session.authenticated)) {
      setLocation("/admin/login");
    }
  }, [session, sessionLoading, setLocation]);

  const [search, setSearch] = useState(""); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const area = params.get("area");
   
  if (area) {
    setSearch(area);
  }
}, []);


  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    complaintId: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  // Reset page whenever any filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, priorityFilter]);

  const params = {
    ...(statusFilter !== "all" && {
      status: statusFilter as "Pending" | "In Progress" | "Resolved",
    }),
    ...(categoryFilter !== "all" && { category: categoryFilter }),
    ...(priorityFilter !== "all" && {
      priority: priorityFilter as "Low" | "Medium" | "High" | "Urgent",
    }),
    ...(search && { search }),
  };

  const { data: complaints, isLoading } = useListComplaints(params, {
    query: { queryKey: getListComplaintsQueryKey(params) },
  });

  const updateComplaint = useUpdateComplaint();
  const deleteComplaint = useDeleteComplaint();

  // Pagination
  const totalCount = complaints?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedComplaints =
    complaints?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) ??
    [];

  function handleStatusChange(id: number, status: string) {
    updateComplaint.mutate(
      {
        id,
        data: { status: status as "Pending" | "In Progress" | "Resolved" },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListComplaintsQueryKey(),
          });
          toast({
            title: "Status updated",
            description: `Status changed to ${status}`,
          });
        },
        onError: () =>
          toast({
            title: "Error",
            description: "Failed to update status",
            variant: "destructive",
          }),
      },
    );
  }

  function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    deleteComplaint.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListComplaintsQueryKey(),
          });
          toast({
            title: "Complaint deleted",
            description: `${deleteTarget.complaintId} has been removed`,
          });
          setDeleteTarget(null);
          setIsDeleting(false);
          // If deleting last item on current page, go back one page
          if (paginatedComplaints.length === 1 && currentPage > 1) {
            setCurrentPage((p) => p - 1);
          }
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete complaint",
            variant: "destructive",
          });
          setDeleteTarget(null);
          setIsDeleting(false);
        },
      },
    );
  }

  function handleExportCSV() {
    if (!complaints || complaints.length === 0) return;
    const headers = [
      "Complaint ID",
      "Name",
      "Email",
      "Mobile",
      "Area",
      "Category",
      "Priority",
      "Status",
      "Description",
      "Date",
    ];
    const rows = complaints.map((c) => [
      c.complaintId,
      c.name,
      c.email ?? "",
      c.mobile,
      c.area,
      c.category,
      c.priority,
      c.status,
      `"${c.description.replace(/"/g, '""')}"`,
      new Date(c.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: `${complaints.length} complaint${complaints.length !== 1 ? "s" : ""} downloaded as CSV`,
    });
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Complaints</h1>
            <p className="text-sm text-slate-500">
              Manage and update all civic complaints
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportCSV}
            disabled={!complaints || complaints.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, ID, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-slate-400 shrink-0" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : paginatedComplaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    {[
                      "ID",
                      "Name",
                      "Area",
                      "Location",
                      "Category",
                      "Priority",
                      "Status",
                      "Date",
                      "Image",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.map((complaint, i) => {
                    const c = complaint as {
                      id: number;
                      complaintId: string;
                      name: string;
                      email?: string;
                      mobile: string;
                      area: string;
                      category: string;
                      description: string;
                      status: string;
                      priority: string;
                      createdAt: string;
                      imageUrl?: string | null;
                      latitude?: number | null;
                      longitude?: number | null;
                    };
                    return (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-primary whitespace-nowrap">
                          {c.complaintId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-slate-900">
                            {c.name}
                          </div>
                          {c.email && (
                            <div className="text-xs text-slate-400">
                              {c.email}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {c.area}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {c.latitude != null && c.longitude != null ? (
                            <a
                              href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-mono text-blue-600 hover:underline"
                              title="Open in Google Maps"
                            >
                              {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">
                              Not shared
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Select
                            value={c.status}
                            onValueChange={(v) => handleStatusChange(c.id, v)}
                          >
                            <SelectTrigger className="h-7 text-xs w-36 border-0 p-0 bg-transparent focus:ring-0">
                              <StatusBadge status={c.status} />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {c.imageUrl ? (
                            <a
                              href={c.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              👁️ View
                            </a>
                          ) : (
                            <span className="text-slate-400">No Image</span>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() =>
                              setDeleteTarget({
                                id: c.id,
                                complaintId: c.complaintId,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <AlertTriangle className="h-8 w-8 opacity-30" />
              <p className="text-sm">
                No complaints found matching your filters
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Pagination + count row */}
        {complaints && complaints.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {totalCount} complaint{totalCount !== 1 ? "s" : ""} found
              {pageCount > 1 && ` · Page ${currentPage} of ${pageCount}`}
            </p>
            {pageCount > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 h-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
                    let page: number;
                    if (pageCount <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i < 6 ? i + 1 : pageCount;
                    } else if (currentPage >= pageCount - 3) {
                      page = i === 0 ? 1 : pageCount - 6 + i;
                    } else {
                      const pages = [
                        1,
                        currentPage - 1,
                        currentPage,
                        currentPage + 1,
                        pageCount,
                      ];
                      page = pages[Math.min(i, pages.length - 1)];
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 h-8"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pageCount, p + 1))
                  }
                  disabled={currentPage === pageCount}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete complaint{" "}
              <span className="font-mono font-semibold text-slate-900">
                {deleteTarget?.complaintId}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
