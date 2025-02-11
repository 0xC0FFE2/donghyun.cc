import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';
import { ConditionalAuthGuard } from "@/components/providers/authGuard";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <ConditionalAuthGuard>
        <Component {...pageProps} />
      </ConditionalAuthGuard>
    </Layout>
  );
}