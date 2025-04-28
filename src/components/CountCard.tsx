import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '@/config'

const PeopleCount: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/blog/info`)
      .then((response) => response.json())
      .then((data: { blog_total_views: number }) => {
        setCount(data.blog_total_views);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="relative overflow-hidden mt-4 p-4 rounded-xl bg-white to-indigo-300 dark:bg-black">
      {isLoading ? (
        <div className="flex justify-center items-center h-12">
          <div className="animate-pulse bg-blue-300 dark:bg-blue-700 h-4 w-64 rounded"></div>
        </div>
      ) : (
        <div className="relative z-10">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 text-center">
            지금까지 총 <span className="font-bold text-indigo-700 dark:text-indigo-300">{count.toLocaleString()}</span>명이
            <br className="sm:hidden" /> 사이트를 방문하여 지식을 얻어가셨습니다.
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">(매일 12시에 방문자 기록)</p>
          </h3>
        </div>
      )}
    </div>
  );
};

export default PeopleCount;