// 다크 모드 저장 및 불러오기 함수
export const saveThemePreference = (isDark: boolean) => {
  try {
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
  } catch (error) {
    console.error('localStorage에 테마 저장 실패:', error);
  }
};

export const loadThemePreference = (): boolean => {
  try {
    const savedTheme = localStorage.getItem('darkMode');
    // 저장된 테마 설정이 없으면 기본값으로 다크 모드(true) 반환
    if (savedTheme === null) {
      return true;
    }
    return savedTheme === 'true';
  } catch (error) {
    console.error('localStorage에서 테마 불러오기 실패:', error);
    return true; // 오류 시에도 기본값으로 다크 모드 반환
  }
};