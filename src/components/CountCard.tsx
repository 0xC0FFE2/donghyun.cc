import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '@/config'

const twelveHours = 12 * 60 * 60 * 1000;

const PeopleCount: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const currentTime = Date.now();
    const cachedData = localStorage.getItem("blogData");
    const cachedTime = localStorage.getItem("lastUpdated");

    if (cachedData && cachedTime) {
      const parsedTime = parseInt(cachedTime, 10);

      if (!isNaN(parsedTime) && currentTime - parsedTime < twelveHours) {
        try {
          const data = JSON.parse(cachedData) as { blog_total_views: number };
          setCount(data.blog_total_views);
          return;
        } catch (error) {
          console.error("Error parsing cached data:", error);
        }
      }
    }

    fetch(`${API_BASE_URL}/blog/info`)
      .then((response) => response.json())
      .then((data: { blog_total_views: number }) => {
        setCount(data.blog_total_views);
        localStorage.setItem("blogData", JSON.stringify(data));
        localStorage.setItem("lastUpdated", currentTime.toString());
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
