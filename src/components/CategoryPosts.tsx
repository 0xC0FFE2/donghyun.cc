import React, { useState, useRef, useEffect } from "react";
import PostCard from "./PostCard";
import LoadingSpinner from "./LoadingIcon";
import { API_BASE_URL } from "@/config";
import LoadingFailSpinner from "./ErrorIcon";
import { Article } from "@/types/Article";

interface CategoryPostsProps {
  size: number;
  mode: "FULL" | "SIMPLE";
}

const DEFAULT_CATEGORIES = [
  "전체",
  "소프트웨어 개발 개념",
  "백엔드",
  "AWS",
  "CI/CD",
];

const CategoryPosts: React.FC<CategoryPostsProps> = ({ size, mode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [posts, setPosts] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "FULL") {
      fetchCategories();
    }
    fetchPosts();
  }, [selectedCategory, currentPage, mode]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error("카테고리를 불러오는 데 실패했습니다.");
      const data = await response.json();
      setCategories([
        "전체",
        ...data.map(
          (category: { category_name: string }) => category.category_name
        ),
      ]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const url =
        selectedCategory === "전체"
          ? `${API_BASE_URL}/articles?page=${currentPage}&size=${size}`
          : `${API_BASE_URL}/search/categories/${selectedCategory}?page=${currentPage}&size=${size}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("게시물을 불러오는 데 실패했습니다.");
      const data = await response.json();

      setPosts(data.articles || []);
      setTotalPages(data.totalPage || 1);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory !== "전체" && categoryRef.current) {
      const selectedButton = categoryRef.current.querySelector(
        `[data-category="${selectedCategory}"]`
      );
      selectedButton?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mt-6 mb-6">카테고리별 게시물</h2>

      {/* 카테고리 선택 바 */}
      <div className="relative mb-6">
        <div
          ref={categoryRef}
          className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {categories.map((category) => (
            <button
              key={category}
              data-category={category}
              onClick={() => handleCategoryChange(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <LoadingFailSpinner message={error} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.article_id}
                id={post.article_id}
                title={post.article_name}
                date={new Date(post.article_date).toLocaleDateString("ko-KR", {
                  year: "2-digit",
                  month: "2-digit",
                  day: "2-digit",
                })}
                category={
                  Array.isArray(post.categories)
                    ? post.categories.map((cat) =>
                        typeof cat === "string" ? cat : cat.category_name
                      )
                    : []
                }
                image={
                  post.thumbnail_url || "https://nanu.cc/NANU-Brand-Loader.jpg"
                }
              />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              게시물이 없습니다.
            </p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 mb-8 ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPosts;
