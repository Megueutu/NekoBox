import { Store } from "./store";

export const Actions = {
  setUser(user) {
    Store.setState((state) => ({ ...state, user }));
    window.dispatchEvent(new CustomEvent("rerender"));
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

  adicionarAoCarrinho(game) {
    Store.setState((state) => {
      if (state.cart.some((item) => item.id === game.id)) return state;
      return { ...state, cart: [...state.cart, game] };
    });
    window.dispatchEvent(new CustomEvent("rerender"));
  },

  removerDoCarrinho(gameId) {
    Store.setState((state) => ({
      ...state,
      cart: state.cart.filter((item) => item.id !== gameId),
    }));
    window.dispatchEvent(new CustomEvent("rerender"));
  },

  alternarListaDesejos(game) {
    Store.setState((state) => {
      const existe = state.wishlist.some((item) => item.id === game.id);
      const novaLista = existe
        ? state.wishlist.filter((item) => item.id !== game.id)
        : [...state.wishlist, game];
      return { ...state, wishlist: novaLista };
    });
    window.dispatchEvent(new CustomEvent("rerender"));
  },

  finalizarCheckoutCarrinho() {
    Store.setState((state) => {
      // Evita duplicatas na biblioteca (compra de algo já adquirido)
      const novosItens = state.cart.filter(
        (cartItem) => !state.library.some((libItem) => libItem.id === cartItem.id)
      );
      return {
        ...state,
        library: [...state.library, ...novosItens],
        cart: [],
      };
    });
    window.dispatchEvent(new CustomEvent("rerender"));
  },

  atualizarDadosPerfil(username, bio, avatarUrl) {
    Store.setState((state) => {
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, username, bio, avatar_url: avatarUrl },
      };
    });
    window.dispatchEvent(new CustomEvent("rerender"));
  },
};
