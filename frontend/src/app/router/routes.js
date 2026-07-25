import { accountRoutes, legacyAccountRoutes } from "./account-routes";

export const routes = [
  { path: "/", private: false, page: () => import("../../pages/landing/LandingPage") },
  { path: "/acessibilidade", private: false, page: () => import("../../pages/accessibility/AccessibilityPage") },
  { path: "/termos-de-uso", private: false, page: () => import("../../pages/legal/TermsPage") },
  { path: "/privacidade", private: false, page: () => import("../../pages/legal/PrivacyPage") },
  { path: "/hub", private: false, page: () => import("../../pages/hub/HubPage") },
  { path: "/login", private: false, page: () => import("../../pages/auth/LoginPage") },
  { path: "/game/:slug", private: false, page: () => import("../../pages/game/GamePage") },
  ...accountRoutes,
  ...legacyAccountRoutes,
  { path: "/admin", private: true, admin: true, page: () => import("../../pages/admin/AdminPage") },
];
