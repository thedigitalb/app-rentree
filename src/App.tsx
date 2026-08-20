import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/useAuth";
import { FoyerProvider } from "@/hooks/useFoyer";
import { PreferencesProvider } from "@/hooks/usePreferences";
import { RequireAuth, RequireFoyer, RequireNoFoyer } from "@/components/RouteGuards";
import { AppLayout } from "@/components/AppLayout";

import Welcome from "@/pages/Welcome";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import OnboardingFoyer from "@/pages/onboarding/OnboardingFoyer";
import OnboardingEnfants from "@/pages/onboarding/OnboardingEnfants";
import OnboardingImport from "@/pages/onboarding/OnboardingImport";
import OnboardingCelebration from "@/pages/onboarding/OnboardingCelebration";
import Dashboard from "@/pages/Dashboard";
import Enfant from "@/pages/Enfant";
import Trousse from "@/pages/Trousse";
import Stock from "@/pages/Stock";
import Attribuables from "@/pages/Attribuables";
import AAcheter from "@/pages/AAcheter";
import Budget from "@/pages/Budget";
import Reglages from "@/pages/Reglages";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FoyerProvider>
          <PreferencesProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/bienvenue" element={<Welcome />} />
                <Route path="/connexion" element={<Login />} />
                <Route path="/inscription" element={<Signup />} />

                <Route
                  path="/onboarding/foyer"
                  element={
                    <RequireAuth>
                      <RequireNoFoyer>
                        <OnboardingFoyer />
                      </RequireNoFoyer>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/onboarding/enfants"
                  element={
                    <RequireAuth>
                      <RequireNoFoyer>
                        <OnboardingEnfants />
                      </RequireNoFoyer>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/onboarding/import"
                  element={
                    <RequireAuth>
                      <RequireNoFoyer>
                        <OnboardingImport />
                      </RequireNoFoyer>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/onboarding/celebration"
                  element={
                    <RequireAuth>
                      <OnboardingCelebration />
                    </RequireAuth>
                  }
                />

                <Route
                  element={
                    <RequireFoyer>
                      <AppLayout />
                    </RequireFoyer>
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/enfant/:id" element={<Enfant />} />
                  <Route path="/trousse/:id" element={<Trousse />} />
                  <Route path="/stock" element={<Stock />} />
                  <Route path="/attribuables" element={<Attribuables />} />
                  <Route path="/a-acheter" element={<AAcheter />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/reglages" element={<Reglages />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </PreferencesProvider>
        </FoyerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
