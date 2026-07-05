import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Search, ArrowRight, Activity, CheckCircle, Clock } from "lucide-react";
import { useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function Home() {
  useDocumentTitle("Home");
  const { data: stats } = useGetStats({
    query: {
      queryKey: getGetStatsQueryKey(),
    }
  });

  return (
    <PublicLayout>
      <div className="flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-white relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
          <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-3xl"
            >
              Smart Civic Complaint Management System
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl"
            >
              Register, track, and resolve civic complaints through a transparent digital platform.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base gap-2 h-14 px-8">
                  <FileText className="h-5 w-5" />
                  Register Complaint
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base gap-2 h-14 px-8 border-slate-300">
                  <Search className="h-5 w-5" />
                  Track Complaint
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Live Stats */}
        <section className="w-full py-16 bg-slate-50 border-b">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900">Platform Activity</h2>
              <p className="text-slate-500 mt-2">Real-time resolution metrics across the city</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { label: "Total Complaints", value: stats?.total || 0, icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
                { label: "Resolved", value: stats?.resolved || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
                { label: "In Progress", value: stats?.inProgress || 0, icon: ArrowRight, color: "text-primary", bg: "bg-primary/10" },
                { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="bg-white rounded-xl p-6 border shadow-sm flex flex-col items-center text-center"
                >
                  <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mb-4`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value.toLocaleString()}</div>
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}