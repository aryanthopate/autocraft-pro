import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WorkbenchJob {
  id: string;
  status: string;
  scheduled_date: string | null;
  notes: string | null;
  customer?: { name: string; phone: string };
  car?: {
    make: string;
    model: string;
    year: number | null;
    color: string | null;
    vehicle_type?: string;
  };
}

export interface WorkbenchZone {
  id: string;
  zone_name: string;
  zone_type: string;
  services: any;
  completed: boolean;
  notes: string | null;
}

export interface CarModel3D {
  id: string;
  make: string;
  model: string;
  model_url: string;
  default_color: string | null;
}

export function useJobWorkbench(studioId?: string, profileId?: string) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<WorkbenchJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<WorkbenchJob | null>(null);
  const [zones, setZones] = useState<WorkbenchZone[]>([]);
  const [carModel3D, setCarModel3D] = useState<CarModel3D | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!studioId || !profileId) return;

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, customers(name, phone), cars(make, model, year, color, vehicle_type)")
        .eq("studio_id", studioId)
        .eq("assigned_to", profileId)
        .in("status", ["pending", "scheduled", "in_progress", "awaiting_review"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((j: any) => ({
        ...j,
        customer: j.customers,
        car: j.cars,
      }));

      setJobs(mapped);

      // Auto-select first in-progress or first job
      const inProgress = mapped.find((j: WorkbenchJob) => j.status === "in_progress");
      const autoSelect = inProgress || mapped[0] || null;
      if (autoSelect) {
        setSelectedJob(autoSelect);
        fetchZones(autoSelect.id);
        fetchCarModel(autoSelect.car?.make, autoSelect.car?.model);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [studioId, profileId]);

  useEffect(() => {
    if (studioId && profileId) fetchJobs();
  }, [studioId, profileId, fetchJobs]);

  const fetchZones = async (jobId: string) => {
    const { data, error } = await supabase
      .from("job_zones")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at");

    if (!error && data) setZones(data as WorkbenchZone[]);
  };

  const fetchCarModel = async (make?: string, model?: string) => {
    if (!make || !model) {
      setCarModel3D(null);
      return;
    }

    const { data } = await supabase
      .from("car_models_3d")
      .select("*")
      .eq("is_active", true)
      .ilike("make", make)
      .ilike("model", `%${model}%`)
      .limit(1)
      .maybeSingle();

    setCarModel3D(data as CarModel3D | null);
  };

  const selectJob = (job: WorkbenchJob) => {
    setSelectedJob(job);
    fetchZones(job.id);
    fetchCarModel(job.car?.make, job.car?.model);
  };

  const startJob = async (jobId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", jobId);

      if (error) throw error;

      if (profileId) {
        await supabase.from("work_logs").insert({
          job_id: jobId,
          performed_by: profileId,
          action: "job_started",
        });
      }

      toast({ title: "Job started!", description: "Let's get to work!" });
      fetchJobs();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not start job." });
    } finally {
      setUpdating(false);
    }
  };

  const completeZone = async (zoneId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("job_zones")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", zoneId);

      if (error) throw error;

      if (profileId && selectedJob?.id) {
        await supabase.from("work_logs").insert({
          job_id: selectedJob.id,
          zone_id: zoneId,
          performed_by: profileId,
          action: "zone_completed",
        });
      }

      toast({ title: "Zone completed!", description: "Great work!" });
      if (selectedJob) fetchZones(selectedJob.id);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not update zone." });
    } finally {
      setUpdating(false);
    }
  };

  const submitForReview = async (notes: string) => {
    if (!selectedJob || !profileId) return;

    setUpdating(true);
    try {
      const { error: jobError } = await supabase
        .from("jobs")
        .update({ status: "awaiting_review" })
        .eq("id", selectedJob.id);

      if (jobError) throw jobError;

      const { error: subError } = await supabase
        .from("job_submissions")
        .insert({
          job_id: selectedJob.id,
          submitted_by: profileId,
          notes: notes || null,
        });

      if (subError) throw subError;

      await supabase.from("work_logs").insert({
        job_id: selectedJob.id,
        performed_by: profileId,
        action: "job_submitted",
        notes: notes || null,
      });

      toast({ title: "Submitted for review", description: "The owner will review your work." });
      fetchJobs();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not submit job." });
    } finally {
      setUpdating(false);
    }
  };

  const completedZoneCount = zones.filter((z) => z.completed).length;
  const progressPercent = zones.length > 0 ? (completedZoneCount / zones.length) * 100 : 0;

  const pendingJobs = jobs.filter((j) => j.status === "pending" || j.status === "scheduled");
  const activeJobs = jobs.filter((j) => j.status === "in_progress");
  const reviewJobs = jobs.filter((j) => j.status === "awaiting_review");

  return {
    jobs,
    selectedJob,
    zones,
    carModel3D,
    loading,
    updating,
    pendingJobs,
    activeJobs,
    reviewJobs,
    completedZoneCount,
    progressPercent,
    selectJob,
    startJob,
    completeZone,
    submitForReview,
    fetchJobs,
  };
}
