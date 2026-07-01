// A centralized, event-driven toast utility that operates outside the React component tree
let listeners = new Set();

export const toast = {
  success: (message) => notify('success', message),
  error: (message) => notify('error', message),
  info: (message) => notify('info', message),
  
  subscribe: (callback) => {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  }
};

const notify = (type, message) => {
  listeners.forEach(callback => callback(type, message));
};
