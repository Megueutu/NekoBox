import { clearSessionState, Store } from "./store";
import { AccountService } from "../services/account.service";
import { sameId } from "../utils/format";

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

  async adicionarAoCarrinho(game, forGift = false) {
    const cart = await AccountService.addToCart(game.id, forGift);
    Store.setState((state) => ({ ...state, cart }));
  },

  async atualizarQuantidadeCarrinho(gameId, quantity) {
    const cart = await AccountService.updateCartItemQuantity(gameId, quantity);
    Store.setState((state) => ({ ...state, cart }));
  },

  async adquirirLicencaGratuita(game) {
    const acquiredGame = await AccountService.acquireFreeLicense(game.id);
    const { wishlist } = Store.getState();
    const wasWishlisted = wishlist.some((item) => sameId(item.id, acquiredGame.id));
    if (wasWishlisted) {
      await AccountService.removeFromWishlist(acquiredGame.id);
    }
    Store.setState((state) => ({
      ...state,
      library: state.library.some((item) => sameId(item.id, acquiredGame.id))
        ? state.library
        : [...state.library, acquiredGame],
      wishlist: wasWishlisted
        ? state.wishlist.filter((item) => String(item.id) !== String(acquiredGame.id))
        : state.wishlist,
    }));
  },

  async removerDoCarrinho(gameId) {
    const cart = await AccountService.removeFromCart(gameId);
    Store.setState((state) => ({ ...state, cart }));
  },

  async alternarListaDesejos(game) {
    const { wishlist, library } = Store.getState();
    const existe = wishlist.some((item) => sameId(item.id, game.id));
    const jaAdquirido = library.some((item) => sameId(item.id, game.id));
    if (!existe && jaAdquirido) return;
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
    const { wishlist } = Store.getState();
    const itensAdquiridos = wishlist.filter((item) => library.some((g) => sameId(g.id, item.id)));
    if (itensAdquiridos.length) {
      await Promise.all(itensAdquiridos.map((item) => AccountService.removeFromWishlist(item.id)));
    }
    Store.setState((state) => ({
      ...state,
      library,
      cart: [],
      wishlist: itensAdquiridos.length
        ? state.wishlist.filter((item) => !itensAdquiridos.some((p) => sameId(p.id, item.id)))
        : state.wishlist,
    }));
    return { payments };
  },

  async atualizarDadosPerfil(username, bio, avatarUrl) {
    const user = await AccountService.updateProfile(username, bio, avatarUrl);
    Store.setState((state) => ({ ...state, user }));
  },
};
