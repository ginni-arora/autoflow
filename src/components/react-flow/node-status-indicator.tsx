import { type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export const NODE_RADIUS = "rounded-[50%]";


export type NodeStatus = "loading" | "success" | "error" | "initial";
export type NodeStatusVariant = "overlay" | "border";

export type NodeStatusIndicatorProps = {
  status?: NodeStatus;
  variant?: NodeStatusVariant;
  children: ReactNode;
  className?: string;
  animated?: boolean;
};

/* ---------------------- LOADING OVERLAY ---------------------- */

export const SpinnerLoadingIndicator = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <div className="relative">
      <StatusBorder className="border-blue-700/40">{children}</StatusBorder>

      <div className="absolute inset-0 z-50 rounded-[7px] bg-background/50 backdrop-blur-sm" />
      <div className="absolute inset-0 z-50">
        <span className="absolute top-[calc(50%-1.25rem)] left-[calc(50%-1.25rem)] inline-block h-10 w-10 animate-ping rounded-full bg-blue-700/20" />

        <LoaderCircle className="absolute top-[calc(50%-0.75rem)] left-[calc(50%-0.75rem)] size-6 animate-spin text-blue-700" />
      </div>
    </div>
  );
};

/* ---------------------- LOADING BORDER ---------------------- */

export const BorderLoadingIndicator = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <>
      <div className={cn("absolute inset-0 overflow-hidden rounded-[50%]", className)}>

        <style>
          {`
            @keyframes spin {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .spinner {
              animation: spin 2s linear infinite;
              position: absolute;
              left: 50%;
              top: 50%;
              width: 140%;
              aspect-ratio: 1;
              transform-origin: center;
            }
          `}
        </style>

        {/* FIXED: NODE_RADIUS applied as variable */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden",
            NODE_RADIUS,
            className
          )}
        >
          <div className="spinner rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgb(42,67,233)_0deg,rgba(42,138,246,0)_360deg)]" />
        </div>
      </div>

      {children}
    </>
  );
};

/* ---------------------- STATUS BORDER ---------------------- */

const StatusBorder = ({
  children,
  className,
  borderRadius,
}: {
  children: ReactNode;
  className?: string;
  borderRadius?: string;
}) => {
  return (
    <>
      <div
        className={cn(
          "absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)] border-2",
          borderRadius || "rounded-[50%]",
          className,
        )}
      />
      {children}
    </>
  );
};


/* ---------------------- MAIN WRAPPER ---------------------- */

export const NodeStatusIndicator = ({
  status,
  variant = "border",
  children,
  className,
  animated = true,
}: NodeStatusIndicatorProps) => {
  switch (status) {
    case "loading":
      if (variant === "border") {
        return (
          <>
            <div className={cn("absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)] border-2 border-blue-700", className)} 
                 style={animated ? { animation: 'spin 3s linear infinite' } : {}} />
            {children}
          </>
        );
      }
      if (variant === "overlay") {
        return <SpinnerLoadingIndicator>{children}</SpinnerLoadingIndicator>;
      }
      return <>{children}</>;

    case "success":
      return (
        <StatusBorder 
          className="border-emerald-600" 
          borderRadius={className}
        >
          {children}
        </StatusBorder>
      );

    case "error":
      return (
        <StatusBorder 
          className="border-red-400" 
          borderRadius={className}
        >
          {children}
        </StatusBorder>
      );

    default:
      return <>{children}</>;
  }
};
