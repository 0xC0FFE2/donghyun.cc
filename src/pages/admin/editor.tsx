import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import type { NextPage } from "next";
import { Category } from "@/types/Category";
import { OAuthSDK } from "nanuid-websdk";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface InitialContent {
  content: string;
  title: string;
  thumbnailURL: string;
  categories?: number[];
}

interface MarkdownEditorProps {
  initialContent?: InitialContent;
  onSave?: () => void;
}

const MarkdownEditorPage: NextPage<MarkdownEditorProps> = ({
  initialContent,
}) => {
  const router = useRouter();
  const { id: postId } = router.query;
  const draftKey = `draft_${postId || "new"}`;

  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [thumbnailURL, setThumbnailURL] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [editorHeight, setEditorHeight] = useState<string>("500px");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const getAuthenticatedAxios = useCallback(async () => {
    try {
      const token = await OAuthSDK.getToken();
      const validation = OAuthSDK.validateToken(token);

      if (!validation.isValid) {
        const newToken = await OAuthSDK.reissueToken();
        if (!newToken) {
          toast.error("세션이 만료되었습니다. 다시 로그인해 주세요.");
          router.push("/");
          return null;
        }
      }

      return axios.create({
        baseURL: API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("인증 오류가 발생했습니다.");
      router.push("/");
      return null;
    }
  }, [router]);

  // 다크 모드 감지 
  useEffect(() => {
    // 페이지 로드 시 HTML 요소의 dark 클래스 여부 확인
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
    
    // 다크 모드 변경 감지를 위한 MutationObserver 설정
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          const isDark = document.documentElement.classList.contains('dark');
          setDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // 초기 콘텐츠 로드
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent.content);
      setTitle(initialContent.title);
      setThumbnailURL(initialContent.thumbnailURL);
      setSelectedCategories(initialContent.categories || []);
    } else if (typeof window !== "undefined") {
      const savedContent = localStorage.getItem(draftKey);
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent);
        setContent(parsedContent.content);
        setTitle(parsedContent.title);
        setThumbnailURL(parsedContent.thumbnailURL);
        setSelectedCategories(parsedContent.categories || []);
      }
    }
  }, [initialContent, draftKey]);

  useEffect(() => {
    const fetchCategories = async () => {
      const authAxios = await getAuthenticatedAxios();
      if (!authAxios) return;

      try {
        const response = await authAxios.get("/categories");
        setCategories(response.data);
      } catch (error) {
        toast.error("카테고리 목록을 불러오는 데 실패했습니다.");
      }
    };
    fetchCategories();
  }, [getAuthenticatedAxios]);

  // 자동 저장 기능 추가
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (content || title || thumbnailURL) {
        saveToLocalStorage(false); // silent save (no toast)
      }
    }, 60000); // 1분마다 자동 저장

    return () => clearInterval(autoSaveInterval);
  }, [content, title, thumbnailURL, selectedCategories]);

  const saveToLocalStorage = useCallback((showToast = true) => {
    if (typeof window !== "undefined") {
      const contentToSave = {
        content,
        title,
        thumbnailURL,
        categories: selectedCategories,
      };
      localStorage.setItem(draftKey, JSON.stringify(contentToSave));
      if (showToast) {
        toast.info("임시 저장되었습니다.");
      }
    }
  }, [content, title, thumbnailURL, selectedCategories, draftKey]);

  const uploadContent = async () => {
    setUploading(true);
    const authAxios = await getAuthenticatedAxios();
    if (!authAxios) return;

    const formData = new FormData();
    const blob = new Blob([content], { type: "text/markdown" });
    formData.append("file", blob, "content.md");

    try {
      const response = await authAxios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFileUrl(response.data.url);
      toast.success("파일이 성공적으로 업로드되었습니다!");
      return response.data.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("파일 업로드 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (viewMode: "PUBLIC" | "PRIVATE") => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    const authAxios = await getAuthenticatedAxios();
    if (!authAxios) return;

    try {
      const contentUrl = await uploadContent();
      if (!contentUrl) return;

      await authAxios.post("/admin/articles", {
        article_date: new Date().toISOString(),
        article_name: title,
        thumbnail_url: thumbnailURL,
        article_data_url: contentUrl,
        article_view_mode: viewMode,
        categories: selectedCategories,
      });
      toast.success("성공적으로 퍼블리싱되었습니다!");
      localStorage.removeItem(draftKey);
      router.push("/admin");
    } catch (error) {
      toast.error("퍼블리싱 중 오류가 발생했습니다.");
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("카테고리 이름을 입력하세요.");
      return;
    }

    const authAxios = await getAuthenticatedAxios();
    if (!authAxios) return;

    try {
      const response = await authAxios.post("/categories", {
        category_name: newCategoryName,
      });
      setCategories([...categories, response.data]);
      setNewCategoryName("");
      toast.success("새 카테고리가 생성되었습니다.");
    } catch (error) {
      toast.error("카테고리 생성에 실패했습니다.");
    }
  };

  // 웹브라우저에서만 랜더링되도록 조건부 렌더링
  const renderEditor = () => {
    if (typeof window === "undefined") {
      return null;
    }
    
    return (
      <MDEditor
        value={content}
        onChange={(value) => setContent(value || "")}
        height={editorHeight}
        preview="edit"
        enableScroll={true}
        highlightEnable={true}
        textareaProps={{
          placeholder: "내용을 입력하세요...",
          spellCheck: false,
          style: {
            fontFamily: "monospace, monospace",
            fontSize: "14px",
            lineHeight: "1.6"
          }
        }}
        previewOptions={{
          // 타입 오류를 피하기 위해 rehypePlugins 설정 제거
        }}
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl mt-16 dark:text-white">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <h1 className="text-3xl font-bold mb-6">게시글 작성</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-dark-card dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          썸네일 URL
        </label>
        <input
          type="text"
          value={thumbnailURL}
          onChange={(e) => setThumbnailURL(e.target.value)}
          placeholder="썸네일 URL을 입력하세요"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-dark-card dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          카테고리
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {categories.map((category) => (
            <button
              key={category.category_id}
              onClick={() => handleCategoryToggle(category.category_id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategories.includes(category.category_id)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-dark-card text-gray-700 dark:text-gray-300"
              }`}
            >
              {category.category_name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="새 카테고리 이름"
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 dark:bg-dark-card dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateCategory}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
          >
            추가
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            내용
          </label>
          <select 
            value={editorHeight}
            onChange={(e) => setEditorHeight(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 dark:bg-dark-card dark:text-white rounded-lg text-sm"
          >
            <option value="400px">높이: 작게</option>
            <option value="500px">높이: 중간</option>
            <option value="650px">높이: 크게</option>
            <option value="800px">높이: 매우 크게</option>
          </select>
        </div>
        <div
          className={`dark:bg-dark-card rounded-lg overflow-hidden ${darkMode ? 'dark' : ''}`}
          data-color-mode={darkMode ? 'dark' : 'light'}
        >
          {renderEditor()}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => saveToLocalStorage(true)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 mr-2"
          >
            임시 저장
          </button>
          <button
            onClick={() => {
              if (window.confirm("현재 작성 중인 내용을 모두 초기화하시겠습니까?")) {
                setContent("");
                setTitle("");
                setThumbnailURL("");
                setSelectedCategories([]);
                localStorage.removeItem(draftKey);
                toast.info("내용이 초기화되었습니다.");
              }
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
          >
            초기화
          </button>
        </div>
        <div>
          <button
            onClick={() => handlePublish("PRIVATE")}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200 mr-2"
            disabled={uploading}
          >
            비공개 퍼블리싱
          </button>
          <button
            onClick={() => handlePublish("PUBLIC")}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
            disabled={uploading}
          >
            공개 퍼블리싱
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorPage;