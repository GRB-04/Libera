import { Link } from "react-router-dom";
import { LiberaLogo } from "./LiberaLogo";
import { BrandBackdrop } from "./BrandBackdrop";

interface AuthShellProps {
  step?: { current: number; total: number; label: string };
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

/** Shared shell for onboarding / consent / result / simulate flows. */
export const AuthShell = ({
  step,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-xl",
}: AuthShellProps) => {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <BrandBackdrop variant="soft" />

      <header className="relative z-10 container flex h-16 items-center justify-between">
        <Link to="/" className="text-foreground hover:text-primary transition-colors">
          <LiberaLogo />
        </Link>
        {step && (
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>{step.label}</span>
            <span className="text-foreground">
              {step.current.toString().padStart(2, "0")}
              <span className="text-muted-foreground"> / {step.total.toString().padStart(2, "0")}</span>
            </span>
          </div>
        )}
      </header>

      <main className="relative z-10 container py-10 md:py-16">
        <div className={`mx-auto ${maxWidth}`}>
          {step && (
            <div className="mb-10 h-[2px] w-full bg-border overflow-hidden rounded-full">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${(step.current / step.total) * 100}%` }}
              />
            </div>
          )}

          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-base md:text-lg text-muted-foreground text-balance">
              {subtitle}
            </p>
          )}

          <div className="mt-10">{children}</div>

          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </main>
    </div>
  );
};
