import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import MDViewer from '@/components/MDViewer'
import RecentPosts from '@/components/RecentPosts'
import LoadingSpinner from '@/components/LoadingIcon'
import { API_BASE_URL } from '@/config'
import { Article } from '@/types/Article'

const ArticleViewPage: NextPage = () => {
  const router = useRouter()
  const { id: articleId } = router.query

  const [article, setArticle] = useState<Article | null>(null)
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!articleId) return

    const fetchArticle = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`)
        if (!response.ok) {
          throw new Error(
            response.status === 404 
              ? '게시물을 찾을 수 없습니다.'
              : '서버 오류가 발생했습니다.'
          )
        }

        const data: Article = await response.json()
        setArticle(data)

        const contentResponse = await fetch(data.article_data_url)
        if (!contentResponse.ok) {
          throw new Error('게시물 내용을 가져오는 데 실패했습니다.')
        }

        const contentData = await contentResponse.text()
        setContent(contentData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        console.error('Error fetching article:', err)
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [articleId])

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 pt-20">
        <div className="text-red-600 text-center mb-8">{error}</div>
        <ToastContainer />
      </div>
    )
  }

  if (!article) return null

  const formattedDate = new Date(article.article_date).toLocaleDateString('ko-KR')

  return (
    <div className="container mx-auto px-4 py-12 pt-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{article.article_name}</h1>
        
        <div className="mb-8">
          <span className="text-gray-600">{formattedDate}</span>
          
          {article.categorys?.length > 0 ? (
            article.categorys.map((category) => (
              <span
                key={category.category_id}
                className="ml-2 bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
              >
                {category.category_name}
              </span>
            ))
          ) : (
            <span className="ml-2 text-gray-500">카테고리가 없습니다.</span>
          )}
        </div>

        {article.thumbnail_url && (
          <div className="relative w-full h-96 mb-8">
            <Image
              src={article.thumbnail_url}
              alt={article.article_name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <MDViewer content={content} />
      </div>

      <RecentPosts size={4} />
      <ToastContainer />
    </div>
  )
}

export default ArticleViewPage