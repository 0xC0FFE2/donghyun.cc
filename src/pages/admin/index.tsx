"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { OAuthSDK } from "nanuid-websdk";
import { getValidToken } from "@/utils/auth";

interface Article {
  article_id: number;
  article_name: string;
  article_date: string;
  thumbnail_url: string;
  article_data_url: string;
  article_view_mode: "PUBLIC" | "PRIVATE";
  categorys: Array<{
    category_id: number;
    category_name: string;
  }>;
}

interface ArticleResponse {
  articles: Article[];
  totalPage: number;
}

export default function AdminArticleManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const router = useRouter();

  const verifyAndFetchArticles = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token) {
        toast.error("세션이 만료되었습니다. 다시 로그인해 주세요.");
        OAuthSDK.logout("/");
        return;
      }
      await fetchArticles(token);
    } catch (error) {
      toast.error("기사를 가져오는 중 오류가 발생했습니다.");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        OAuthSDK.logout("/");
      }
    }
  }, [router]);

  const fetchArticles = useCallback(
    async (token: string) => {
      try {
        const client = await OAuthSDK.createAuthorizedClient(token);
        const response = await client.get<ArticleResponse>(
          `${API_BASE_URL}/admin/articles`,
          {
            params: { page: currentPage, size: 8 },
          }
        );
        setArticles(response.data.articles);
        setTotalPages(response.data.totalPage);
      } catch (error) {
        console.error("기사 가져오기 오류:", error);
        throw error;
      }
    },
    [currentPage]
  );

  useEffect(() => {
    verifyAndFetchArticles();
  }, [verifyAndFetchArticles]);

  const handleUpdate = async () => {
    if (!selectedArticle) return;

    try {
      const token = await getValidToken();
      if (!token) {
        OAuthSDK.logout("/");
        return;
      }

      const client = await OAuthSDK.createAuthorizedClient(token);
      await client.put(
        `${API_BASE_URL}/admin/articles/${selectedArticle.article_id}`,
        {
          article_name: selectedArticle.article_name,
          thumbnail_url: selectedArticle.thumbnail_url,
          article_data_url: selectedArticle.article_data_url,
          article_view_mode: selectedArticle.article_view_mode,
          categories: selectedArticle.categorys.map((cat) => cat.category_id),
        }
      );

      toast.success("정상적으로 수정을 완료했어요!");
      setSelectedArticle(null);
      fetchArticles(token);
    } catch (error) {
      toast.error("오류가 발생했어요");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        //  OAuthSDK.logout("/");
      }
    }
  };

  const handleDelete = async (articleId: number) => {
    if (
      !window.confirm(
        "정말로 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다!"
      )
    ) {
      return;
    }

    try {
      const token = await getValidToken();
      if (!token) {
        //OAuthSDK.logout("/");
        return;
      }

      const client = await OAuthSDK.createAuthorizedClient(token);
      await client.delete(`${API_BASE_URL}/admin/articles/${articleId}`);

      toast.success("정상적으로 삭제를 완료했어요!");
      fetchArticles(token);
    } catch (error) {
      toast.error("오류가 발생했어요");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // OAuthSDK.logout("/");
      }
    }
  };
  if (!articles.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">게시글 관리</h1>
      <button
        onClick={() => router.push("/admin/editor")}
        className="mb-4 inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-4 transition-colors"
      >
        새 게시글 작성하기
      </button>

      <button
        onClick={() => router.push("/admin/uploader")}
        className="mb-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
      >
        파일 업로더
      </button>

      {selectedArticle && (
        <div className="bg-gray-100 p-4 mb-4 rounded">
          <h2 className="text-xl font-bold mb-2">게시글 수정하기</h2>
          <input
            className="w-full p-2 mb-2 border rounded"
            value={selectedArticle.article_name}
            onChange={(e) =>
              setSelectedArticle({
                ...selectedArticle,
                article_name: e.target.value,
              })
            }
            placeholder="Article Name"
          />
          <input
            className="w-full p-2 mb-2 border rounded"
            value={selectedArticle.thumbnail_url}
            onChange={(e) =>
              setSelectedArticle({
                ...selectedArticle,
                thumbnail_url: e.target.value,
              })
            }
            placeholder="Thumbnail URL"
          />
          <input
            className="w-full p-2 mb-2 border rounded"
            value={selectedArticle.article_data_url}
            onChange={(e) =>
              setSelectedArticle({
                ...selectedArticle,
                article_data_url: e.target.value,
              })
            }
            placeholder="Article Data URL"
          />
          <select
            className="w-full p-2 mb-2 border rounded"
            value={selectedArticle.article_view_mode}
            onChange={(e) =>
              setSelectedArticle({
                ...selectedArticle,
                article_view_mode: e.target.value as "PUBLIC" | "PRIVATE",
              })
            }
          >
            <option value="PUBLIC">공개</option>
            <option value="PRIVATE">비공개</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              업데이트하기
            </button>
            <button
              onClick={() => setSelectedArticle(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {articles.map((article) => (
          <div
            key={article.article_id}
            className="bg-gray-50 rounded-xl px-8 pt-6 pb-8"
          >
            <h2 className="text-xl font-bold mb-2">{article.article_name}</h2>
            <p>
              최초 게시 일자: {new Date(article.article_date).toLocaleString()}
            </p>
            <p>현재 공개 여부: {article.article_view_mode}</p>
            <p>
              카테고리:{" "}
              {article.categorys.map((cat) => cat.category_name).join(", ")}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setSelectedArticle(article)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                정보 수정하기
              </button>
              <button
                onClick={() => handleDelete(article.article_id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`mx-1 px-3 py-1 rounded transition-colors ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
