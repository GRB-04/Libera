import { LiberaLogo } from "@/components/LiberaLogo";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center">
      <LiberaLogo size={100} />

      <h1 className="text-3xl font-display mt-6">
        Bem-vindo à Libera
      </h1>

      <p className="text-muted-foreground mt-2">
        Aqui vai aparecer sua análise de crédito
      </p>
    </div>
  );
}