import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Members from "./pages/Members";
import MemberDetails from "./pages/MemberDetails";
import Circulation from "./pages/Circulation";
import Fines from "./pages/Fines";
import Reports from "./pages/Reports";
import Reservations from "./pages/Reservations";
import Inventory from "./pages/Inventory";
import AdvancedSearch from "./pages/AdvancedSearch";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/books" element={<ProtectedLayout><Books /></ProtectedLayout>} />
      <Route path="/books/:id" element={<ProtectedLayout><BookDetails /></ProtectedLayout>} />
      <Route path="/members" element={<ProtectedLayout><Members /></ProtectedLayout>} />
      <Route path="/members/:id" element={<ProtectedLayout><MemberDetails /></ProtectedLayout>} />
      <Route path="/circulation" element={<ProtectedLayout><Circulation /></ProtectedLayout>} />
      <Route path="/fines" element={<ProtectedLayout><Fines /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
      <Route path="/reservations" element={<ProtectedLayout><Reservations /></ProtectedLayout>} />
      <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
      <Route path="/search" element={<ProtectedLayout><AdvancedSearch /></ProtectedLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
