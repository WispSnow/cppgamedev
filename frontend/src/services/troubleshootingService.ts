import { TroubleshootingArticle, TroubleshootingArticleSummary } from '../types';
import { getJson } from './api';

const baseUrl = '/api/troubleshooting';

export const getTroubleshootingArticles = (signal?: AbortSignal): Promise<TroubleshootingArticleSummary[]> =>
  getJson<TroubleshootingArticleSummary[]>(baseUrl, signal);

export const getTroubleshootingArticleById = (id: string, signal?: AbortSignal): Promise<TroubleshootingArticle> =>
  getJson<TroubleshootingArticle>(`${baseUrl}/${encodeURIComponent(id)}`, signal);
