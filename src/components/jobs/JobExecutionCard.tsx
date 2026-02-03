import { useState } from "react";
import { motion } from "framer-motion";
import {
  Car,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Camera,
  Play,
  Send,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface JobZone {
  id: string;
  zone_name: string;
  zone_type: string;
  services: string[] | null;
  completed: boolean;
  notes: string | null;
}

interface JobExecutionCardProps {
  job: {
    id: string;
    status: string;
    scheduled_date: string | null;
    customer?: { name: string; phone: string };
    car?: { make: string; model: string; year: number | null; color: string | null };
    notes: string | null;
  };
  zones: JobZone[];
  onStartJob: () => void;
  onCompleteZone: (zoneId: string) => void;
  onUploadMedia: (zoneId: string) => void;
  onSubmitForReview: () => void;
}

export function JobExecutionCard({
  job,
  zones,
  onStartJob,
  onCompleteZone,
  onUploadMedia,
  onSubmitForReview,
}: JobExecutionCardProps) {
  const completedZones = zones.filter((z) => z.completed).length;
  const progressPercent = zones.length > 0 ? (completedZones / zones.length) * 100 : 0;
  const canSubmit = zones.length > 0 && completedZones === zones.length;
  const isInProgress = job.status === "in_progress";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "scheduled":
        return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      case "in_progress":
        return "bg-racing/15 text-racing border-racing/30";
      case "awaiting_review":
        return "bg-purple-500/15 text-purple-500 border-purple-500/30";
      case "completed":
        return "bg-green-500/15 text-green-500 border-green-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header with car info */}
      <CardHeader className="pb-4 bg-gradient-to-r from-racing/5 to-primary/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-racing/10 flex items-center justify-center">
              <Car className="h-7 w-7 text-racing" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {job.car?.make} {job.car?.model}
                {job.car?.year && ` (${job.car.year})`}
              </CardTitle>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {job.customer?.name}
                </span>
                {job.car?.color && (
                  <span className="flex items-center gap-1">
                    <span
                      className="h-3 w-3 rounded-full border"
                      style={{ backgroundColor: job.car.color }}
                    />
                    {job.car.color}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(job.status)}>
            {job.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Progress */}
        {zones.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {completedZones}/{zones.length} zones complete
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Schedule info */}
        {job.scheduled_date && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Start Job Button */}
        {job.status === "pending" || job.status === "scheduled" ? (
          <div className="p-6 text-center border-b">
            <Button size="lg" onClick={onStartJob} className="gap-2">
              <Play className="h-5 w-5" />
              Start Working on This Job
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Click to begin the detailing process
            </p>
          </div>
        ) : null}

        {/* Zones List */}
        {zones.length > 0 ? (
          <div className="divide-y divide-border">
            {zones.map((zone, index) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 flex items-center justify-between ${
                  zone.completed ? "bg-green-500/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => !zone.completed && onCompleteZone(zone.id)}
                    disabled={!isInProgress || zone.completed}
                    className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                      zone.completed
                        ? "bg-green-500 text-white"
                        : isInProgress
                        ? "border-2 border-muted-foreground/30 hover:border-green-500"
                        : "border-2 border-muted-foreground/20"
                    }`}
                  >
                    {zone.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-3 w-3 text-transparent" />
                    )}
                  </button>
                  <div>
                    <p className={`font-medium ${zone.completed ? "line-through text-muted-foreground" : ""}`}>
                      {zone.zone_name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {zone.zone_type} • {(zone.services || []).length} services
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUploadMedia(zone.id)}
                    disabled={!isInProgress}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Media
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No zones configured for this job</p>
            <p className="text-sm mt-1">
              Contact your studio owner to add zones
            </p>
          </div>
        )}

        {/* Submit for Review */}
        {isInProgress && (
          <div className="p-6 bg-muted/30 border-t">
            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!canSubmit}
              onClick={onSubmitForReview}
            >
              <Send className="h-5 w-5" />
              Submit for Owner Review
            </Button>
            {!canSubmit && zones.length > 0 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Complete all zones before submitting
              </p>
            )}
          </div>
        )}

        {/* Job Notes */}
        {job.notes && (
          <div className="p-4 bg-amber-500/5 border-t border-amber-500/20">
            <p className="text-sm font-medium text-amber-600 mb-1">Job Notes:</p>
            <p className="text-sm text-muted-foreground">{job.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
