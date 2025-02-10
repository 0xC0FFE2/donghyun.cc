import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Category } from "@/types/Category";

interface PostCardProps {
  id: number;
  title: string;
  date: string;
  category: Category[] | null;
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
      <div className="block bg-gray-100 rounded-lg overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300 ring-0 hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{date}</span>
            <div className="flex gap-2">
              {category && category.length > 0 ? (
                category.map((cat) => (
                  <span
                    key={cat.category_id}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs"
                  >
                    {cat.category_name}
                  </span>
                ))
              ) : (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                  카테고리 없음
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
