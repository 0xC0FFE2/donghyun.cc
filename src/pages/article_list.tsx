import type { NextPage } from 'next'
import CategoryPosts from '@/components/CategoryPosts'

const ArticlesPage: NextPage = () => {
  return (  
    <div className="container mx-auto px-4 py-1 pt-12">
      <CategoryPosts size={16} mode="FULL" />
    </div>
  )
}

export default ArticlesPage