import React from 'react';
import { NextPage } from 'next';
import ProfileCard from '../components/ProfileCard';
import RecentPosts from '../components/RecentPosts';
import CategoryPosts from '../components/CategoryPosts';
import CountCard from '@/components/CountCard';

const HomePage: NextPage = () => {
 return (
   <div className="container mx-auto px-4 py-1 pt-12">
     <h2 className="text-2xl font-bold mt-6 mb-6">소개</h2>
     <ProfileCard />
     <CountCard />
     <RecentPosts size={4} />
     <CategoryPosts size={8} mode="SIMPLE" />
   </div>
 );
};

export default HomePage;