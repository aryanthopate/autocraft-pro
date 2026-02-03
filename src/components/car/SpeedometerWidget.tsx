import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpeedometerWidgetProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  className?: string;
}

export function SpeedometerWidget({
  value,
  max,
  label,
  sublabel,
  className,
}: SpeedometerWidgetProps) {
  const percentage = Math.min(value / max, 1);
  const angle = -135 + percentage * 270; // -135 to 135 degrees

  return (
    <div className={cn("relative w-32 h-32", className)}>
      {/* Background arc */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {/* Outer glow ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--racing-red) / 0.1)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Track */}
        <path
          d="M 15 75 A 40 40 0 1 1 85 75"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Progress */}
        <motion.path
          d="M 15 75 A 40 40 0 1 1 85 75"
          fill="none"
          stroke="url(#speedGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="188.5"
          initial={{ strokeDashoffset: 188.5 }}
          animate={{ strokeDashoffset: 188.5 * (1 - percentage) }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--racing-red))" />
          </linearGradient>
        </defs>

        {/* Tick marks */}
        {[...Array(11)].map((_, i) => {
          const tickAngle = -135 + i * 27;
          const tickRad = (tickAngle * Math.PI) / 180;
          const innerR = 32;
          const outerR = 36;
          const x1 = 50 + innerR * Math.cos(tickRad);
          const y1 = 50 + innerR * Math.sin(tickRad);
          const x2 = 50 + outerR * Math.cos(tickRad);
          const y2 = 50 + outerR * Math.sin(tickRad);

          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i <= percentage * 10 ? "hsl(var(--racing-red))" : "hsl(var(--muted-foreground) / 0.3)"}
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * i, duration: 0.2 }}
            />
          );
        })}

        {/* Center circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="8"
          fill="hsl(var(--card))"
          stroke="hsl(var(--racing-red))"
          strokeWidth="1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />

        {/* Needle */}
        <motion.line
          x1="50"
          y1="50"
          x2="50"
          y2="20"
          stroke="hsl(var(--racing-red))"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ rotate: -135, originX: "50px", originY: "50px" }}
          animate={{ rotate: angle, originX: "50px", originY: "50px" }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{ transformOrigin: "50px 50px" }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
        <motion.span
          className="text-xl font-bold text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          {value}
        </motion.span>
        <motion.span
          className="text-[10px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {label}
        </motion.span>
      </div>

      {/* Sublabel */}
      {sublabel && (
        <motion.p
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          {sublabel}
        </motion.p>
      )}
    </div>
  );
}
