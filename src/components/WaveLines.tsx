interface WaveLinesProps {
  className?: string;
  density?: number;
}

/** Thin organic flowing lines — represents Open Finance data movement. */
export const WaveLines = ({ className = "", density = 26 }: WaveLinesProps) => {
  return (
    <svg
      viewBox="0 0 1200 800"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {Array.from({ length: density }).map((_, i) => (
        <path
          key={i}
          d={`M -100 ${120 + i * 22} Q ${300 + i * 6} ${40 + i * 18}, ${640 + i * 4} ${260 + i * 16} T ${1300} ${500 - i * 8}`}
          stroke="hsl(var(--primary))"
          strokeWidth="0.6"
          opacity={0.06 + i * 0.012}
        />
      ))}
    </svg>
  );
};
