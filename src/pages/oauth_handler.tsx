"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { OAuthSDK } from "nanuid-websdk";

export default function OAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        if (!router.isReady) return;

        const { code } = router.query;

        if (!code || typeof code !== "string") {
          console.error("인증 코드가 없습니다");
          router.push("/");
          return;
        }

        const response = await fetch("https://api.donghyun.cc/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("토큰 요청 실패");
        }

        const { access_token, refresh_token } = await response.json();

        OAuthSDK.setTokens(access_token, refresh_token);
          
        //router.push("/admin");
      } catch (error) {
        console.error("OAuth 처리 중 오류 발생:", error);
      }
    };

    handleOAuth();
  }, [router.isReady, router.query]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">인증 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
