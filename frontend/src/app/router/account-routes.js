export const ACCOUNT_PATHS = Object.freeze({
  root: "/conta",
  profile: "/conta/perfil",
  cart: "/conta/carrinho",
  library: "/conta/biblioteca",
  wishlist: "/conta/desejos",
  games: "/conta/jogos",
});

export const accountRoutes = [
  { path: ACCOUNT_PATHS.root, redirect: ACCOUNT_PATHS.profile },
  { path: ACCOUNT_PATHS.profile, page: () => import("../../pages/account/ProfilePage") },
  { path: ACCOUNT_PATHS.cart, page: () => import("../../pages/games/cart/CartPage") },
  { path: ACCOUNT_PATHS.library, page: () => import("../../pages/games/LibraryPage") },
  { path: ACCOUNT_PATHS.wishlist, page: () => import("../../pages/games/WishlistPage") },
  { path: ACCOUNT_PATHS.games, page: () => import("../../pages/games/MyGamesPage") },
].map((route) => ({ ...route, private: true }));

export const legacyAccountRoutes = [
  { path: "/profile", redirect: ACCOUNT_PATHS.profile },
  { path: "/cart", redirect: ACCOUNT_PATHS.cart },
  { path: "/library", redirect: ACCOUNT_PATHS.library },
  { path: "/wishlist", redirect: ACCOUNT_PATHS.wishlist },
];
