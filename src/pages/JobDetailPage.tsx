import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Car,
  User,
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  AlertCircle,
  Camera,
  Edit,
  Trash2,
  Send,
  Ban,
  Loader2,
  Phone,
  Truck,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedCarSilhouette } from "@/components/car/AnimatedCarSilhouette";
import { TransportRecordDialog } from "@/components/transport/TransportRecordDialog";

interface JobDetails {
  id: string;
  status: string;
  transport: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  estimated_completion: string | null;
  total_price: number | null;
  notes: string | null;
  customer_view_token: string;
  assigned_to: string | null;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  car?: {
    id: string;
    make: string;
    model: string;
    year: number | null;
    color: string | null;
    license_plate: string | null;
  };
  assigned_profile?: {
    id: string;
    full_name: string;
  };
}

interface JobZone {
  id: string;
  zone_name: string;
  zone_type: string;
  services: string[];
  completed: boolean;
  color_change: string | null;
  expected_result: string | null;
  notes: string | null;
}

interface StaffMember {
  id: string;
  full_name: string;
}

interface TransportRecord {
  id: string;
  type: string;
  condition_notes: string | null;
  existing_damage: string | null;
  recorded_at: string;
  recorded_by: string | null;
}

interface JobSubmission {
  id: string;
  notes: string | null;
  approved: boolean | null;
  approved_at: string | null;
  created_at: string;
  issues_found: string | null;
  submitted_by_profile?: { full_name: string } | null;
}

const ZONE_TYPES = {
  exterior: [
    { id: "hood", name: "Hood" },
    { id: "roof", name: "Roof" },
    { id: "trunk", name: "Trunk" },
    { id: "front_bumper", name: "Front Bumper" },
    { id: "rear_bumper", name: "Rear Bumper" },
    { id: "front_fender_l", name: "Left Front Fender" },
    { id: "front_fender_r", name: "Right Front Fender" },
    { id: "rear_fender_l", name: "Left Rear Fender" },
    { id: "rear_fender_r", name: "Right Rear Fender" },
    { id: "door_fl", name: "Front Left Door" },
    { id: "door_fr", name: "Front Right Door" },
    { id: "door_rl", name: "Rear Left Door" },
    { id: "door_rr", name: "Rear Right Door" },
  ],
  wheels: [
    { id: "wheel_fl", name: "Front Left Wheel" },
    { id: "wheel_fr", name: "Front Right Wheel" },
    { id: "wheel_rl", name: "Rear Left Wheel" },
    { id: "wheel_rr", name: "Rear Right Wheel" },
  ],
  glass: [
    { id: "windshield", name: "Windshield" },
    { id: "rear_glass", name: "Rear Glass" },
    { id: "side_glass", name: "Side Windows" },
  ],
  interior: [
    { id: "dashboard", name: "Dashboard" },
    { id: "seats", name: "Seats" },
    { id: "carpet", name: "Carpet/Floor" },
    { id: "headliner", name: "Headliner" },
    { id: "door_panels", name: "Door Panels" },
    { id: "console", name: "Center Console" },
  ],
};

