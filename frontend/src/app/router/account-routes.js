export const ACCOUNT_PATHS = Object.freeze({
  root: "/conta",
  profile: "/conta/perfil",
  settings: "/conta/configuracoes",
  cart: "/conta/carrinho",
  library: "/conta/biblioteca",
  wishlist: "/conta/desejos",
  games: "/conta/jogos",
});

export const accountRoutes = [
  { path: ACCOUNT_PATHS.root, redirect: ACCOUNT_PATHS.profile },
  { path: ACCOUNT_PATHS.profile, page: () => import("../../pages/profile/ProfilePage") },
  { path: ACCOUNT_PATHS.settings, page: () => import("../../pages/settings/SettingsPage") },
  { path: ACCOUNT_PATHS.cart, page: () => import("../../pages/cart/CartPage") },
  { path: ACCOUNT_PATHS.library, page: () => import("../../pages/library/LibraryPage") },
  { path: ACCOUNT_PATHS.wishlist, page: () => import("../../pages/wishlist/WishlistPage") },
  { path: ACCOUNT_PATHS.games, page: () => import("../../pages/my-games/MyGamesPage") },
].map((route) => ({ ...route, private: true }));

export const legacyAccountRoutes = [
  { path: "/profile", redirect: ACCOUNT_PATHS.profile },
  { path: "/configuracoes", redirect: ACCOUNT_PATHS.settings },
  { path: "/cart", redirect: ACCOUNT_PATHS.cart },
  { path: "/library", redirect: ACCOUNT_PATHS.library },
  { path: "/wishlist", redirect: ACCOUNT_PATHS.wishlist },
];
