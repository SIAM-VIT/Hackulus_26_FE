const isBrowser = typeof window !== "undefined";

export const getToken = (): string | null => {
  return isBrowser ? localStorage.getItem("authToken") : null;
};

export const setToken = (token: string): void => {
  if (isBrowser) {
    localStorage.setItem("authToken", token);
  }
};

export const removeToken = (): void => {
  if (isBrowser) {
    localStorage.removeItem("authToken");
  }
};
