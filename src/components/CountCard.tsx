import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '@/config'

const PeopleCount: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/blog/info`)
      .then((response) => response.json())
      .then((data: { blog_total_views: number }) => {
        setCount(data.blog_total_views);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="mt-2 p-2 border rounded-lg mb-2 bg-gray-300">
      <h3 className="text-ml text-gray-900 text-center mb-1">
        📖 지금까지 총 {count}명이 사이트를 방문하여 더 나은 성장을 위한 지식을 얻어가셨습니다.
      </h3>
    </div>
  );
};

export default PeopleCount;