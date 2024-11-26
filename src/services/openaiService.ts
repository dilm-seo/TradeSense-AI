import OpenAI from 'openai';

export const AI_MODELS = [
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', description: 'Modèle le plus performant, idéal pour les analyses avancées' },
  { id: 'gpt-4', name: 'GPT-4', description: 'Modèle très performant, équilibré pour toutes les analyses' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Rapide et économique' }
] as const;

export type AIModel = typeof AI_MODELS[number]['id'];

const getOpenAIInstance = () => {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error('Clé API OpenAI introuvable. Veuillez l\'ajouter dans les paramètres.');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export const prompts = {
  conservative: {
    id: 'conservative',
    name: 'Analyse Conservatrice',
    description: 'Se concentre sur les modèles établis du marché et l\'analyse fondamentale',
    template: `Analysez cette nouvelle sur le forex avec une approche conservatrice :
    "{text}"
    
    Prenez en compte les fondamentaux du marché et les modèles établis. Fournissez :
    1. Impact sur le marché (faible/modéré/élevé)
    2. Paires de devises concernées
    3. Signal de trading (achat/vente/attente)
    4. Niveau de confiance (0-100)
    5. Facteurs clés pris en compte
    6. Devise impact positif
    
    Format : JSON avec la structure suivante :
    {
      "impact": "faible|modéré|élevé",
      "pairs": ["EURUSD", "GBPUSD"],
      "signal": "achat|vente|attente",
      "confidence": 75,
      "factors": ["facteur1", "facteur2"],
      "devise": ["EUR", "USD"]
    }`
  },
  aggressive: {
    id: 'aggressive',
    name: 'Trading Agressif',
    description: 'Recherche des opportunités à court terme avec un rapport risque/rendement élevé',
    template: `Analysez cette nouvelle sur le forex pour des opportunités de trading immédiates :
    "{text}"
    
    Concentrez-vous sur les mouvements de prix à court terme. Fournissez :
    1. Impact sur le marché (faible/modéré/élevé)
    2. Principales paires de trading
    3. Signal de trading (achat/vente/attente)
    4. Niveau de confiance (0-100)
    5. Mouvement de prix attendu
    
    Format : JSON avec la structure suivante :
    {
      "impact": "faible|modéré|élevé",
      "pairs": ["EURUSD", "GBPUSD"],
      "signal": "achat|vente|attente",
      "confidence": 75,
      "factors": ["facteur1", "facteur2"]
    }`
  },
  technical: {
    id: 'technical',
    name: 'Analyse Technique',
    description: 'Met l\'accent sur les indicateurs techniques et les modèles graphiques',
    template: `Analysez cette nouvelle sur le forex d'un point de vue technique :
    "{text}"
    
    Prenez en compte les indicateurs techniques et les modèles graphiques. Fournissez :
    1. Impact sur le marché (faible/modéré/élevé)
    2. Paires de devises concernées
    3. Signal de trading (achat/vente/attente)
    4. Niveau de confiance (0-100)
    5. Niveaux techniques clés
    
    Format : JSON avec la structure suivante :
    {
      "impact": "faible|modéré|élevé",
      "pairs": ["EURUSD", "GBPUSD"],
      "signal": "achat|vente|attente",
      "confidence": 75,
      "factors": ["facteur1", "facteur2"]
    }`
  }
};

export type PromptType = keyof typeof prompts;

export interface AIAnalysis {
  impact: 'faible' | 'modéré' | 'élevé';
  pairs: string[];
  signal: 'achat' | 'vente' | 'attente';
  confidence: number;
  factors: string[];
  devise: string[];
}

interface AIResponse {
  impact: string;
  pairs: string[];
  signal: string;
  confidence: number;
  factors: string[];
  devise: string[];
}

const validateResponse = (data: any): AIResponse => {
  if (!data || typeof data !== 'object') {
    throw new Error('Format de réponse invalide');
  }

  const impact = String(data.impact || '').toLowerCase();
  if (!['faible', 'modéré', 'élevé'].includes(impact)) {
    throw new Error('Valeur d\'impact invalide');
  }

  const pairs = Array.isArray(data.pairs) ? data.pairs : [];
  const signal = String(data.signal || '').toLowerCase();
  if (!['achat', 'vente', 'attente'].includes(signal)) {
    throw new Error('Valeur de signal invalide');
  }

  const confidence = Number(data.confidence || data.confidence_level);
  if (isNaN(confidence) || confidence < 0 || confidence > 100) {
    throw new Error('Valeur de confiance invalide');
  }

  const factors = Array.isArray(data.factors) ? data.factors : [];
  const devise = Array.isArray(data.devise) ? data.devise : [];

  return {
    impact,
    pairs,
    signal,
    confidence,
    factors,
    devise
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
      max_tokens: 500
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Réponse vide d\'OpenAI');
    }

    const result = JSON.parse(content);
    const validatedResponse = validateResponse(result);
    
    return {
      impact: validatedResponse.impact as AIAnalysis['impact'],
      pairs: validatedResponse.pairs,
      signal: validatedResponse.signal as AIAnalysis['signal'],
      confidence: validatedResponse.confidence,
      factors: validatedResponse.factors,
      devise: validatedResponse.devise
    };
  } catch (error) {
    console.error('Échec de l\'analyse OpenAI :', error);
    throw new Error(error instanceof Error ? error.message : 'Échec de l\'analyse des nouvelles');
  }
};
