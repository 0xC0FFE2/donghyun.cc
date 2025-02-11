"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { OAuthSDK } from "nanuid-websdk";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function ConditionalAuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const isProtectedRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    const redirectToLogin = () => {
      const redirectUrl = "https://id.nanu.cc/oauth?app_name=%22%EB%8F%99%ED%98%84%20%EA%B8%B0%EC%88%A0%20%EB%B8%94%EB%A1%9C%EA%B7%B8%22&auth_scope=2&redirect_uri=%22https://donghyun.cc/oauth_handler%22&app_id=7040dad6-b0ed-4b83-ab13-35535e39822e";
      window.location.href = redirectUrl.toString();
    };

    const checkAuth = async () => {
      if (typeof window === "undefined" || !isProtectedRoute) {
        setIsLoading(false);
        return;
      }

      try {
        const currentToken = OAuthSDK.getToken();
        const refreshToken = OAuthSDK.getRefreshToken();

        if (!currentToken && !refreshToken) {
          redirectToLogin();
          return;
        }

        if (currentToken) {
          const validation = OAuthSDK.validateToken(currentToken);
          if (!validation.isValid) {
            if (refreshToken) {
              try {
                const newToken = await OAuthSDK.reissueToken(refreshToken);
                if (!newToken) {
                  redirectToLogin();
                  return;
                }
              } catch (error) {
                console.error("Token reissue failed:", error);
                redirectToLogin();
                return;
              }
            } else {
              redirectToLogin();
              return;
            }
          }
        } 
        // 액세스 토큰이 없지만 리프레시 토큰이 있는 경우
        else if (refreshToken) {
          try {
            const newToken = await OAuthSDK.reissueToken(refreshToken);
            if (!newToken) {
              redirectToLogin();
              return;
            }
          } catch (error) {
            console.error("Token reissue failed:", error);
            redirectToLogin();
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        redirectToLogin();
      }
    };

    checkAuth();
  }, [pathname, isProtectedRoute]);

  if (isLoading && isProtectedRoute) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <>{children}</>;
}