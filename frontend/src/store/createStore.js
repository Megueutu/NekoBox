export function createStore(initialState) {
  let state = initialState;
  const listeners = [];

  const getState = () => state;

  const setState = (updater) => {
    state = typeof updater === "function" ? updater(state) : updater;
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index >= 0) listeners.splice(index, 1);
    };
  };

  return { getState, setState, subscribe };
}
