import React from "react";
import { cn } from "@/lib/utils";

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 160,        // base size
  mainCircleOpacity = 0.24,
  numCircles = 4,
  bgColor = "var(--foreground)",
  responsiveSizes = {
    base: 60, // mobile
    md: 160,  // desktop
  },
  className,
  ...props
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 select-none", className)}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = (mainCircleSize || responsiveSizes.base) + i * 70;
        const opacity = Math.max(mainCircleOpacity - i * 0.03, 0.05); // clamp low opacity
        const animationDelay = `${i * 0.06}s`;

        return (
          <div
            key={i}
            className="absolute animate-ripple rounded-full border shadow-xl"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor: "var(--foreground)",
              backgroundColor: bgColor,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1)",
              // 👇 smooth transition when growing/shrinking
              transition: "width 0.4s ease-in-out, height 0.4s ease-in-out, opacity 0.4s ease-in-out, transform 0.4s ease-in-out",
            }}
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = "Ripple";
