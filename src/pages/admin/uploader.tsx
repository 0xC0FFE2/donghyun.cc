import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "@/config";
import { OAuthSDK } from "nanuid-websdk";

interface FileInputProps {
  onFileChange: (file: File | null) => void;
}

interface SubmitButtonProps {
  uploading: boolean;
}

const FileInput: React.FC<FileInputProps> = ({ onFileChange }) => {
  return (
    <div className="flex items-center justify-center w-full">
      <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300">
        <div className="flex flex-col items-center justify-center pt-7">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-gray-400 group-hover:text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
            파일을 선택하거나 드래그하세요
          </p>
        </div>
        <input
          type="file"
          className="opacity-0"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
};

const SubmitButton: React.FC<SubmitButtonProps> = ({ uploading }) => {
  return (
    <button
      type="submit"
      disabled={uploading}
      className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
    >
      {uploading ? "업로드 중..." : "업로드"}
    </button>
  );
};

const FileUploader: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("파일을 선택해주세요.");
      return;
    }

    setUploading(true);
    const authAxios = await getAuthenticatedAxios();
    if (!authAxios) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await authAxios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFileUrl(response.data.url);
      toast.success("파일이 성공적으로 업로드되었습니다!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const pastedFile = items[i].getAsFile();
        if (pastedFile) {
          setFile(pastedFile);
          toast.info("이미지가 클립보드에서 붙여넣기되었습니다.");
          return;
        }
      }
    }
    toast.error("붙여넣기된 내용에 이미지가 없습니다.");
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-16"
      onPaste={handlePaste as unknown as React.ClipboardEventHandler}
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">파일 업로드</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FileInput onFileChange={setFile} />
        <SubmitButton uploading={uploading} />
      </form>
      {fileUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">업로드된 파일 URL:</h3>
          <a
            href={fileUrl}
            className="text-blue-500 underline break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {fileUrl}
          </a>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default FileUploader;
