import { AppUser } from "@/lib/appwrite/types/appwrite";
import { create, StateCreator } from "zustand";

type AuthState = {
    isAuthenticated: boolean;
    user: AppUser | null;
}

type AuthActions = {
    setUser: (state: AuthState["user"]) => void;
}

const authStore: StateCreator<AuthState & AuthActions> = ((set) => ({
    isAuthenticated: false,
    user: null,
    setUser: (user: AuthState["user"]) => set(() => ({
        isAuthenticated: !!user,
        user: user,
    })),
}));


export const useAuthStore = create<AuthState & AuthActions>(authStore);

export default useAuthStore;