import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../assets/logo_full_long_clear.png";
import ThemeToggle from "./ThemeToggle";
import { LogoutButton, UserInfo } from "./providers/authGuard";
import { authManager } from "../utils/auth";

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await authManager.getValidToken();
      if (token) {
        setIsLoggedIn(true);
        const adminStatus = await authManager.isAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <header className="fixed bg-black w-full z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/">
          <Image
            src={logo}
            alt="donghyun.cc"
            height={32}
            style={{ height: "auto" }}
          />
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/article_list" className="text-white hover:text-gray-300">
            게시물
          </Link>
          
          {/* 로그인 상태에 따른 조건부 렌더링 */}
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-blue-400 hover:text-blue-300">
                  관리자
                </Link>
              )}
              {isAdminPage && (
                <div className="flex items-center space-x-3">
                  <UserInfo className="text-white" />
                  <LogoutButton className="text-xs px-3 py-1" />
                </div>
              )}
              {!isAdminPage && isAdmin && (
                <button
                  onClick={() => authManager.logout()}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  로그아웃
                </button>
              )}
            </>
          ) : (
            <Link href="/login" className="text-green-400 hover:text-green-300">
              로그인
            </Link>
          )}
          
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