const SERVICES = [
  "Wash", "Clay Bar", "Polish", "Wax", "Ceramic Coating", "PPF",
  "Vinyl Wrap", "Dent Removal", "Scratch Repair", "Steam Clean",
  "Leather Conditioning", "Fabric Shampoo", "Odor Removal",
  "Glass Cleaning", "Wheel Cleaning", "Tire Dressing",
];

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { studio, profile, isOwner } = useAuth();
  const { toast } = useToast();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [zones, setZones] = useState<JobZone[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [transportRecords, setTransportRecords] = useState<TransportRecord[]>([]);
  const [transportDialogOpen, setTransportDialogOpen] = useState(false);
  const [transportType, setTransportType] = useState<"pickup" | "dropoff">("pickup");
  const [submissions, setSubmissions] = useState<JobSubmission[]>([]);
  const [approvalNotes, setApprovalNotes] = useState("");

  const [selectedCarZones, setSelectedCarZones] = useState<string[]>([]);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [selectedZoneToAdd, setSelectedZoneToAdd] = useState<{ id: string; name: string; type: string } | null>(null);
  const [zoneFormData, setZoneFormData] = useState({
    services: [] as string[],
    colorChange: "",
    expectedResult: "",
    notes: "",
  });

  useEffect(() => {
    if (jobId && studio?.id) {
      fetchJobDetails();
      fetchStaff();
      fetchTransportRecords();
      fetchSubmissions();
    }
  }, [jobId, studio?.id]);

  const fetchJobDetails = async () => {
    if (!jobId) return;

    try {
      const [jobRes, zonesRes] = await Promise.all([
        supabase
          .from("jobs")
          .select(`
            *,
            customers(id, name, phone, email),
            cars(id, make, model, year, color, license_plate),
            profiles!jobs_assigned_to_fkey(id, full_name)
          `)
          .eq("id", jobId)
          .single(),
        supabase
          .from("job_zones")
          .select("*")
          .eq("job_id", jobId)
          .order("created_at"),
      ]);

      if (jobRes.error) throw jobRes.error;

      const jobData = {
        ...jobRes.data,
        customer: jobRes.data.customers,
        car: jobRes.data.cars,
        assigned_profile: jobRes.data.profiles,
      };

      setJob(jobData);
      setZones((zonesRes.data || []).map((z: any) => ({
        ...z,
        services: Array.isArray(z.services) ? z.services : [],
      })));
      setSelectedCarZones((zonesRes.data || []).map((z: any) => z.zone_name));
    } catch (error) {
      console.error("Error fetching job:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load job details." });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    if (!studio?.id) return;

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("studio_id", studio.id)
      .eq("status", "approved");

    if (data) setStaff(data);
  };

  const fetchTransportRecords = async () => {
    if (!jobId) return;

    const { data } = await supabase
      .from("transport_records")
      .select("*")
      .eq("job_id", jobId)
      .order("recorded_at", { ascending: false });

    if (data) setTransportRecords(data);
  };

  const fetchSubmissions = async () => {
    if (!jobId) return;

    const { data } = await supabase
      .from("job_submissions")
      .select(`
        *,
        submitted_by_profile:profiles!job_submissions_submitted_by_fkey(full_name)
      `)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (data) setSubmissions(data as JobSubmission[]);
  };

  const handleApproveSubmission = async (submissionId: string, approved: boolean) => {
    if (!profile?.id || !job) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("job_submissions")
        .update({
          approved,
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
          issues_found: !approved ? approvalNotes || null : null,
        })
        .eq("id", submissionId);

      if (error) throw error;

      if (approved) {
        await supabase
          .from("jobs")
          .update({ status: "completed" })
          .eq("id", job.id);

        toast({ title: "Job approved!", description: "Job marked as completed." });
      } else {
        await supabase
          .from("jobs")
          .update({ status: "in_progress" })
          .eq("id", job.id);

        toast({ title: "Job sent back", description: "Worker will see feedback and continue." });
      }

      setApprovalNotes("");
      fetchJobDetails();
      fetchSubmissions();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not process submission." });
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus as any })
        .eq("id", job.id);

      if (error) throw error;
      toast({ title: "Status updated" });
      fetchJobDetails();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update status." });
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (staffId: string) => {
    if (!job) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("jobs")
        .update({ assigned_to: staffId || null })
        .eq("id", job.id);

      if (error) throw error;
      toast({ title: "Assignment updated" });
      fetchJobDetails();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not assign staff." });
    } finally {
      setUpdating(false);
    }
  };

  const handleZoneClick = (zoneId: string) => {
    // Find zone info
    let zoneInfo: { id: string; name: string; type: string } | null = null;
    for (const [type, zones] of Object.entries(ZONE_TYPES)) {
      const found = zones.find((z) => z.id === zoneId);
      if (found) {
        zoneInfo = { id: found.id, name: found.name, type };
        break;
      }
    }

    if (!zoneInfo) return;

    // Check if zone already exists
    const existingZone = zones.find((z) => z.zone_name === zoneId);
    if (existingZone) {
      // Show existing zone details
      setSelectedZoneToAdd(zoneInfo);
      setZoneFormData({
        services: existingZone.services,
        colorChange: existingZone.color_change || "",
        expectedResult: existingZone.expected_result || "",
        notes: existingZone.notes || "",
      });
    } else {
      // Add new zone
      setSelectedZoneToAdd(zoneInfo);
      setZoneFormData({
        services: [],
        colorChange: "",
        expectedResult: "",
        notes: "",
      });
    }
    setZoneDialogOpen(true);
  };

  const handleSaveZone = async () => {
    if (!job || !selectedZoneToAdd) return;
    setUpdating(true);

    try {
      const existingZone = zones.find((z) => z.zone_name === selectedZoneToAdd.id);

      if (existingZone) {
        // Update existing zone
        const { error } = await supabase
          .from("job_zones")
          .update({
            services: zoneFormData.services,
            color_change: zoneFormData.colorChange || null,
            expected_result: zoneFormData.expectedResult || null,
            notes: zoneFormData.notes || null,
          })
          .eq("id", existingZone.id);

        if (error) throw error;
        toast({ title: "Zone updated" });
      } else {
        // Create new zone
        const { error } = await supabase
          .from("job_zones")
          .insert({
            job_id: job.id,
            zone_name: selectedZoneToAdd.id,
            zone_type: selectedZoneToAdd.type,
            services: zoneFormData.services,
            color_change: zoneFormData.colorChange || null,
            expected_result: zoneFormData.expectedResult || null,
            notes: zoneFormData.notes || null,
          });

        if (error) throw error;
        toast({ title: "Zone added" });
      }

      setZoneDialogOpen(false);
      fetchJobDetails();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save zone." });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("job_zones")
        .delete()
        .eq("id", zoneId);

      if (error) throw error;
      toast({ title: "Zone removed" });
      fetchJobDetails();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not remove zone." });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "scheduled": return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      case "in_progress": return "bg-racing/15 text-racing border-racing/30";
      case "awaiting_review": return "bg-purple-500/15 text-purple-500 border-purple-500/30";
      case "completed": return "bg-green-500/15 text-green-500 border-green-500/30";
      case "cancelled": return "bg-destructive/15 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const completedZones = zones.filter((z) => z.completed).length;
  const progressPercent = zones.length > 0 ? (completedZones / zones.length) * 100 : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Job not found</h2>
          <Button variant="outline" onClick={() => navigate("/dashboard/jobs")} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/jobs")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold">
                  {job.car?.make} {job.car?.model}
                  {job.car?.year && ` (${job.car.year})`}
                </h1>
                <Badge variant="outline" className={getStatusColor(job.status)}>
                  {job.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {job.customer?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {job.customer?.phone}
                </span>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <Select value={job.status} onValueChange={handleStatusChange} disabled={updating}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="awaiting_review">Awaiting Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </motion.div>

        {/* Progress */}
        {zones.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Job Progress</span>
                <span className="font-medium">{completedZones}/{zones.length} zones complete</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Car Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-racing" />
                  Zone Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedCarSilhouette
                  selectedZones={selectedCarZones}
                  onZoneClick={handleZoneClick}
                  interactive={true}
                />
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Click on car zones to configure services
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Info & Assignment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Assignment */}
            {isOwner && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Assign Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={job.assigned_to || ""}
                    onValueChange={handleAssign}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {job.assigned_profile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Currently assigned to: <span className="font-medium">{job.assigned_profile.full_name}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Transport / Pickup-Drop */}
            {job.transport !== "none" && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      Transport
                    </CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {job.transport === "both" ? "Pickup & Drop" : job.transport}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Transport Records */}
                  {transportRecords.length > 0 ? (
                    <div className="space-y-2">
                      {transportRecords.map((record) => (
                        <div
                          key={record.id}
                          className="p-3 rounded-lg border bg-muted/30"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="secondary" className="capitalize">
                              {record.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(record.recorded_at).toLocaleString()}
                            </span>
                          </div>
                          {record.condition_notes && (
                            <p className="text-sm text-muted-foreground">
                              {record.condition_notes}
                            </p>
                          )}
                          {record.existing_damage && (
                            <p className="text-sm text-amber-600 mt-1">
                              ⚠ Damage: {record.existing_damage}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No transport records yet
                    </p>
                  )}

                  {/* Transport Actions */}
                  <div className="flex gap-2">
                    {(job.transport === "pickup" || job.transport === "both") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setTransportType("pickup");
                          setTransportDialogOpen(true);
                        }}
                        disabled={transportRecords.some((r) => r.type === "pickup")}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        {transportRecords.some((r) => r.type === "pickup")
                          ? "Pickup Done"
                          : "Record Pickup"}
                      </Button>
                    )}
                    {(job.transport === "drop" || job.transport === "both") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setTransportType("dropoff");
                          setTransportDialogOpen(true);
                        }}
                        disabled={transportRecords.some((r) => r.type === "dropoff")}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        {transportRecords.some((r) => r.type === "dropoff")
                          ? "Drop Done"
                          : "Record Drop"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Submission Review - Owner Approval */}
            {isOwner && job.status === "awaiting_review" && submissions.length > 0 && (
              <Card className="border-purple-500/30 bg-purple-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="h-5 w-5 text-purple-500" />
                    Submission for Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submissions.filter(s => s.approved === null).map((sub) => (
                    <div key={sub.id} className="space-y-3">
                      <div className="p-3 rounded-lg bg-background border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Submitted by {sub.submitted_by_profile?.full_name || "Staff"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sub.created_at).toLocaleString()}
                          </span>
                        </div>
                        {sub.notes && (
                          <p className="text-sm text-muted-foreground">{sub.notes}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Feedback (required for rejection)</Label>
                        <Textarea
                          placeholder="Issues found, things to redo..."
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => handleApproveSubmission(sub.id, false)}
                          disabled={updating || !approvalNotes.trim()}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Send Back
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveSubmission(sub.id, true)}
                          disabled={updating}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve & Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Configured Zones ({zones.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {zones.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No zones configured</p>
                    <p className="text-sm">Click on the car to add zones</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {zones.map((zone) => (
                      <div
                        key={zone.id}
                        className={`p-4 flex items-center justify-between ${zone.completed ? "bg-green-500/5" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          {zone.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <div>
                            <p className="font-medium">{zone.zone_name.replace(/_/g, " ")}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {zone.zone_type} • {zone.services.length} services
                            </p>
                          </div>
                        </div>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteZone(zone.id)}
                            disabled={updating}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Notes */}
            {job.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{job.notes}</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Zone Dialog */}
      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedZoneToAdd?.name} Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Services</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {SERVICES.map((service) => (
                  <label
                    key={service}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ${
                      zoneFormData.services.includes(service)
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={zoneFormData.services.includes(service)}
                      onCheckedChange={(checked) => {
                        setZoneFormData((prev) => ({
                          ...prev,
                          services: checked
                            ? [...prev.services, service]
                            : prev.services.filter((s) => s !== service),
                        }));
                      }}
                    />
                    <span>{service}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color Change (optional)</Label>
              <Input
                placeholder="e.g., Gloss Black, Matte Red"
                value={zoneFormData.colorChange}
                onChange={(e) => setZoneFormData((prev) => ({ ...prev, colorChange: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Result</Label>
              <Input
                placeholder="e.g., Mirror finish, swirl-free"
                value={zoneFormData.expectedResult}
                onChange={(e) => setZoneFormData((prev) => ({ ...prev, expectedResult: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Special instructions..."
                value={zoneFormData.notes}
                onChange={(e) => setZoneFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setZoneDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveZone} disabled={updating} className="flex-1">
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Zone
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transport Record Dialog */}
      {job && job.car && job.customer && profile && (
        <TransportRecordDialog
          open={transportDialogOpen}
          onOpenChange={setTransportDialogOpen}
          jobId={job.id}
          type={transportType}
          carInfo={{
            make: job.car.make,
            model: job.car.model,
            color: job.car.color,
          }}
          customerName={job.customer.name}
          profileId={profile.id}
          onSuccess={fetchTransportRecords}
        />
      )}
    </DashboardLayout>
  );
}
