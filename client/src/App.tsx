import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileMenu } from './components/layout/MobileMenu';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DeveloperPage } from './pages/DeveloperPage';
import { ComparePage } from './pages/ComparePage';
import { PinnedPage } from './pages/PinnedPage';
import { SavedComparisonsPage } from './pages/SavedComparisonsPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-[#f8fafc] text-slate-800 flex flex-col overflow-hidden">
      <Navbar onToggleSidebar={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex w-full overflow-hidden">
        <Sidebar className="hidden md:flex flex-shrink-0" />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/developer/:username"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DeveloperPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ComparePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pins"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PinnedPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/comparisons"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SavedComparisonsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
