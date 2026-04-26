import liberaLogo from "@/assets/libera-logo.png";

interface LiberaLogoProps {
  className?: string;
  size?: number;
}

export const LiberaLogo = ({ className = "", size = 48 }: LiberaLogoProps) => {
  return (
    <img
      src={liberaLogo}
      alt="Libera"
      className={`block object-contain ${className}`}
      style={{
        width: size,
        height: "auto", // 🔥 ISSO AQUI resolve tudo
      }}
    />
  );
};