import { baseApi } from "../../api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Login
        login: builder.mutation({
            query: (userInfo) => ({
                url: "/auth/login",
                method: "POST",
                body: userInfo,
            }),
            invalidatesTags: [TAG_TYPES.AUTH, TAG_TYPES.USER, TAG_TYPES.USER_PROFILE],
        }),

        // Register / Create User
        register: builder.mutation({
            query: (data) => ({
                url: "/user/create-user",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.USER],
        }),

        // Verify Email
        verifyEmail: builder.mutation({
            query: (data) => ({
                url: "/auth/verify-email",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.AUTH],
        }),

        // Resend OTP
        resendOtp: builder.mutation({
            query: (data) => ({
                url: "/auth/resend-otp",
                method: "POST",
                body: data,
            }),
        }),

        // Forgot Password
        forgotPassword: builder.mutation({
            query: (data) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body: data,
            }),
        }),

        // Verify OTP (for password reset)
        verifyOtp: builder.mutation({
            query: (data) => ({
                url: "/auth/verify-otp",
                method: "POST",
                body: data,
            }),
        }),

        // Reset Password
        resetPassword: builder.mutation({
            query: (data) => ({
                url: "/auth/reset-password",
                method: "POST",
                body: data,
            }),
        }),

        // Change Password
        changePassword: builder.mutation({
            query: (data) => ({
                url: "/auth/change-password",
                method: "POST",
                body: data,
            }),
        }),

        // Refresh Token
        refreshToken: builder.mutation({
            query: (data) => ({
                url: "/auth/refresh-token",
                method: "POST",
                body: data,
            }),
        }),

        // Get My Profile
        getProfile: builder.query({
            query: () => ({
                url: "/user/my-profile",
                method: "GET",
            }),
            providesTags: [TAG_TYPES.USER_PROFILE, TAG_TYPES.USER],
        }),

        // Update Profile
        updateProfile: builder.mutation({
            query: (data) => ({
                url: "/user/update-profile",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.USER_PROFILE, TAG_TYPES.USER],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyEmailMutation,
    useResendOtpMutation,
    useForgotPasswordMutation,
    useVerifyOtpMutation,
    useResetPasswordMutation,
    useChangePasswordMutation,
    useRefreshTokenMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
} = authApi;
