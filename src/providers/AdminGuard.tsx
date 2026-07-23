"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated, selectAccessToken, selectRole } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";
import GlobalLoader from "@/components/GlobalLoader";

interface AdminGuardProps {
    children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const accessToken = useAppSelector(selectAccessToken);
    const role = useAppSelector(selectRole);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = () => {
            if (!isAuthenticated || !accessToken) {
                router.push("/auth/login");
            } else if (role?.toUpperCase() !== "ADMIN") {
                toast.error("Access denied. Admin privileges required.");
                router.push("/");
            } else if (isMounted) {
                setIsChecking(false);
            }
        };

        const timer = setTimeout(checkAuth, 0);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [isAuthenticated, accessToken, role, router]);

    if (isChecking) {
        return <GlobalLoader />;
    }

    if (isAuthenticated && accessToken && role?.toUpperCase() === "ADMIN") {
        return <>{children}</>;
    }

    return null;
};

export default AdminGuard;
