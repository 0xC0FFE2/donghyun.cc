import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { loadThemePreference, saveThemePreference } from '@/utils/theme';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 저장된 테마 설정 불러오기
    const savedDarkMode = loadThemePreference();
    setIsDarkMode(savedDarkMode);
    
    // 초기 테마 적용
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    saveThemePreference(newDarkMode);
    
    // HTML 요소에 다크 모드 클래스 토글
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDarkMode ? (
        <Sun size={20} className="text-gray-300" />
      ) : (
        <Moon size={20} className="text-gray-700" />
      )}
    </button>
  );
};

export default ThemeToggle;