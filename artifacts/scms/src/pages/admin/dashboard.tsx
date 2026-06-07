import { useEffect } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useGetAdminSession,
  useGetStats,
  useGetStatsByCategory,
  useGetStatsByStatus,
  useGetMonthlyTrend,
  useGetRecentComplaints,
  getGetStatsQueryKey,
  getGetStatsByCategoryQueryKey,
  getGetStatsByStatusQueryKey,
  getGetMonthlyTrendQueryKey,
  getGetRecentComplaintsQueryKey,
  getGetAdminSessionQueryKey,
} from "@workspace/api-client-react";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Activity, CheckCircle, Clock, Loader2, ArrowRight } from "lucide-react";

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#10B981"];

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: number; icon: React.ElementType; color: string; bg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white border rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value?.toLocaleString() ?? "—"}</p>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    Resolved: "bg-green-50 text-green-700 border-green-200",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: session, isLoading: sessionLoading } = useGetAdminSession({ query: { queryKey: getGetAdminSessionQueryKey(), retry: false } });

  useEffect(() => {
    if (!sessionLoading && (!session || !session.authenticated)) {
      setLocation("/admin/login");
    }
  }, [session, sessionLoading, setLocation]);

  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });
  const { data: byCategory } = useGetStatsByCategory({ query: { queryKey: getGetStatsByCategoryQueryKey() } });
  const { data: byStatus } = useGetStatsByStatus({ query: { queryKey: getGetStatsByStatusQueryKey() } });
  const { data: trend } = useGetMonthlyTrend({ query: { queryKey: getGetMonthlyTrendQueryKey() } });
  const { data: recent } = useGetRecentComplaints({ query: { queryKey: getGetRecentComplaintsQueryKey() } });

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 overflow-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of all complaints and resolution metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats?.total ?? 0} icon={Activity} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
          <StatCard label="In Progress" value={stats?.inProgress ?? 0} icon={ArrowRight} color="text-primary" bg="bg-primary/10" />
          <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Pie */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">By Category</h2>
            {byCategory && byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={byCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
          </div>

          {/* Status Pie */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">By Status</h2>
            {byStatus && byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80}>
                    {byStatus.map((entry) => {
                      const color = entry.status === "Resolved" ? "#22C55E" : entry.status === "In Progress" ? "#2563EB" : "#F59E0B";
                      return <Cell key={entry.status} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
          </div>

          {/* Monthly Trend */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Monthly Trend</h2>
            {trend && trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold text-slate-900">Recent Complaints</h2>
          </div>
          {recent && recent.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  {["ID", "Name", "Category", "Area", "Status", "Date"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-primary">{c.complaintId}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-5 py-3 text-slate-600">{c.category}</td>
                    <td className="px-5 py-3 text-slate-600">{c.area}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">No complaints yet</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
