import React, { useState } from 'react';
import { TradingViewChart } from './TradingViewChart';
import { NewsFeed } from './NewsFeed';

export const Dashboard = () => {
  const [selectedPair] = useState('EURUSD');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradingViewChart symbol={selectedPair} />
        </div>
        <div>
          <NewsFeed />
        </div>
      </div>
    </div>
  );
};