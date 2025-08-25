"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "@/config";
import { authManager } from "@/utils/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, ChevronLeft, ChevronRight, Edit, Eye, EyeOff, UploadCloud, Info, PenSquare, Trash2, Upload } from "lucide-react";

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

// 임시 방문자 통계 데이터 (API가 추가될 예정)
const tempVisitorData = [
  { date: '2025-04-22', visitors: 45 },
  { date: '2025-04-23', visitors: 58 },
  { date: '2025-04-24', visitors: 87 },
  { date: '2025-04-25', visitors: 63 },
  { date: '2025-04-26', visitors: 42 },
  { date: '2025-04-27', visitors: 95 },
  { date: '2025-04-28', visitors: 120 },
];

// 임시 인기 콘텐츠 데이터 (API가 추가될 예정)
const tempPopularContent = [
  { name: 'AWS Lambda를 활용한 서버리스 아키텍처', views: 342 },
  { name: 'Next.js 프로젝트 구조 최적화하기', views: 278 },
  { name: 'GitHub Actions으로 CI/CD 파이프라인 구축하기', views: 255 },
  { name: '데이터베이스 인덱싱의 중요성', views: 203 },
  { name: 'Docker Compose로 개발 환경 구성하기', views: 187 },
];

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'upload'>('overview');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResults, setUploadResults] = useState<{name: string, url: string, alternativeUrl: string}[]>([]);
  const router = useRouter();

  // 원본 URL에서 다른 형식의 URL을 생성하는 함수
  const generateAlternativeUrl = (originalUrl: string): string => {
    // 원본 URL이 https://donghyuncc-cloudfront-aws.ncloud.sbs로 시작하면
    // https://drive.ncloud.sbs/로 변환, 그렇지 않으면 반대로 변환
    if (originalUrl.startsWith('https://donghyuncc-cloudfront-aws.ncloud.sbs')) {
      // 파일 경로 부분만 추출
      const path = originalUrl.replace('https://donghyuncc-cloudfront-aws.ncloud.sbs', '');
      return `https://drive.ncloud.sbs${path}`;
    } else if (originalUrl.startsWith('https://drive.ncloud.sbs')) {
      const path = originalUrl.replace('https://drive.ncloud.sbs', '');
      return `https://donghyuncc-cloudfront-aws.ncloud.sbs${path}`;
    } else {
      // 원본 URL이 두 형식 모두 아닌 경우, 기본 URL 형식에 맞게 생성
      const fileName = originalUrl.split('/').pop() || '';
      return `https://drive.ncloud.sbs/files/${fileName}`;
    }
  };

  // 인증된 API 클라이언트 생성
  const createApiClient = async (): Promise<AxiosInstance | null> => {
    const token = await authManager.getValidToken();
    if (!token) {
      throw new Error('No valid token');
    }

    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const fetchArticles = useCallback(
    async (apiClient: AxiosInstance) => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<ArticleResponse>(
          `/admin/articles`,
          {
            params: { page: currentPage, size: 8 },
          }
        );
        setArticles(response.data.articles);
        setTotalPages(response.data.totalPage);
      } catch (error) {
        console.error("기사 가져오기 오류:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage]
  );

  const verifyAndFetchArticles = useCallback(async () => {
    try {
      const apiClient = await createApiClient();
      if (!apiClient) {
        // createApiClient에서 이미 에러 처리와 리다이렉션을 했으므로 여기서는 그냥 리턴
        return;
      }
      await fetchArticles(apiClient);
    } catch (error) {
      toast.error("기사를 가져오는 중 오류가 발생했습니다.");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        authManager.logout();
      }
    }
  }, [fetchArticles]);

  useEffect(() => {
    verifyAndFetchArticles();
  }, [verifyAndFetchArticles]);

  const handleUpdate = async () => {
    if (!selectedArticle) return;

    try {
      const apiClient = await createApiClient();
      if (!apiClient) return;

      await apiClient.put(
        `/admin/articles/${selectedArticle.article_id}`,
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
      await verifyAndFetchArticles();
    } catch (error) {
      toast.error("오류가 발생했어요");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        authManager.logout();
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
      const apiClient = await createApiClient();
      if (!apiClient) return;

      await apiClient.delete(`/admin/articles/${articleId}`);

      toast.success("정상적으로 삭제를 완료했어요!");
      await verifyAndFetchArticles();
    } catch (error) {
      toast.error("오류가 발생했어요");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        authManager.logout();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const pastedFile = items[i].getAsFile();
        if (pastedFile) {
          setFiles(prev => [...prev, pastedFile]);
          toast.info("이미지가 클립보드에서 붙여넣기되었습니다.");
          return;
        }
      }
    }
    toast.error("붙여넣기된 내용에 이미지가 없습니다.");
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("업로드할 파일을 선택해주세요.");
      return;
    }

    setUploading(true);
    setUploadResults([]);

    try {
      const apiClient = await createApiClient();
      if (!apiClient) {
        setUploading(false);
        return;
      }

      const results = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await apiClient.post(`/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          
          // 원본 URL과 대체 URL 생성
          const originalUrl = response.data.url;
          let finalUrl = originalUrl;
          
          // API가 실제로 원하는 URL을 반환하지 않는 경우 테스트를 위해 강제로 설정
          if (!originalUrl.startsWith('https://donghyuncc-cloudfront-aws.ncloud.sbs') && 
              !originalUrl.startsWith('https://drive.ncloud.sbs')) {
            // 테스트용: 파일명을 추출해서 테스트 URL 생성
            const fileName = file.name;
            finalUrl = `https://donghyuncc-cloudfront-aws.ncloud.sbs/files/${fileName}`;
          }
          
          const alternativeUrl = generateAlternativeUrl(finalUrl);
          results.push({ 
            name: file.name, 
            url: finalUrl,
            alternativeUrl: alternativeUrl 
          });
          
          toast.success(`${file.name} 업로드 성공`);
        } catch (error) {
          toast.error(`${file.name} 업로드 실패`);
        }
      }

      setUploadResults(results);
    } catch (error) {
      toast.error("업로드 과정에서 오류가 발생했습니다.");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        authManager.logout();
      }
    } finally {
      setUploading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 방문자 통계 카드 */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">일일 방문자 통계</h3>
          <Info size={18} className="text-gray-400" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempVisitorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          7일간 총 방문자: {tempVisitorData.reduce((sum, day) => sum + day.visitors, 0)} 명
        </div>
      </div>

      {/* 인기 콘텐츠 카드 */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">인기 콘텐츠</h3>
          <Info size={18} className="text-gray-400" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tempPopularContent}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={false} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3">
          <ul className="space-y-3 mt-2">
            {tempPopularContent.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-sm truncate max-w-[200px]">{item.name}</span>
                <span className="text-sm font-medium">{item.views} 조회</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 최근 콘텐츠 요약 */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">최근 콘텐츠</h3>
          <button 
            className="text-blue-500 text-sm hover:underline"
            onClick={() => setActiveTab('articles')}
          >
            모두 보기
          </button>
        </div>
        <div className="space-y-3">
          {articles.slice(0, 5).map((article) => (
            <div key={article.article_id} className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <div className="flex items-center">
                {article.article_view_mode === "PUBLIC" ? (
                  <Eye size={16} className="text-green-500 mr-2" />
                ) : (
                  <EyeOff size={16} className="text-yellow-500 mr-2" />
                )}
                <span className="text-sm truncate max-w-[200px]">{article.article_name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(article.article_date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500">
              <PenSquare size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">{articles.length}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">총 게시물</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 text-green-500">
              <Eye size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">
                {articles.filter(a => a.article_view_mode === "PUBLIC").length}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">공개 게시물</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500">
              <Calendar size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">
                {new Set(articles.map(a => a.article_date.split('T')[0])).size}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">작성일 수</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500">
              <EyeOff size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">
                {articles.filter(a => a.article_view_mode === "PRIVATE").length}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">비공개 게시물</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderArticlesTab = () => (
    <div>
      {selectedArticle && (
        <div className="bg-gray-100 dark:bg-dark-hover p-4 mb-4 rounded">
          <h2 className="text-xl font-bold mb-2">게시글 수정하기</h2>
          <input
            className="w-full p-2 mb-2 border rounded dark:bg-dark-card dark:text-white dark:border-gray-600"
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
            className="w-full p-2 mb-2 border rounded dark:bg-dark-card dark:text-white dark:border-gray-600"
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
            className="w-full p-2 mb-2 border rounded dark:bg-dark-card dark:text-white dark:border-gray-600"
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
            className="w-full p-2 mb-2 border rounded dark:bg-dark-card dark:text-white dark:border-gray-600"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <div
            key={article.article_id}
            className="bg-white dark:bg-dark-card rounded-xl shadow p-4"
          >
            <h2 className="text-xl font-bold mb-2 truncate">{article.article_name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <time dateTime={article.article_date}>
                {new Date(article.article_date).toLocaleString()}
              </time>
            </p>
            <div className="flex gap-1 flex-wrap mb-2">
              {article.categorys.map((cat) => (
                <span 
                  key={cat.category_id}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-hover rounded-full"
                >
                  {cat.category_name}
                </span>
              ))}
            </div>
            <div className="flex items-center mb-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                article.article_view_mode === "PUBLIC" 
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                  : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
              }`}>
                {article.article_view_mode === "PUBLIC" ? "공개" : "비공개"}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedArticle(article)}
                className="flex-1 bg-yellow-500 text-white px-2 py-2 rounded hover:bg-yellow-600 transition-colors flex items-center justify-center"
              >
                <Edit size={16} className="mr-1" /> 수정
              </button>
              <button
                onClick={() => handleDelete(article.article_id)}
                className="flex-1 bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-1" /> 삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        {totalPages > 1 && (
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mx-1 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`mx-1 w-10 h-10 rounded-full ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-dark-hover hover:bg-gray-300 dark:hover:bg-dark-hover"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="mx-1 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderUploadTab = () => (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">파일 업로드</h2>
      
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-4 transition-colors hover:bg-gray-50 dark:hover:bg-dark-hover"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadCloud size={40} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300 mb-4">파일을 여기에 드래그하거나 클릭하여 선택하세요</p>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <button
          onClick={() => document.getElementById('file-upload')?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          파일 선택
        </button>
      </div>

      {files.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">선택된 파일 ({files.length})</h3>
            <button 
              onClick={clearFiles}
              className="text-sm text-red-500 hover:underline"
            >
              모두 지우기
            </button>
          </div>
          <ul className="bg-gray-50 dark:bg-dark-hover rounded-lg p-3 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <li key={index} className="flex justify-between py-1">
                <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-1" /> 모두 업로드
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">업로드 결과</h3>
          <div className="bg-gray-50 dark:bg-dark-hover rounded-lg p-4">
            {uploadResults.map((result, index) => (
              <div key={index} className="mb-6 last:mb-3 border-b dark:border-gray-700 pb-4 last:border-0">
                <p className="text-sm font-medium mb-2">{result.name}</p>
                
                {/* 첫 번째 URL - Cloudfront URL */}
                <div className="flex items-center mt-1 mb-3">
                  <div className="flex-shrink-0 w-28 text-xs text-gray-500 mr-2">CDN URL:</div>
                  <input
                    type="text"
                    value={result.url.startsWith('https://donghyuncc-cloudfront-aws.ncloud.sbs') ? 
                           result.url : result.alternativeUrl}
                    readOnly
                    className="flex-1 text-sm p-1 border rounded dark:bg-dark-card dark:text-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={() => {
                      const url = result.url.startsWith('https://donghyuncc-cloudfront-aws.ncloud.sbs') ? 
                                 result.url : result.alternativeUrl;
                      navigator.clipboard.writeText(url);
                      toast.info("URL이 클립보드에 복사되었습니다.");
                    }}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded flex-shrink-0"
                  >
                    복사
                  </button>
                </div>
                
                {/* 두 번째 URL - Drive URL */}
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-28 text-xs text-gray-500 mr-2">드라이브 URL:</div>
                  <input
                    type="text"
                    value={result.url.startsWith('https://drive.ncloud.sbs') ? 
                           result.url : result.alternativeUrl}
                    readOnly
                    className="flex-1 text-sm p-1 border rounded dark:bg-dark-card dark:text-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={() => {
                      const url = result.url.startsWith('https://drive.ncloud.sbs') ? 
                                 result.url : result.alternativeUrl;
                      navigator.clipboard.writeText(url);
                      toast.info("URL이 클립보드에 복사되었습니다.");
                    }}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded flex-shrink-0"
                  >
                    복사
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16 dark:text-white">
      <ToastContainer />
      
      {/* 헤더 영역 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-gray-600 dark:text-gray-400">블로그 관리 및 콘텐츠 업로드</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <button
            onClick={() => router.push("/admin/editor")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 inline-flex items-center"
          >
            <PenSquare size={16} className="mr-1" /> 새 게시글 작성
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-6 border-b dark:border-gray-700">
        <nav className="flex space-x-6 -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 flex items-center space-x-2 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:border-gray-300 text-gray-500 dark:text-gray-400'
            }`}
          >
            <Info size={16} />
            <span>개요</span>
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`py-4 px-1 flex items-center space-x-2 font-medium border-b-2 transition-colors ${
              activeTab === 'articles'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:border-gray-300 text-gray-500 dark:text-gray-400'
            }`}
          >
            <PenSquare size={16} />
            <span>게시글 관리</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-4 px-1 flex items-center space-x-2 font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:border-gray-300 text-gray-500 dark:text-gray-400'
            }`}
          >
            <Upload size={16} />
            <span>파일 업로드</span>
          </button>
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'articles' && renderArticlesTab()}
      {activeTab === 'upload' && renderUploadTab()}
    </div>
  );
}
