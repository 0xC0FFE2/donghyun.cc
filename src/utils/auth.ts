// JWT 토큰 관련 유틸리티

interface LoginRequest {
  id: string;
  password: string;
  pin?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

class AuthManager {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly API_BASE_URL = 'https://api.donghyun.cc';

  // 토큰을 로컬 스토리지에 저장
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // 액세스 토큰 가져오기
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  // 리프레시 토큰 가져오기
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  // 토큰 삭제 (로그아웃)
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  // JWT 토큰 디코딩 (페이로드만)
  decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload as TokenPayload;
    } catch (error) {
      console.error('Token decode failed:', error);
      return null;
    }
  }

  // 토큰 유효성 검사 (만료 시간 체크)
  isTokenValid(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return false;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  // 로그인
  async login(loginData: LoginRequest): Promise<TokenResponse> {
    const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const tokens = await response.json();
    this.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  }

  // 유효한 토큰 가져오기 (자동 갱신 포함)
  async getValidToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    
    // 액세스 토큰이 있고 유효한 경우
    if (accessToken && this.isTokenValid(accessToken)) {
      return accessToken;
    }

    // 액세스 토큰이 만료된 경우 리프레시 토큰으로 갱신 시도
    const refreshToken = this.getRefreshToken();
    if (refreshToken && this.isTokenValid(refreshToken)) {
      try {
        // 실제 프로덕션에서는 리프레시 토큰으로 새로운 액세스 토큰을 받아오는 API가 필요
        // 현재는 리프레시 토큰을 액세스 토큰으로 사용
        this.setTokens(refreshToken, refreshToken);
        return refreshToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearTokens();
        return null;
      }
    }

    // 모든 토큰이 만료된 경우
    this.clearTokens();
    return null;
  }

  // 사용자가 관리자인지 확인
  async isAdmin(): Promise<boolean> {
    const token = await this.getValidToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    return payload?.role === 'admin';
  }

  // 로그아웃
  logout(): void {
    this.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // 현재 사용자 정보 가져오기
  getCurrentUser(): TokenPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;
    return this.decodeToken(token);
  }
}

export const authManager = new AuthManager();
export type { LoginRequest, TokenResponse, TokenPayload };

// 기존 auth.ts와의 호환성을 위한 함수
export async function getValidToken(): Promise<string | null> {
  return authManager.getValidToken();
}
