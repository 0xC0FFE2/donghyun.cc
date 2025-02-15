import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';
import { ConditionalAuthGuard } from "@/components/providers/authGuard";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import GlobalLoading from '@/components/GlobalLoading';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url.startsWith('/article/')) {
        setIsLoading(true);
      }
    };
    const handleComplete = () => setIsLoading(false);
    const handleError = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  return (
    <Layout>
      <GlobalLoading isLoading={isLoading} />
      <ConditionalAuthGuard>
        <Component {...pageProps} />
      </ConditionalAuthGuard>
    </Layout>
  );
}