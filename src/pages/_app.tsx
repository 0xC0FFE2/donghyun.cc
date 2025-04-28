import "@/styles/globals.css";
import "@/styles/editor.css"; // 에디터 커스텀 스타일
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { ConditionalAuthGuard } from "@/components/providers/authGuard";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GlobalLoading from "@/components/GlobalLoading";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const defaultTitle = "이동현의 개발 블로그 - DONGHYUN.CC";

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url.startsWith("/article/")) {
        setIsLoading(true);
      }
    };
    const handleComplete = () => setIsLoading(false);
    const handleError = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleError);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleError);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>{pageProps.title || defaultTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout>
        <GlobalLoading isLoading={isLoading} />
        <ConditionalAuthGuard>
          <Component {...pageProps} />
        </ConditionalAuthGuard>
      </Layout>
    </>
  );
}
