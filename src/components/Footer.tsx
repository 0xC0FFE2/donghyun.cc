import React from "react";
import Image from "next/image";
import DonghyunLogo from "../assets/logo_full_long_clear.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-black py-6 w-full">
      <div className="container mx-auto flex flex-row justify-between items-center">
        <div className="flex flex-col items-start text-left">
          <Image 
            src={DonghyunLogo} 
            alt="DONGHYUN.CC" 
            width={200} 
            height={40} 
            className="h-10 mb-3"
          />
          <p className="text-sm mb-2">이 블로그의 모든 콘텐츠는 저작권의 보호를 받습니다</p>
          <p className="text-sm">문의 : leedonghyun@ncloud.sbs</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
