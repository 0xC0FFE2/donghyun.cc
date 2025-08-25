"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authManager } from "../../utils/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function ConditionalAuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isProtectedRoute = router.pathname?.startsWith("/admin");

  useEffect(() => {
    const checkAuth = async () => {
      // 보호된 라우트가 아닌 경우 인증 검사 건너뛰기
      if (!isProtectedRoute) {
        setIsLoading(false);
        setIsAuthenticated(true);
        return;
      }

      try {
        // 유효한 토큰이 있는지 확인
        const token = await authManager.getValidToken();
        
        if (!token) {
          // 토큰이 없으면 로그인 페이지로 리디렉션
          const currentUrl = encodeURIComponent(router.asPath);
          router.push(`/login?redirect=${currentUrl}`);
          return;
        }

        // 관리자 권한이 있는지 확인
        const isAdmin = await authManager.isAdmin();
        if (!isAdmin) {
          // 관리자가 아니면 홈페이지로 리디렉션
          router.push("/");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        // 에러 발생시 로그인 페이지로 리디렉션
        const currentUrl = encodeURIComponent(router.asPath);
        router.push(`/login?redirect=${currentUrl}`);
      } finally {
        setIsLoading(false);
      }
    };

    // 클라이언트에서만 실행
    if (typeof window !== "undefined") {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [router.pathname, isProtectedRoute, router]);

  // 로딩 중이고 보호된 라우트인 경우 로딩 화면 표시
  if (isLoading && isProtectedRoute) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 보호된 라우트이지만 인증되지 않은 경우 아무것도 렌더링하지 않음
  if (isProtectedRoute && !isAuthenticated && !isLoading) {
    return null;
  }

  return <>{children}</>;
}

// 로그아웃 버튼 컴포넌트
export function LogoutButton({ className = "" }: { className?: string }) {
  const handleLogout = () => {
    if (confirm("로그아웃하시겠습니까?")) {
      authManager.logout();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${className}`}
    >
      로그아웃
    </button>
  );
}

// 현재 사용자 정보를 표시하는 컴포넌트
export function UserInfo({ className = "" }: { className?: string }) {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const user = authManager.getCurrentUser();
    setUserInfo(user);
  }, []);

  if (!userInfo) return null;

  return (
    <div className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      <span className="font-medium">{userInfo.sub}</span>
      <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
        {userInfo.role}
      </span>
    </div>
  );
}
