import { clearSessionState, Store } from "./store";
import { AccountService } from "../services/account/account.service";

export const Actions = {
  setUser(user) {
    Store.setState((state) => ({ ...state, user }));
    window.dispatchEvent(new CustomEvent("rerender"));
  },

  hydrateAccount({ user, cart, wishlist, library }) {
    Store.setState((state) => ({ ...state, user, cart, wishlist, library, loading: false }));
  },

  logout() {
    clearSessionState();
    window.dispatchEvent(new CustomEvent("rerender"));
  },

  async adicionarAoCarrinho(game) {
    const cart = await AccountService.addToCart(game.id);
    Store.setState((state) => ({ ...state, cart }));
  },

  async adquirirLicencaGratuita(game) {
    const acquiredGame = await AccountService.acquireFreeLicense(game.id);
    Store.setState((state) => ({
      ...state,
      library: state.library.some((item) => String(item.id) === String(acquiredGame.id))
        ? state.library
        : [...state.library, acquiredGame],
    }));
  },

  async removerDoCarrinho(gameId) {
    const cart = await AccountService.removeFromCart(gameId);
    Store.setState((state) => ({ ...state, cart }));
  },

  async alternarListaDesejos(game) {
    const { wishlist } = Store.getState();
    const existe = wishlist.some((item) => String(item.id) === String(game.id));
    if (existe) {
      await AccountService.removeFromWishlist(game.id);
    } else {
      await AccountService.addToWishlist(game.id);
    }
    const novaLista = await AccountService.getWishlist();
    Store.setState((state) => ({ ...state, wishlist: novaLista }));
  },

  async finalizarCheckoutCarrinho() {
    const { payments, library } = await AccountService.checkout();
    Store.setState((state) => ({ ...state, library, cart: [] }));
    return { payments };
  },

  async atualizarDadosPerfil(username, bio, avatarUrl) {
    const user = await AccountService.updateProfile(username, bio, avatarUrl);
    Store.setState((state) => ({ ...state, user }));
  },
};
