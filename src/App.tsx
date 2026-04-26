import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Entrar from "./pages/Entrar";
import Cadastro from "./pages/Cadastro";

// Fluxo de crédito
import Conectar from "./pages/Conectar";
import Analisando from "./pages/Analisando";
import Resultado from "./pages/Resultado";
import Simular from "./pages/Simular";
import Confirmacao from "./pages/Confirmacao";

// Área logada
import Painel from "./pages/Painel";
import PagamentoPix from "./pages/PagamentoPix";

// Área administrativa
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Index />} />

            {/* Autenticação */}
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/cadastro" element={<Cadastro />} />

            {/* Fluxo principal */}
            <Route path="/conectar" element={<Conectar />} />
            <Route path="/analisando" element={<Analisando />} />
            <Route path="/resultado" element={<Resultado />} />
            <Route path="/simular" element={<Simular />} />
            <Route path="/confirmacao" element={<Confirmacao />} />

            {/* Área logada */}
            <Route path="/painel" element={<Painel />} />
            <Route path="/pagamento-pix/:debtId/:installmentId" element={<PagamentoPix />} />

            {/* Área administrativa */}
            <Route path="/admin" element={<Admin />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;