import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminProfessionals from "./pages/AdminProfessionals";
import AdminTestimonials from "./pages/AdminTestimonials";

// HCLIN / Cuidado em Camadas: navegação pública com respiro editorial, marca H+ e acesso claro ao WhatsApp.
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/privacidade" component={Privacy} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/panel" component={AdminPanel} />
      <Route path="/admin/professionals" component={AdminProfessionals} />
      <Route path="/admin/testimonials" component={AdminTestimonials} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
