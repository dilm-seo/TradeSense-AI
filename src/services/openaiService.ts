import OpenAI from 'openai';

export const AI_MODELS = [
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', description: 'Most capable model, best analysis' },
  { id: 'gpt-4', name: 'GPT-4', description: 'Highly capable, balanced performance' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' }
] as const;

export type AIModel = typeof AI_MODELS[number]['id'];

const getOpenAIInstance = () => {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add it in settings.');
  }
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export const prompts = {
  conservative: {
    id: 'conservative',
    name: 'Conservative Analysis',
    description: 'Focuses on established market patterns and fundamental analysis',
    template: `Analyze this forex news with a conservative approach:
    "{text}"
    
    Consider market fundamentals and established patterns. Provide:
    1. Market impact (low/moderate/high)
    2. Affected currency pairs
    3. Trading signal (buy/sell/wait)
    4. Confidence level (0-100)
    5. Key factors considered
    
    Format: JSON with the following structure:
    {
      "impact": "low|moderate|high",
      "pairs": ["EURUSD", "GBPUSD"],
      "signal": "buy|sell|wait",
      "confidence": 75,
      "factors": ["factor1", "factor2"]
    }`
  },
  aggressive: {
    id: 'aggressive',
    name: 'Aggressive Trading',
    description: 'Seeks short-term opportunities with higher risk/reward',
    template: `Analyze this forex news for immediate trading opportunities:
    "{text}"
    
    Focus on short-term price movements. Provide:
    1. Market impact (low/moderate/high)
    2. Primary trading pairs
    3. Trading signal (buy/sell/wait)
    4. Confidence level (0-100)
    5. Expected price movement
    
    Format: JSON with the following structure:
    {
      "impact": "low|moderate|high",
      "pairs": ["EURUSD", "GBPUSD"],
      "signal": "buy|sell|wait",
      "confidence": 75,
      "factors": ["factor1", "factor2"]
    }`
  },
  technical: {
    id: 'technical',
    name: 'Technical Analysis',
    description: 'Emphasizes technical indicators and chart patterns',
    template: `Analyze this forex news from a technical perspective:
    "{text}"
    
    Consider technical indicators and chart patterns. Provide:
    1. Market impact (low/moderate/high)
    2. Relevant currency pairs
    3. Trading signal (buy/sell/wait)
    4. Confidence level (0-100)
    5. Key technical levels
    
    Format: JSON with the following structure:
    {
      "impact": "low|moderate|high",
      "pairs": ["EURUSD", "GBPUSD"],
      "signal": "buy|sell|wait",
      "confidence": 75,
      "factors": ["factor1", "factor2"]
    }`
  }
};

export type PromptType = keyof typeof prompts;

export interface AIAnalysis {
  impact: 'low' | 'moderate' | 'high';
  pairs: string[];
  signal: 'buy' | 'sell' | 'wait';
  confidence: number;
  factors: string[];
}

interface AIResponse {
  impact: string;
  pairs: string[];
  signal: string;
  confidence: number;
  factors: string[];
}

const validateResponse = (data: any): AIResponse => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response format');
  }

  const impact = String(data.impact || '').toLowerCase();
  if (!['low', 'moderate', 'high'].includes(impact)) {
    throw new Error('Invalid impact value');
  }

  const pairs = Array.isArray(data.pairs) ? data.pairs : [];
  const signal = String(data.signal || '').toLowerCase();
  if (!['buy', 'sell', 'wait'].includes(signal)) {
    throw new Error('Invalid signal value');
  }

  const confidence = Number(data.confidence || data.confidence_level);
  if (isNaN(confidence) || confidence < 0 || confidence > 100) {
    throw new Error('Invalid confidence value');
  }

  const factors = Array.isArray(data.factors) ? data.factors : 
                 Array.isArray(data.key_factors) ? data.key_factors : [];

  return {
    impact,
    pairs,
    signal,
    confidence,
    factors
  };
};

export const analyzeNews = async (
  text: string,
  promptType: PromptType,
  model: AIModel
): Promise<AIAnalysis> => {
  try {
    const openai = getOpenAIInstance();
    const prompt = prompts[promptType].template.replace('{text}', text);
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const result = JSON.parse(content);
    const validatedResponse = validateResponse(result);
    
    return {
      impact: validatedResponse.impact as AIAnalysis['impact'],
      pairs: validatedResponse.pairs,
      signal: validatedResponse.signal as AIAnalysis['signal'],
      confidence: validatedResponse.confidence,
      factors: validatedResponse.factors
    };
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze news');
  }
};
