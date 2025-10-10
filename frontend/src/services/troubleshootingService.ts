import axios from 'axios';
import { TroubleshootingArticle, TroubleshootingArticleSummary } from '../types';

const baseUrl = '/api/troubleshooting';

export const getTroubleshootingArticles = async (): Promise<TroubleshootingArticleSummary[]> => {
  const response = await axios.get(baseUrl);
  return response.data;
};

export const getTroubleshootingArticleById = async (id: string): Promise<TroubleshootingArticle> => {
  const response = await axios.get(`${baseUrl}/${id}`);
  return response.data;
};
