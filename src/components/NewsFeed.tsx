import React, { useState } from 'react';
import { useRSSFeed } from '../hooks/useRSSFeed';
import { NewsCard } from './NewsCard';
import { PromptSelector } from './PromptSelector';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { NewsItem } from '../types';
import { analyzeNews, PromptType, AIModel, AI_MODELS } from '../services/openaiService';

export const NewsFeed: React.FC = () => {
  const { news, loading, error } = useRSSFeed();
  const [selectedPrompt, setSelectedPrompt] = useState<PromptType>('conservative');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4-turbo-preview');
  const [analyzing, setAnalyzing] = useState(false);
  const [processedNews, setProcessedNews] = useState<NewsItem[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const processNewsWithAI = async (newsItems: typeof news) => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const processed = await Promise.all(
        newsItems.map(async (item, index) => {
          const analysis = await analyzeNews(
            `${item.title}\n${item.description}`,
            selectedPrompt,
            selectedModel
          );
          
          return {
            id: index.toString(),
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            sentiment: analysis.signal === 'buy' ? 'bullish' : 
                      analysis.signal === 'sell' ? 'bearish' : 'neutral',
            impact: analysis.impact,
            keywords: analysis.factors,
            affectedPairs: analysis.pairs,
            probability: analysis.confidence,
            signal: analysis.signal
          };
        })
      );
      setProcessedNews(processed);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze news');
      console.error('Failed to process news:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleScan = () => {
    if (news.length > 0) {
      processNewsWithAI(news);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Latest News</h2>
        <button
          onClick={handleScan}
          disabled={analyzing}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            analyzing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Scanning...' : 'Scan News'}</span>
        </button>
      </div>

      <div className="space-y-4">
        <PromptSelector
          selectedPrompt={selectedPrompt}
          onSelect={setSelectedPrompt}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            AI Model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  selectedModel === model.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="font-medium">{model.name}</div>
                <div className={`text-sm ${
                  selectedModel === model.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {model.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {analysisError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
            <p className="text-sm text-red-700 mt-1">{analysisError}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {processedNews.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </div>
  );
};