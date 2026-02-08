import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  Car, 
  Layers, 
  Camera,
  Clock,
  Sparkles,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface JobZone {
  id: string;
  zone_name: string;
  zone_type: string;
  services: any;
  completed: boolean;
  notes: string | null;
}

interface EnhancedZoneSelectorProps {
  zones: JobZone[];
  vehicleType: string;
  onCompleteZone: (zoneId: string) => void;
  onUploadMedia?: (zoneId: string) => void;
  disabled: boolean;
  isWorking?: boolean;
}

export function EnhancedZoneSelector({ 
  zones, 
  vehicleType, 
  onCompleteZone, 
  onUploadMedia,
  disabled,
  isWorking = false
}: EnhancedZoneSelectorProps) {
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const completedCount = zones.filter(z => z.completed).length;
  const totalCount = zones.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Sort zones - incomplete first, then completed
  const sortedZones = [...zones].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const nextZone = sortedZones.find(z => !z.completed);

  return (
    <div className="divide-y">
      {/* Header with Progress */}
      <div className="p-4 bg-gradient-to-r from-racing/5 via-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-racing to-primary flex items-center justify-center shadow-lg shadow-racing/25">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Work Zones</h3>
              <p className="text-sm text-muted-foreground">
                {completedCount === totalCount 
                  ? "All zones completed!" 
                  : `${totalCount - completedCount} zones remaining`}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm px-3 py-1",
              completedCount === totalCount 
                ? "bg-green-500/15 text-green-500 border-green-500/30"
                : "bg-racing/15 text-racing border-racing/30"
            )}
          >
            {completedCount}/{totalCount}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <Progress value={progressPercent} className="h-3" />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-[10px] font-bold text-white drop-shadow">
              {Math.round(progressPercent)}%
            </span>
          </motion.div>
        </div>

        {/* Quick Actions */}
        {nextZone && isWorking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-lg bg-racing/10 border border-racing/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-racing" />
                <span className="text-sm font-medium">Next up:</span>
                <span className="text-sm text-muted-foreground">{nextZone.zone_name}</span>
              </div>
              <Button
                size="sm"
                onClick={() => onCompleteZone(nextZone.id)}
                disabled={disabled}
                className="bg-racing hover:bg-racing/90 gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Zone List */}
      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {sortedZones.map((zone, i) => {
            const services = Array.isArray(zone.services) ? zone.services : [];
            const isExpanded = expandedZone === zone.id;
            const isNext = nextZone?.id === zone.id;
            
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                layout
              >
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => setExpandedZone(isExpanded ? null : zone.id)}
                >
                  <div
                    className={cn(
                      "border-b transition-all",
                      zone.completed && "bg-green-500/5",
                      isNext && !zone.completed && "bg-racing/5 border-l-2 border-l-racing",
                      !zone.completed && !isNext && "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3 p-4">
                      {/* Completion Toggle */}
                      <motion.button
                        onClick={() => !zone.completed && !disabled && onCompleteZone(zone.id)}
                        disabled={disabled || zone.completed}
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                          zone.completed
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                            : disabled
                            ? "border-2 border-muted-foreground/20 cursor-not-allowed"
                            : "border-2 border-muted-foreground/30 hover:border-racing hover:bg-racing/10 hover:scale-110 cursor-pointer"
                        )}
                        whileHover={!zone.completed && !disabled ? { scale: 1.1 } : {}}
                        whileTap={!zone.completed && !disabled ? { scale: 0.95 } : {}}
                      >
                        {zone.completed ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <CheckCircle2 className="h-6 w-6" />
                          </motion.div>
                        ) : (
                          <Circle className={cn(
                            "h-6 w-6 transition-opacity",
                            isNext ? "opacity-100 text-racing" : "opacity-30"
                          )} />
                        )}
                      </motion.button>

                      {/* Zone Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-medium",
                            zone.completed && "text-muted-foreground line-through"
                          )}>
                            {zone.zone_name}
                          </p>
                          {isNext && !zone.completed && (
                            <Badge className="bg-racing/20 text-racing border-racing/30 text-xs">
                              Next
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {zone.zone_type}
                          </Badge>
                        </div>
                        {services.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">
                            {services.slice(0, 3).join(" • ")}
                            {services.length > 3 && ` +${services.length - 3} more`}
                          </p>
                        )}
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-2">
                        {zone.completed && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          </motion.div>
                        )}
                        
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-4 pb-4 pt-0"
                      >
                        <div className="ml-13 pl-4 border-l-2 border-muted space-y-3">
                          {/* Services */}
                          {services.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">SERVICES</p>
                              <div className="flex flex-wrap gap-1.5">
                                {services.map((service: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {zone.notes && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">NOTES</p>
                              <p className="text-sm text-foreground bg-muted/50 rounded p-2">
                                {zone.notes}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          {!zone.completed && isWorking && (
                            <div className="flex gap-2 pt-2">
                              {onUploadMedia && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onUploadMedia(zone.id)}
                                  className="gap-1.5"
                                >
                                  <Camera className="h-3.5 w-3.5" />
                                  Add Photo
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => onCompleteZone(zone.id)}
                                disabled={disabled}
                                className="gap-1.5 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark Complete
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* All Complete Celebration */}
      {completedCount === totalCount && totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 text-center bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <Sparkles className="h-10 w-10 text-green-500 mx-auto mb-2" />
          </motion.div>
          <h4 className="font-semibold text-green-600">All Zones Completed!</h4>
          <p className="text-sm text-muted-foreground mt-1">Ready to submit for review</p>
        </motion.div>
      )}
    </div>
  );
}
