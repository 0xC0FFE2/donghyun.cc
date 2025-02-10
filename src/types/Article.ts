import { Category } from "./Category";

export interface Article {
  article_id: number;
  article_name: string;
  article_date: string;
  article_data_url: string;
  thumbnail_url: string;
  categorys: Category[];
}
