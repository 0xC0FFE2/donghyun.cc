interface SiteMetadata {
    title: string;
    description: string;
    siteUrl: string;
    author: string;
    language: string;
    defaultImage: string;
  }
  
  export const getSiteMetadata = (): SiteMetadata => {
    return {
      title: process.env.NEXT_PUBLIC_SITE_TITLE || '블로그',
      description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '블로그 설명',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
      author: process.env.NEXT_PUBLIC_AUTHOR || '작성자',
      language: 'ko',
      defaultImage: '/default-thumbnail.jpg',
    };
  };