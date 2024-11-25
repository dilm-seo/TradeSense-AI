import { useState, useEffect } from 'react';
import { RSSItem, fetchRSSFeed } from '../services/rssService';

export const useRSSFeed = (refreshInterval = 30000) => {
  const [news, setNews] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const items = await fetchRSSFeed();
        setNews(items);
        setError(null);
      } catch (err) {
        setError('Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { news, loading, error };
};