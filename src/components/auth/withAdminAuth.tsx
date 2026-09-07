"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const withAdminAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AdminAuthComponent = (props: P) => {
    const { isAuthenticated, isLoading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.replace("/");
        } else if (!isAdmin) {
          router.replace("/dashboard");
        }
      }
    }, [isLoading, isAuthenticated, isAdmin, router]);

    if (isLoading || !isAuthenticated || !isAdmin) {
      return (
        <div className="w-screen h-screen bg-white text-center flex items-center justify-center text-3xl text-black">
          Loading...
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
  return AdminAuthComponent;
};

export default withAdminAuth;
