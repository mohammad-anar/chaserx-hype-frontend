"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated, selectAccessToken, selectRole } from "@/redux/features/auth/authSlice";

import GlobalLoader from "@/components/GlobalLoader";

interface NonAuthenticatedGuardProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const NonAuthenticatedGuard = ({ children, redirectTo }: NonAuthenticatedGuardProps) => {
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const accessToken = useAppSelector(selectAccessToken);
    const role = useAppSelector(selectRole);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Use a flag to track if component is mounted
        let isMounted = true;

        const checkAuth = () => {
            if (isAuthenticated && accessToken) {
                if (role?.toUpperCase() === "ADMIN") {
                    router.push(redirectTo || "/admin");
                } else {
                    router.push("/");
                }
            } else if (isMounted) {
                setIsChecking(false);
            }
        };

        const timer = setTimeout(checkAuth, 0);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [isAuthenticated, accessToken, role, router, redirectTo]);

    if (isChecking) {
        return <GlobalLoader />;
    }

    if (!isAuthenticated || !accessToken) {
        return <>{children}</>;
    }

    return null;
};

export default NonAuthenticatedGuard;
