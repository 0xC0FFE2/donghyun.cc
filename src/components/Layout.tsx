import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { loadThemePreference } from "@/utils/theme";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    // 컴포넌트 마운트 시 저장된 테마 설정 적용
    const savedDarkMode = loadThemePreference();
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
