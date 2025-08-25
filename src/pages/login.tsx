"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { authManager } from "../utils/auth";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    pin: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginData = {
        id: formData.id,
        password: formData.password,
        ...(formData.pin && { pin: formData.pin }), // PIN이 있을 때만 포함
      };

      await authManager.login(loginData);
      
      toast.success("로그인 성공!");
      
      // 관리자 페이지로 리디렉션
      const redirectTo = router.query.redirect as string || "/admin";
      router.push(redirectTo);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            관리자 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            관리자 계정으로 로그인하세요
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                사용자 ID
              </label>
              <input
                id="id"
                name="id"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="사용자 ID를 입력하세요"
                value={formData.id}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                PIN 번호 (선택사항)
              </label>
              <input
                id="pin"
                name="pin"
                type="text"
                className="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="PIN 번호를 입력하세요 (선택사항)"
                value={formData.pin}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="text-indigo-600 hover:text-indigo-500 text-sm"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
