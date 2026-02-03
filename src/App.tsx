import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import StaffSignUpPage from "./pages/StaffSignUpPage";
import StaffOnboardingPage from "./pages/StaffOnboardingPage";
import JoinStudioPage from "./pages/JoinStudioPage";
import SetupPage from "./pages/SetupPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import DashboardPage from "./pages/DashboardPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import JobsPage from "./pages/JobsPage";
import NewJobPage from "./pages/NewJobPage";
import CustomersPage from "./pages/CustomersPage";
import VehiclesPage from "./pages/VehiclesPage";
import StaffPage from "./pages/StaffPage";
import SettingsPage from "./pages/SettingsPage";
import JobDetailPage from "./pages/JobDetailPage";
import InvoicesPage from "./pages/InvoicesPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/staff-signup" element={<StaffSignUpPage />} />
          <Route path="/join" element={<JoinStudioPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/staff-onboarding" element={<StaffOnboardingPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          
          {/* Protected routes - Owner Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/jobs" element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/jobs/new" element={
            <ProtectedRoute>
              <NewJobPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/jobs/:jobId" element={
            <ProtectedRoute>
              <JobDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/customers" element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/vehicles" element={
            <ProtectedRoute>
              <VehiclesPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/staff" element={
            <ProtectedRoute requireOwner>
              <StaffPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute requireOwner>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/invoices" element={
            <ProtectedRoute requireOwner>
              <InvoicesPage />
            </ProtectedRoute>
          } />
          
          {/* Staff Dashboard */}
          <Route path="/staff" element={
            <ProtectedRoute>
              <StaffDashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
