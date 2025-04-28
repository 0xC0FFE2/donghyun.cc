import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import profileImage from "../assets/profile.png";

const ProfileCard: React.FC = () => {
  const [clickStart, setClickStart] = useState<number | null>(null);
  const router = useRouter();

  const handleMouseDown = () => setClickStart(Date.now());

  const handleMouseUp = () => {
    if (clickStart && Date.now() - clickStart >= 3000) {
      router.push("/admin");
    }
    setClickStart(null);
  };

  return (
    <div className="bg-white dark:bg-[#262626] rounded-lg shadow-sm">
      <div className="flex items-center">
        <div 
          className="relative w-24 h-24 rounded-md mr-4 cursor-pointer hover:opacity-80 transition-opacity"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setClickStart(null)}
        >
          <Image
            src={profileImage}
            alt="이동현"
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Web Server Engineer</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            이동현{" "}
            <span className="hidden sm:inline font-normal text-gray-400 dark:text-gray-500">LEE DONGHYUN</span>
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <a
              href="https://me.donghyun.cc"
              className="bg-blue-100 dark:bg-blue-900 text-gray-700 dark:text-gray-200 px-3 py-1 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              Portfolio
            </a>
            <a
              href="mailto:leedonghyun@ncloud.sbs"
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Email
            </a>
            <a
              href="https://github.com/0xC0FFE2"
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-300">기술에 대한 이해를 바탕으로 문제를 해결하기 위해 노력하는 서버 개발자입니다</p>
    </div>
  );
};

export default ProfileCard;
