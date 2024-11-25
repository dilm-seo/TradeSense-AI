export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'low' | 'moderate' | 'high';
  keywords: string[];
  affectedPairs: string[];
  probability: number;
  signal: 'buy' | 'sell' | 'wait';
}

export interface TradingSignal {
  pair: string;
  signal: 'buy' | 'sell' | 'wait';
  probability: number;
  timestamp: string;
  newsId: string;
}