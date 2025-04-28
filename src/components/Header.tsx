import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../assets/logo_full_long_clear.png";
import ThemeToggle from "./ThemeToggle";

const Header: React.FC = () => {
  return (
    <header className="fixed bg-black w-full z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/">
          <Image
            src={logo}
            alt="donghyun.cc"
            height={32}
            style={{ height: "auto" }}
          />
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/article_list" className="text-white">
            게시물
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
