import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import type { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const sentimentIcon = {
    bullish: <TrendingUp className="h-5 w-5 text-green-500" />,
    bearish: <TrendingDown className="h-5 w-5 text-red-500" />,
    neutral: <Minus className="h-5 w-5 text-gray-500" />
  }[news.sentiment];

  const impactColor = {
    low: 'bg-gray-100 text-gray-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }[news.impact];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {sentimentIcon}
            <span className={`text-xs px-2 py-1 rounded-full ${impactColor}`}>
              {news.impact.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(news.pubDate), { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{news.title}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {news.keywords.map((keyword, index) => (
              <span
                key={index}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
              >
                {keyword}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {news.affectedPairs.map((pair, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {pair}
                </span>
              ))}
            </div>
            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="ml-4 text-center">
          <div className={`text-lg font-bold ${
            news.signal === 'achat' ? 'text-green-500' :
            news.signal === 'vente' ? 'text-red-500' :
            'text-gray-500'
          }`}>
            {news.signal.toUpperCase()}
          </div>
          <div className="text-sm text-gray-500">
            {news.probability}%
          </div>
        </div>
      </div>
    </div>
  );
};
