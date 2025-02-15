import React from "react";
import { Loader2 } from "lucide-react";

const GlobalLoading = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="text-gray-700 font-medium">게시글을 불러오고 있어요..</span>
      </div>
    </div>
  );
};

export default GlobalLoading;
