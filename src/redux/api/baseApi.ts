import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout, setTokens } from "../features/auth/authSlice";
import { TAG_TYPES_LIST } from "@/constants/api";

let rawBaseURL = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000";
if (rawBaseURL && !rawBaseURL.startsWith("http://") && !rawBaseURL.startsWith("https://")) {
    rawBaseURL = `http://${rawBaseURL}`;
}
const baseURL = rawBaseURL;

const baseQuery = fetchBaseQuery({
    baseUrl: `${baseURL}/api/v1`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;
        const token = state.auth.accessToken;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        const state = api.getState() as RootState;
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
            api.dispatch(logout());
            return result;
        }

        const refreshResult = await baseQuery(
            {
                url: "/auth/refresh-token",
                method: "POST",
                body: { refreshToken },
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            const data = refreshResult.data as any;
            const newAccessToken = data.data?.accessToken || data.accessToken;
            const newRefreshToken = data.data?.refreshToken || data.refreshToken;

            if ((data.success || newAccessToken) && newAccessToken) {
                api.dispatch(
                    setTokens({
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken || refreshToken,
                    })
                );

                // Re-hit original request
                result = await baseQuery(args, api, extraOptions);

                // If again get 401, logout user
                if (result.error?.status === 401) {
                    api.dispatch(logout());
                }
            } else {
                api.dispatch(logout());
            }
        } else {
            api.dispatch(logout());
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: TAG_TYPES_LIST,
    endpoints: () => ({}),
});

