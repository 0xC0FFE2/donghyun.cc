import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Category } from "@/types/Category";

interface PostCardProps {
  id: number;
  title: string;
  date: string;
  category: string[] | null;
  image: string;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  date,
  category,
  image,
}) => {
  return (
    <Link href={`/article/${id}`}>
      <div className="block bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300 ring-0 hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none h-96">
        <div className="relative w-full h-48">
          <Image
            src={
              image && image !== "NULL"
                ? image
                : "https://nanu.cc/NANU-Brand-Loader.jpg"
            }
            alt={title}
            fill
            className="bg-gray-200 object-cover"
          />
        </div>
        <div className="p-6 h-48 flex flex-col">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 overflow-hidden display-webkit-box webkit-line-clamp-3 webkit-box-orient-vertical">
            {title}
          </h3>
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex flex-wrap gap-2">
              {category && category.length > 0 ? (
                category.map((cat) => (
                  <span
                    key={cat}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-xs"
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs">
                  카테고리 없음
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
