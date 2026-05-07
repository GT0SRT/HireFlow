import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id?: string;
  name?: string;
  email?: string;
}

interface UserStore {
  user: User | null;
  theme: "light" | "dark";

  setUser: (userData: User) => void;
  updateUser: (newData: Partial<User>) => void;
  clearUser: () => void;

  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      theme: "light",

      setUser: (userData) =>
        set({
          user: userData,
        }),

      updateUser: (newData) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...newData }
            : null,
        })),

      clearUser: () =>
        set({
          user: null,
        }),

      setTheme: (theme) =>
        set({
          theme,
        }),

      toggleTheme: () =>
        set((state) => ({
          theme:
            state.theme === "light"
              ? "dark"
              : "light",
        })),
    }),
    {
      name: "user-storage",
    }
  )
);