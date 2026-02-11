import { useState } from "react";
import { motion } from "framer-motion";
import {
  Car,
  User,
  Play,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
} from "lucide-react";
import { JobTimerWidget } from "@/components/mechanic/JobTimerWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Job3DViewer } from "@/components/mechanic/Job3DViewer";
import { EnhancedZoneSelector } from "@/components/mechanic/EnhancedZoneSelector";
import { WorkLogsPanel } from "@/components/mechanic/WorkLogsPanel";
import { RejectionFeedback } from "@/components/mechanic/RejectionFeedback";
import { ZoneMediaUpload } from "@/components/mechanic/ZoneMediaUpload";
import { cn } from "@/lib/utils";
import type { WorkbenchJob, WorkbenchZone, CarModel3D } from "@/hooks/useJobWorkbench";

interface JobWorkAreaProps {
  selectedJob: WorkbenchJob | null;
  zones: WorkbenchZone[];
  carModel3D: CarModel3D | null;
  updating: boolean;
  completedZoneCount: number;
  progressPercent: number;
  profileId?: string;
  onStartJob: (jobId: string) => void;
  onCompleteZone: (zoneId: string) => void;
  onSubmitForReview: (notes: string) => void;
  accentColor?: "racing" | "primary";
}

export function JobWorkArea({
  selectedJob,
  zones,
  carModel3D,
  updating,
  completedZoneCount,
  progressPercent,
  profileId,
  onStartJob,
  onCompleteZone,
  onSubmitForReview,
  accentColor = "racing",
}: JobWorkAreaProps) {
  const [activeTab, setActiveTab] = useState("zones");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [mediaUploadZone, setMediaUploadZone] = useState<{ id: string; name: string } | null>(null);

  const handleSubmit = () => {
    onSubmitForReview(submissionNotes);
    setSubmitDialogOpen(false);
    setSubmissionNotes("");
  };

  const accent = accentColor === "racing" ? "racing" : "primary";

  if (!selectedJob) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Car className="h-20 w-20 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="font-semibold text-xl mb-2">Select a Job</h3>
            <p className="text-muted-foreground">Choose a job from your queue to start working</p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Rejection Feedback Banner */}
        {selectedJob.status === "in_progress" && (
          <RejectionFeedback jobId={selectedJob.id} />
        )}

        {/* Timer Widget */}
        <JobTimerWidget
          jobId={selectedJob.id}
          isJobActive={selectedJob.status === "in_progress"}
        />

        {/* 3D Vehicle Viewer */}
        <Card className="overflow-hidden">
          <Job3DViewer
            modelUrl={carModel3D?.model_url || null}
            carColor={selectedJob.car?.color || carModel3D?.default_color}
            vehicleInfo={
              selectedJob.car
                ? {
                    make: selectedJob.car.make,
                    model: selectedJob.car.model,
                    year: selectedJob.car.year,
                    vehicleType: selectedJob.car.vehicle_type,
                  }
                : undefined
            }
            completedZones={zones
              .filter((z) => z.completed)
              .map((z) => z.zone_name.toLowerCase().replace(/\s+/g, "_"))}
            totalZones={zones.length}
          />
        </Card>

        {/* Work Area Card */}
        <Card className="overflow-hidden">
          <CardHeader className={cn("bg-gradient-to-r border-b", `from-${accent}/10 via-${accent === "racing" ? "primary" : "racing"}/5 to-transparent`)}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", `bg-gradient-to-br from-${accent}/20 to-primary/20`)}>
                  <Car className={cn("h-7 w-7", `text-${accent}`)} />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {selectedJob.car?.make} {selectedJob.car?.model}
                    {selectedJob.car?.year && (
                      <span className="text-muted-foreground font-normal ml-2">({selectedJob.car.year})</span>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedJob.customer?.name}
                    </span>
                    {selectedJob.car?.color && (
                      <Badge variant="outline" className="text-xs">
                        {selectedJob.car.color}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-sm px-3 py-1",
                  selectedJob.status === "in_progress" && "bg-racing/15 text-racing border-racing/30",
                  selectedJob.status === "pending" && "bg-amber-500/15 text-amber-500 border-amber-500/30",
                  selectedJob.status === "scheduled" && "bg-blue-500/15 text-blue-500 border-blue-500/30",
                  selectedJob.status === "awaiting_review" && "bg-purple-500/15 text-purple-500 border-purple-500/30"
                )}
              >
                {selectedJob.status.replace("_", " ")}
              </Badge>
            </div>

            {/* Progress Bar */}
            {zones.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={cn("font-semibold", `text-${accent}`)}>
                    {completedZoneCount}/{zones.length} zones
                  </span>
                </div>
                <div className="relative">
                  <Progress value={progressPercent} className="h-3" />
                  {progressPercent > 0 && (
                    <motion.div
                      className="absolute inset-y-0 left-0 flex items-center justify-end pr-2"
                      style={{ width: `${progressPercent}%` }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="text-[10px] font-bold text-white">{Math.round(progressPercent)}%</span>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {/* Start Button */}
            {(selectedJob.status === "pending" || selectedJob.status === "scheduled") && (
              <div className="p-8 text-center border-b bg-gradient-to-b from-transparent to-racing/5">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                  <Button
                    size="lg"
                    onClick={() => onStartJob(selectedJob.id)}
                    disabled={updating}
                    className="gap-2 bg-gradient-to-r from-racing to-primary hover:from-racing/90 hover:to-primary/90 shadow-lg shadow-racing/25"
                  >
                    {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                    Start Working
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Tabs for In-Progress Jobs */}
            {selectedJob.status === "in_progress" && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="zones"
                    className={cn("flex-1 rounded-none py-3 data-[state=active]:border-b-2", `data-[state=active]:border-${accent} data-[state=active]:text-${accent}`)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Work Zones
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className={cn("flex-1 rounded-none py-3 data-[state=active]:border-b-2", `data-[state=active]:border-${accent} data-[state=active]:text-${accent}`)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="zones" className="m-0">
                  {zones.length > 0 ? (
                    <EnhancedZoneSelector
                      zones={zones}
                      vehicleType={selectedJob.car?.vehicle_type || "sedan"}
                      onCompleteZone={onCompleteZone}
                      onUploadMedia={(zoneId) => {
                        const zone = zones.find(z => z.id === zoneId);
                        if (zone) setMediaUploadZone({ id: zoneId, name: zone.zone_name });
                      }}
                      disabled={updating}
                      isWorking={true}
                    />
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No zones configured for this job</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="m-0 p-4">
                  <WorkLogsPanel jobId={selectedJob.id} />
                </TabsContent>
              </Tabs>
            )}

            {/* Non-in-progress zone display */}
            {selectedJob.status !== "in_progress" && zones.length > 0 && (
              <EnhancedZoneSelector
                zones={zones}
                vehicleType={selectedJob.car?.vehicle_type || "sedan"}
                onCompleteZone={onCompleteZone}
                disabled={true}
                isWorking={false}
              />
            )}

            {/* Submit Button */}
            {selectedJob.status === "in_progress" && zones.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-muted/30 to-transparent border-t">
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-primary to-racing"
                  size="lg"
                  disabled={completedZoneCount < zones.length}
                  onClick={() => setSubmitDialogOpen(true)}
                >
                  <Send className="h-5 w-5" />
                  Submit for Review
                </Button>
                {completedZoneCount < zones.length && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Complete all {zones.length - completedZoneCount} remaining zone(s) to submit
                  </p>
                )}
              </div>
            )}

            {/* Job Notes */}
            {selectedJob.notes && (
              <div className="p-4 bg-amber-500/5 border-t border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-medium text-amber-600">Job Notes</p>
                </div>
                <p className="text-sm text-muted-foreground">{selectedJob.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Submit Job for Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completion Status</span>
                <Badge className="bg-accent/80 text-accent-foreground">
                  {completedZoneCount}/{zones.length} zones
                </Badge>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="space-y-2">
              <Label>Completion Notes (optional)</Label>
              <Textarea
                placeholder="Any notes about the completed work, issues found, or recommendations..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSubmitDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-primary to-racing" disabled={updating}>
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zone Media Upload */}
      {mediaUploadZone && profileId && (
        <ZoneMediaUpload
          jobId={selectedJob.id}
          zoneId={mediaUploadZone.id}
          zoneName={mediaUploadZone.name}
          profileId={profileId}
          open={!!mediaUploadZone}
          onOpenChange={(open) => { if (!open) setMediaUploadZone(null); }}
        />
      )}
    </>
  );
}
