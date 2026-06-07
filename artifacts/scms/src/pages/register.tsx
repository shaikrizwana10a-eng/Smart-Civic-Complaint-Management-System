import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateComplaint } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { CheckCircle, Download, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Water Supply", "Electricity", "Road Damage", "Drainage",
  "Street Light", "Sanitation", "Garbage Collection", "Public Property Damage", "Other",
];

const PRIORITIES = [
  { value: "Low", label: "Low", color: "text-slate-600" },
  { value: "Medium", label: "Medium", color: "text-amber-600" },
  { value: "High", label: "High", color: "text-orange-600" },
  { value: "Urgent", label: "Urgent", color: "text-red-600" },
];

export default function Register() {
  const { toast } = useToast();
  const createComplaint = useCreateComplaint();
  const [submitted, setSubmitted] = useState<{ id: number; complaintId: string } | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", mobile: "", area: "", category: "", priority: "Medium", description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!/^\d{10}$/.test(form.mobile)) e.mobile = "Mobile must be 10 digits";
    if (form.area.trim().length < 2) e.area = "Area is required";
    if (!form.category) e.category = "Select a category";
    if (!form.priority) e.priority = "Select a priority";
    if (form.description.trim().length < 10) e.description = "Description must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    createComplaint.mutate(
      {
        data: {
          name: form.name,
          email: form.email || undefined,
          mobile: form.mobile,
          area: form.area,
          category: form.category as "Water Supply" | "Electricity" | "Road Damage" | "Drainage" | "Street Light" | "Sanitation" | "Garbage Collection" | "Public Property Damage" | "Other",
          priority: form.priority as "Low" | "Medium" | "High" | "Urgent",
          description: form.description,
        },
      },
      {
        onSuccess: (data) => { setSubmitted({ id: data.id, complaintId: data.complaintId }); },
        onError: () => { toast({ title: "Error", description: "Failed to submit complaint. Please try again.", variant: "destructive" }); },
      }
    );
  }

  if (submitted) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-md w-full">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 flex flex-col items-center gap-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Complaint Registered</h2>
                <p className="text-slate-600 text-sm">Your complaint has been submitted and is being reviewed.</p>
              </div>
              <div className="bg-white border border-green-200 rounded-xl px-8 py-4 w-full">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Your Complaint ID</p>
                <p className="text-2xl font-bold text-primary tracking-wider">{submitted.complaintId}</p>
                <p className="text-xs text-slate-400 mt-1">Save this ID to track your complaint</p>
              </div>
              <a href={`/api/complaints/${submitted.id}/pdf`} target="_blank" rel="noreferrer" className="w-full">
                <Button className="w-full gap-2" size="lg">
                  <Download className="h-4 w-4" />
                  Download PDF Receipt
                </Button>
              </a>
              <Button variant="outline" className="w-full" onClick={() => { setSubmitted(null); setForm({ name: "", email: "", mobile: "", area: "", category: "", priority: "Medium", description: "" }); }}>
                Register Another Complaint
              </Button>
            </div>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Register Complaint</h1>
            </div>
            <p className="text-slate-500 text-sm">Fill in the details below to submit your civic complaint.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8 space-y-6 shadow-sm">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={errors.name ? "border-destructive" : ""} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address <span className="text-slate-400 text-xs font-normal">(optional — for status notifications)</span></Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={errors.email ? "border-destructive" : ""} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" placeholder="10-digit mobile number" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} className={errors.mobile ? "border-destructive" : ""} />
              {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="area">Area / Village</Label>
              <Input id="area" placeholder="Your locality or village" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} className={errors.area ? "border-destructive" : ""} />
              {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className={errors.priority ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className={p.color}>{p.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-xs text-destructive">{errors.priority}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the issue in detail (at least 10 characters)" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={errors.description ? "border-destructive" : ""} />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={createComplaint.isPending}>
              {createComplaint.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Complaint"}
            </Button>
          </form>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
