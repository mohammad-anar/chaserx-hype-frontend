import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface IUser {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    profileImg?: string;
    avatar?: string;
    phone?: string;
    address?: string;
    isVerified?: boolean;
    status?: string;
    [key: string]: any;
}

type AuthState = {
    accessToken: string | null;
    refreshToken: string | null;
    user: IUser | null;
};

const initialState: AuthState = {
    accessToken: null,
    refreshToken: null,
    user: null,
};

const setAuthCookies = (accessToken: string, role?: string | null) => {
    if (typeof document !== "undefined") {
        document.cookie = `accessToken=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
        if (role) {
            document.cookie = `userRole=${role}; path=/; max-age=604800; SameSite=Lax`;
        }
    }
};

const removeAuthCookies = () => {
    if (typeof document !== "undefined") {
        document.cookie = "accessToken=; path=/; max-age=0";
        document.cookie = "userRole=; path=/; max-age=0";
    }
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                accessToken: string;
                refreshToken?: string | null;
                user?: IUser | null;
            }>
        ) => {
            state.accessToken = action.payload.accessToken;
            if (action.payload.refreshToken !== undefined) {
                state.refreshToken = action.payload.refreshToken;
            }
            if (action.payload.user !== undefined) {
                state.user = action.payload.user;
            }
            setAuthCookies(action.payload.accessToken, action.payload.user?.role);
        },
        setTokens: (
            state,
            action: PayloadAction<{
                accessToken: string;
                refreshToken?: string | null;
            }>
        ) => {
            state.accessToken = action.payload.accessToken;
            if (action.payload.refreshToken !== undefined) {
                state.refreshToken = action.payload.refreshToken;
            }
            if (typeof document !== "undefined") {
                document.cookie = `accessToken=${action.payload.accessToken}; path=/; max-age=604800; SameSite=Lax`;
            }
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            if (typeof document !== "undefined") {
                document.cookie = `accessToken=${action.payload}; path=/; max-age=604800; SameSite=Lax`;
            }
        },
        setUser: (state, action: PayloadAction<IUser | null>) => {
            state.user = action.payload;
            if (typeof document !== "undefined" && action.payload?.role) {
                document.cookie = `userRole=${action.payload.role}; path=/; max-age=604800; SameSite=Lax`;
            }
        },
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            removeAuthCookies();
        },
    },
});

export const { setCredentials, setTokens, setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectUser = (state: RootState) => state.auth.user;
export const selectRole = (state: RootState) => state.auth.user?.role || null;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.accessToken;

