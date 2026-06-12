// {/* MARKER-MAKE-KIT-INVOKED */}
// No @make-kits design system is present in this project.
// Using Radix UI + shadcn-style components + Tailwind CSS (already installed).

import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./components/Layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EntitySearchPage } from "./pages/EntitySearchPage";
import { RiskAnalysisPage } from "./pages/RiskAnalysisPage";
import { AuditTrailPage } from "./pages/AuditTrailPage";
import { DataSourcesPage } from "./pages/DataSourcesPage";
import { ChatAssistantPage } from "./pages/ChatAssistantPage";
import { EntityMatchingPage } from "./pages/EntityMatchingPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected app routes — AppLayout enforces auth */}
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* EntitySearch handles /search (list) and /search/:entityId (detail) */}
            <Route path="/search" element={<EntitySearchPage />} />
            <Route path="/search/:entityId" element={<EntitySearchPage />} />
            <Route path="/match" element={<EntityMatchingPage />} />
            <Route path="/risk" element={<RiskAnalysisPage />} />
            <Route path="/audit" element={<AuditTrailPage />} />
            <Route path="/data-sources" element={<DataSourcesPage />} />
            <Route path="/chat" element={<ChatAssistantPage />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
