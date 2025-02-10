import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";
import LoadingSpinner from "./LoadingIcon";
import { API_BASE_URL } from "@/config";
import LoadingFailSpinner from "./ErrorIcon";
import { Article } from "@/types/Article";

interface RecentPostsProps {
  size: number;
}

const RecentPosts: React.FC<RecentPostsProps> = ({ size }) => {
  const [recents, setRecents] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentPosts();
  }, [size]);

  const fetchRecentPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/articles?size=${size}&page=1`
      );
      if (!response.ok) throw new Error("Failed to fetch recent posts");

      const data = await response.json();
      setRecents(data.articles || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return <LoadingFailSpinner message="서버 통신 문제가 발생했어요" />;

  return (
    <div>
      <h2 className="text-2xl font-bold mt-6 mb-6">최근 게시물</h2>
      {recents.length === 0 ? (
        <p className="text-gray-500">게시물이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recents.map((post) => (
            <PostCard
              key={post.article_id}
              id={post.article_id}
              title={post.article_name}
              date={new Date(post.article_date).toLocaleDateString("ko-KR", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
              })}
              category={post.categorys || []}
              image={
                post.thumbnail_url || "https://nanu.cc/NANU-Brand-Loader.jpg"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentPosts;
