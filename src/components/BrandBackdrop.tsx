import { WaveLines } from "./WaveLines";

interface BrandBackdropProps {
  variant?: "default" | "soft" | "minimal";
  className?: string;
}

/** Reusable atmospheric backdrop: dot grid + wave lines + radial glow. */
export const BrandBackdrop = ({ variant = "default", className = "" }: BrandBackdropProps) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-fine-grid opacity-60" />
      {variant !== "minimal" && (
        <WaveLines className="absolute inset-0 h-full w-full opacity-80" />
      )}
      {variant === "default" && (
        <div className="absolute inset-x-0 top-0 h-[600px] bg-radial-glow" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
};
