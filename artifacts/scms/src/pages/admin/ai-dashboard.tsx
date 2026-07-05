import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetAdminSession,
  useGetAiInsights,
  useAskAi,
  getGetAdminSessionQueryKey,
  getGetAiInsightsQueryKey,
} from "@workspace/api-client-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Building2,
  Send,
  Bot,
  User,
  ArrowRightCircle,
  ShieldAlert,
  LayoutGrid,
  Users,
  X,
} from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "Which area has the most unresolved complaints?",
  "What category should we prioritize this month?",
  "Are complaints trending up or down?",
];

function riskColor(risk: string) {
  switch (risk) {
    case "Critical":
      return "bg-red-50 text-red-700 border-red-200";
    case "High":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "Urgent":
      return "bg-red-50 text-red-700 border-red-200";
    case "High":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "bg-white border rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading AI insights" role="status">
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[180px] w-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border rounded-xl p-5 shadow-sm space-y-2">
            <Skeleton className="h-4 w-36 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AiDashboard() {
  useDocumentTitle("AI Decision Dashboard");
  const [, setLocation] = useLocation();
  const { data: session, isLoading: sessionLoading } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });

  useEffect(() => {
    if (!sessionLoading && (!session || !session.authenticated)) {
      setLocation("/admin/login");
    }
  }, [session, sessionLoading, setLocation]);

  const {
    data: insights,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAiInsights(undefined, {
    query: {
      queryKey: getGetAiInsightsQueryKey(),
      enabled: !sessionLoading && Boolean(session?.authenticated),
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  });

  const askAi = useAskAi();
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation, askAi.isPending]);

  const submitQuestion = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || askAi.isPending) return;
    setConversation((prev) => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");
    askAi.mutate(
      { data: { question: trimmed } },
      {
        onSuccess: (res) => {
          setConversation((prev) => [...prev, { role: "ai", text: res.answer }]);
        },
        onError: () => {
          setConversation((prev) => [
            ...prev,
            {
              role: "ai",
              text: "The AI assistant couldn't process that request. This usually means the AI service is temporarily unavailable — please try again in a moment.",
            },
          ]);
        },
      },
    );
  };

  const handleAsk = () => submitQuestion(question);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isRefreshing = isFetching && !isLoading;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 -mt-4 sm:-mt-6 border-b">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                className="inline-flex"
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.span>
              AI Decision Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Grounded in real complaint records, generated by Gemini
              {insights?.generatedAt && (
                <>
                  {" · "}
                  {insights.cached ? "cached" : "updated"}{" "}
                  {formatDistanceToNow(new Date(insights.generatedAt), { addSuffix: true })}
                </>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="shrink-0">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh insights</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : isError || !insights ? (
          <div className="bg-white border rounded-xl p-8 text-center space-y-2 max-w-lg mx-auto">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
            <p className="text-sm font-medium text-slate-700">AI insights are unavailable right now.</p>
            <p className="text-xs text-slate-500">
              {(error as { message?: string } | undefined)?.message ??
                "This can happen if the AI service is temporarily down or not configured. Please try again shortly."}
            </p>
            <Button size="sm" onClick={() => refetch()} className="mt-2">
              Try again
            </Button>
          </div>
        ) : (
          <motion.div
            animate={{ opacity: isRefreshing ? 0.6 : 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 relative"
          >
            {isRefreshing && (
              <div className="absolute -top-2 right-0 flex items-center gap-1.5 text-xs text-primary font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Refreshing...
              </div>
            )}

            {/* AI Summary */}
            <SectionCard title="AI Complaint Summary" icon={Bot} className="border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent">
              <p className="text-sm text-slate-700 leading-relaxed">{insights.summary}</p>
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendations */}
              <SectionCard title="AI Recommendations" icon={ArrowRightCircle}>
                {insights.recommendations.length > 0 ? (
                  <ul className="space-y-2.5">
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">No recommendations available.</p>
                )}
              </SectionCard>

              {/* Predictions */}
              <SectionCard title="Predictive Analytics" icon={TrendingUp}>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{insights.predictions}</p>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="text-slate-500">Trend direction:</span>
                  {insights.trend.direction === "up" ? (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <TrendingUp className="h-3.5 w-3.5" /> Increasing
                    </span>
                  ) : insights.trend.direction === "down" ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <TrendingDown className="h-3.5 w-3.5" /> Decreasing
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Minus className="h-3.5 w-3.5" /> Stable
                    </span>
                  )}
                  <span className="text-slate-500">
                    · Forecast next month: <span className="font-semibold text-slate-900">{insights.trend.forecastNextMonth}</span>
                  </span>
                </div>
              </SectionCard>
            </div>

            {/* Trend Chart */}
            <SectionCard title="Trend Analysis" icon={TrendingUp}>
              {insights.trend.monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={insights.trend.monthly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="aiTrendLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      labelStyle={{ fontWeight: 600, color: "#0f172a" }}
                      formatter={(value: number) => [value, "Complaints"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="url(#aiTrendLine)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#2563EB", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
              )}
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hotspots */}
              <SectionCard title="Hotspot Detection" icon={MapPin}>
                {insights.hotspots.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-auto pr-1">
                    {insights.hotspots.map((h) => (
                      <div
                        key={h.area}
                        className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{h.area}</p>
                          <p className="text-xs text-slate-500">
                            {h.total} complaints · {h.pending} pending · top: {h.topCategory}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${riskColor(h.riskLevel)}`}>
                          {h.riskLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No hotspots detected yet.</p>
                )}
              </SectionCard>

              {/* Area-wise Analytics */}
              <SectionCard title="Area-wise Analytics" icon={LayoutGrid}>
                {insights.areaAnalytics.length > 0 ? (
                  <div className="overflow-auto max-h-72">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-slate-50 sticky top-0">
                          {["Area", "Total", "Pending", "In Progress", "Resolved", "Avg Pending Age"].map((h) => (
                            <th key={h} className="text-left px-2 py-2 font-medium text-slate-500 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {insights.areaAnalytics.map((a) => (
                          <tr key={a.area} className="border-b last:border-0 hover:bg-slate-50/70 transition-colors">
                            <td className="px-2 py-2 font-medium text-slate-900 whitespace-nowrap">{a.area}</td>
                            <td className="px-2 py-2 text-slate-600">{a.total}</td>
                            <td className="px-2 py-2 text-slate-600">{a.pending}</td>
                            <td className="px-2 py-2 text-slate-600">{a.inProgress}</td>
                            <td className="px-2 py-2 text-slate-600">{a.resolved}</td>
                            <td className="px-2 py-2 text-slate-600 whitespace-nowrap">{a.avgPendingAgeDays}d</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No area data yet.</p>
                )}
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority Recommendations */}
              <SectionCard title="Priority Recommendations" icon={ShieldAlert}>
                {insights.priorityRecommendations.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-auto pr-1">
                    {insights.priorityRecommendations.map((p) => (
                      <div key={p.complaintId} className="border rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                          <span className="font-mono text-xs text-primary">{p.complaintId}</span>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className={`px-2 py-0.5 rounded-full border ${priorityColor(p.currentPriority)}`}>{p.currentPriority}</span>
                            <ArrowRightCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className={`px-2 py-0.5 rounded-full border font-medium ${priorityColor(p.recommendedPriority)}`}>
                              {p.recommendedPriority}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {p.area} · {p.category} — {p.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">All complaints have appropriate priority.</p>
                )}
              </SectionCard>

              {/* Department Recommendation */}
              <SectionCard title="Department Recommendation" icon={Building2}>
                {insights.departmentMapping.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-auto pr-1">
                    {insights.departmentMapping.map((d) => (
                      <div key={d.category} className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{d.category}</p>
                          <p className="text-xs text-slate-500 truncate">{d.department}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 rounded-full px-2 py-0.5 shrink-0">
                          {d.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No department data yet.</p>
                )}
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Severity Analysis */}
              <SectionCard title="AI Severity Analysis" icon={AlertTriangle}>
                {insights.severityAnalysis.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-auto pr-1">
                    {insights.severityAnalysis.map((s) => (
                      <div key={s.complaintId} className="border rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-primary">{s.complaintId}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${riskColor(s.severity)}`}>
                            {s.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{s.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No elevated-severity complaints detected.</p>
                )}
              </SectionCard>

              {/* Pattern Detection & Similar Complaints */}
              <SectionCard title="Pattern & Similar-Complaint Detection" icon={Users}>
                {insights.patterns.length === 0 && insights.similarGroups.length === 0 ? (
                  <p className="text-sm text-slate-400">No recurring patterns detected yet.</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-auto pr-1">
                    {insights.patterns.map((p, i) => (
                      <div key={i} className="border rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                        <p className="text-sm font-medium text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Related: {p.complaintIds.join(", ") || "—"}
                        </p>
                      </div>
                    ))}
                    {insights.similarGroups.map((g, i) => (
                      <div key={`sim-${i}`} className="border rounded-lg px-3 py-2 bg-slate-50">
                        <p className="text-xs font-medium text-slate-700">
                          Similar complaints: {g.complaintIds.join(", ")}
                        </p>
                        <p className="text-xs text-slate-500">{g.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </motion.div>
        )}

        {/* AI Decision Assistant */}
        <SectionCard title="🧠 AI Decision Assistant" icon={Sparkles} className="border-primary/20">
          <div className="flex items-start justify-between gap-3 mb-4">
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Ask questions about complaint trends, hotspots, priorities, and recommendations.
              Responses are generated only from real complaint data.
            </p>
            {conversation.length > 0 && (
              <button
                type="button"
                onClick={() => setConversation([])}
                aria-label="Clear conversation"
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1.5 py-0.5"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {conversation.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Suggested questions">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => submitQuestion(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {conversation.length > 0 && (
            <div className="space-y-3 mb-3 max-h-72 overflow-auto pr-1">
              <AnimatePresence initial={false}>
                {conversation.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex items-start gap-2", m.role === "user" && "flex-row-reverse")}
                  >
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        m.role === "user" ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div
                      className={cn(
                        "text-sm rounded-lg px-3 py-2 max-w-[85%] leading-relaxed",
                        m.role === "user" ? "bg-primary/10 text-slate-900" : "bg-slate-50 text-slate-700",
                      )}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {askAi.isPending && (
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-slate-50 text-slate-400 text-sm rounded-lg px-3 py-2 flex items-center gap-2 w-fit">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          <div className="flex gap-2 items-end">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which areas have the most unresolved complaints this month?"
              aria-label="Ask the AI assistant a question about complaint data"
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            <Button
              onClick={handleAsk}
              disabled={askAi.isPending || !question.trim()}
              className="shrink-0"
              aria-label="Send question to AI assistant"
            >
              {askAi.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </SectionCard>
      </div>
    </AdminLayout>
  );
}
