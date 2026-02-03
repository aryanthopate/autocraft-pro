import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface RacingStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accentColor?: "primary" | "racing" | "success" | "warning";
  delay?: number;
  className?: string;
}

export function RacingStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = "neutral",
  accentColor = "primary",
  delay = 0,
  className,
}: RacingStatsCardProps) {
  const accentStyles = {
    primary: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
      glow: "shadow-[0_0_20px_hsl(38_92%_50%_/_0.15)]",
    },
    racing: {
      bg: "bg-racing/10",
      border: "border-racing/30",
      text: "text-racing",
      glow: "shadow-[0_0_20px_hsl(0_72%_50%_/_0.15)]",
    },
    success: {
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
      glow: "shadow-[0_0_20px_hsl(142_60%_42%_/_0.15)]",
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      glow: "shadow-[0_0_20px_hsl(45_93%_47%_/_0.15)]",
    },
  };

  const style = accentStyles[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={className}
    >
      <Card className={cn("relative overflow-hidden border", style.border, style.glow)}>
        {/* Racing stripe accent */}
        <motion.div
          className={cn("absolute top-0 left-0 w-1 h-full", style.bg)}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          style={{ transformOrigin: "top" }}
        />

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                135deg,
                transparent,
                transparent 10px,
                currentColor 10px,
                currentColor 11px
              )`,
            }}
          />
        </div>

        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p
                className="text-3xl font-bold font-display tracking-tight"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.3 }}
              >
                {value}
              </motion.p>
              {subtitle && (
                <motion.p
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.5 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>

            <motion.div
              className={cn("p-3 rounded-xl", style.bg)}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: delay + 0.1,
              }}
            >
              <Icon className={cn("h-6 w-6", style.text)} />
            </motion.div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            className={cn("absolute bottom-0 left-0 right-0 h-0.5", style.bg)}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: delay + 0.4 }}
            style={{ transformOrigin: "left" }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
