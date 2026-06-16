import { createStore } from "./createStore";

const STATE_PERSIST_KEY = "marketplace_central_state";

const loadPersistedState = () => {
  try {
    const data = localStorage.getItem(STATE_PERSIST_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const defaultState = {
  user: null,
  cart: [],
  wishlist: [],
  library: [],
  loading: false,
};

export const Store = createStore(loadPersistedState() || defaultState);

// Sincroniza automaticamente no localStorage a cada mudança de estado
Store.subscribe((state) => {
  localStorage.setItem(STATE_PERSIST_KEY, JSON.stringify(state));
});
