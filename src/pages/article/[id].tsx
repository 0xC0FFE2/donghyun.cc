import { GetStaticProps, GetStaticPaths, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MDViewer from "@/components/MDViewer";
import RecentPosts from "@/components/RecentPosts";
import { API_BASE_URL } from "@/config";
import { Article } from "@/types/Article";
import { getSiteMetadata } from "@/utils/metadata";

interface ArticleViewPageProps {
  article: Article | null;
  content: string | null;
  error?: string;
}

const ArticleViewPage: NextPage<ArticleViewPageProps> = ({
  article,
  content,
  error,
}) => {
  const siteMetadata = getSiteMetadata();

  if (error) {
    return (
      <>
        <Head>
          <title>오류 발생 | {siteMetadata.title}</title>
          <meta name="description" content="페이지를 찾을 수 없습니다." />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="container mx-auto px-4 py-12 pt-20">
          <div className="text-red-600 text-center mb-8">{error}</div>
          <ToastContainer />
        </div>
      </>
    );
  }

  if (!article) return null;

  const formattedDate = new Date(article.article_date).toLocaleDateString(
    "ko-KR"
  );
  const metaDescription = article.article_name.substring(0, 155);
  const canonicalUrl = `${siteMetadata.siteUrl}/articles/${article.article_id}`;
  const articleData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.article_name,
    description: metaDescription,
    datePublished: article.article_date,
    dateModified: article.article_date,
    image:
      article.thumbnail_url || `${siteMetadata.siteUrl}/default-thumbnail.jpg`,
    author: {
      "@type": "Person",
      name: siteMetadata.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteMetadata.title,
      logo: {
        "@type": "ImageObject",
        url: `${siteMetadata.siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <>
      <Head>
        <title>{`${article.article_name} | ${siteMetadata.title}`}</title>
        <meta name="description" content={metaDescription} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.article_name} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {article.thumbnail_url && (
          <meta property="og:image" content={article.thumbnail_url} />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.article_name} />
        <meta name="twitter:description" content={metaDescription} />
        {article.thumbnail_url && (
          <meta name="twitter:image" content={article.thumbnail_url} />
        )}

        <meta
          property="article:published_time"
          content={article.article_date}
        />
        {article.categories?.map((category, index) => (
          <meta
            key={`meta-category-${index}`}
            property="article:tag"
            content={typeof category === "string" ? category : category.category_name || ""}
          />
        ))}

        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
        />
      </Head>

      <div className="container mx-auto px-4 py-12 pt-20">
        <article className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{article.article_name}</h1>

            <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300">
              <time dateTime={article.article_date}>{formattedDate}</time>
              {article.categories?.length > 0 ? (
                <div className="flex gap-2">
                  {article.categories.map((category, index) => (
                    <span
                      key={`category-${index}`}
                      className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200"
                    >
                      {typeof category === "string"
                        ? category
                        : category.category_name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">카테고리가 없습니다.</span>
              )}
            </div>
          </header>

          {article.thumbnail_url && (
            <figure className="relative w-full h-96 mb-8">
              <Image
                src={article.thumbnail_url}
                alt={article.article_name}
                fill
                className="object-cover rounded-lg"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </figure>
          )}

          <div className="prose prose-lg max-w-none">
            <MDViewer content={content || ""} />
          </div>
        </article>

        <aside className="mt-16">
          <RecentPosts size={4} />
        </aside>
      </div>
      <ToastContainer />
    </>
  );
};

export default ArticleViewPage;

// getStaticPaths - 빌드 시 미리 생성할 페이지 경로 정의
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles`);
    
    if (!response.ok) {
      return {
        paths: [],
        fallback: 'blocking'
      };
    }
    
    const data = await response.json();
    const articles = data.articles || [];
    
    if (!Array.isArray(articles)) {
      console.error("API response is not in the expected format:", data);
      return {
        paths: [],
        fallback: 'blocking'
      };
    }
    
    const paths = articles.map((article: Article) => ({
      params: { id: article.article_id.toString() }
    }));
    
    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error("Failed to generate article paths:", error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const articleResponse = await fetch(`${API_BASE_URL}/articles/${id}`);
    
    if (!articleResponse.ok) {
      return {
        props: {
          article: null,
          content: null,
          error: "게시물을 찾을 수 없습니다.",
        },
        revalidate: 600
      };
    }

    const article: Article = await articleResponse.json();
    
    const contentResponse = await fetch(article.article_data_url);
    const content = contentResponse.ok ? await contentResponse.text() : null;

    return {
      props: {
        article,
        content,
      },
      revalidate: 31536000
    };
  } catch (error) {
    console.error("Article fetch error:", error);
    return {
      props: {
        article: null,
        content: null,
        error: "서버 오류가 발생했습니다.",
      },
      revalidate: 604800
    };
  }
};