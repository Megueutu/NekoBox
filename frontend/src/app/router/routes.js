export const routes = [
  { path: "/", redirect: "/hub" },
  { path: "/hub", private: false, page: () => import("../../pages/hub/HubPage") },
  { path: "/login", private: false, page: () => import("../../pages/auth/LoginPage") },
  { path: "/game/:slug", private: false, page: () => import("../../pages/game/GamePage") },
  { path: "/profile", private: true, page: () => import("../../pages/profile/ProfilePage") },
  { path: "/wishlist", private: true, page: () => import("../../pages/wishlist/WishlistPage") },
  { path: "/cart", private: true, page: () => import("../../pages/cart/CartPage") },
  { path: "/library", private: true, page: () => import("../../pages/library/LibraryPage") },
];
