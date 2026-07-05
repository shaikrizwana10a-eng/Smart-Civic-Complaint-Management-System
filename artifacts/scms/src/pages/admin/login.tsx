import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLogin } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Building2, Loader2, ShieldCheck } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function AdminLogin() {
  useDocumentTitle("Admin Login");
  const [, setLocation] = useLocation();
  const login = useAdminLogin();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    login.mutate(
      { data: { username: form.username, password: form.password } },
      {
        onSuccess: () => setLocation("/admin"),
        onError: () => setError("Invalid username or password"),
      }
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary p-3 rounded-2xl mb-4">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage complaints</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              <p className="text-sm text-red-400 flex items-center gap-2"><ShieldCheck className="h-4 w-4" />{error}</p>
            </motion.div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-slate-300 text-sm">Username</Label>
            <Input
              id="username"
              placeholder="admin"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={login.isPending || !form.username || !form.password}>
            {login.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</> : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          <a href="/" className="hover:text-slate-400 transition-colors">Back to public portal</a>
        </p>
      </motion.div>
    </div>
  );
}
