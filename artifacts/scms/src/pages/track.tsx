import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrackComplaint, getTrackComplaintQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, CheckCircle, Loader2, AlertCircle, MapPin, Tag, Calendar, User, Phone } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
    "Pending": { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock className="h-3.5 w-3.5" /> },
    "In Progress": { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <Loader2 className="h-3.5 w-3.5" /> },
    "Resolved": { color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  };
  const c = config[status] || config["Pending"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${c.color} ${c.bg}`}>
      {c.icon}{status}
    </span>
  );
}

export default function Track() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const { data: complaint, isLoading, error } = useTrackComplaint(query, {
    query: { queryKey: getTrackComplaintQueryKey(query), enabled: !!query, retry: false },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = search.trim().toUpperCase();
    if (trimmed) setQuery(trimmed);
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Track Complaint</h1>
            </div>
            <p className="text-slate-500 text-sm">Enter your complaint ID to check the current status.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <Input
              placeholder="e.g. SCMS2026001"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-base font-mono uppercase"
            />
            <Button type="submit" disabled={!search.trim() || isLoading} className="shrink-0 gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </motion.div>
            )}

            {error && !isLoading && (
              <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Complaint not found</p>
                  <p className="text-sm text-red-600">No complaint found for ID <strong>{query}</strong>. Please check the ID and try again.</p>
                </div>
              </motion.div>
            )}

            {complaint && !isLoading && (
              <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Complaint ID</p>
                    <p className="text-lg font-bold text-white font-mono">{complaint.complaintId}</p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: User, label: "Name", value: complaint.name },
                      { icon: Phone, label: "Mobile", value: complaint.mobile },
                      { icon: MapPin, label: "Area", value: complaint.area },
                      { icon: Tag, label: "Category", value: complaint.category },
                      { icon: Calendar, label: "Submitted", value: new Date(complaint.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" }) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className={label === "Area" || label === "Category" ? "" : ""}>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Icon className="h-3 w-3" />{label}</p>
                        <p className="text-sm font-medium text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{complaint.description}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border-t px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${complaint.status === "Resolved" ? "bg-green-500" : complaint.status === "In Progress" ? "bg-blue-500 animate-pulse" : "bg-amber-500"}`} />
                    <p className="text-xs text-slate-500">
                      {complaint.status === "Pending" && "Your complaint is queued for review by our team."}
                      {complaint.status === "In Progress" && "Our team is actively working on resolving this issue."}
                      {complaint.status === "Resolved" && "This complaint has been resolved. Thank you for your patience."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {!query && !isLoading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-slate-400">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Enter a complaint ID above to get started</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
