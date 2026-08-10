import { createStore } from "./create-store";

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

const hasActiveSession = Boolean(localStorage.getItem("access_token"));

if (!hasActiveSession) {
  localStorage.removeItem(STATE_PERSIST_KEY);
}

export const Store = createStore(hasActiveSession ? loadPersistedState() || defaultState : defaultState);

export function clearSessionState() {
  Store.setState(() => ({
    user: null,
    cart: [],
    wishlist: [],
    library: [],
    loading: false,
  }));
}

Store.subscribe((state) => {
  localStorage.setItem(STATE_PERSIST_KEY, JSON.stringify(state));
});
