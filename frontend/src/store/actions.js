import { Store } from "./store";
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
    Store.setState(() => ({
      user: null,
      cart: [],
      wishlist: [],
      library: [],
      loading: false,
    }));
    window.dispatchEvent(new CustomEvent("rerender"));
  },

  async adicionarAoCarrinho(game) {
    const cart = await AccountService.addToCart(game.id);
    Store.setState((state) => ({ ...state, cart }));
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
    const library = await AccountService.checkout();
    Store.setState((state) => ({ ...state, library, cart: [] }));
  },

  async atualizarDadosPerfil(username, bio, avatarUrl) {
    const user = await AccountService.updateProfile(username, bio, avatarUrl);
    Store.setState((state) => ({ ...state, user }));
  },
};
