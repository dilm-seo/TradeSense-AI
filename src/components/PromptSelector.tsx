import React from 'react';
import { prompts, PromptType } from '../services/openaiService';

interface PromptSelectorProps {
  selectedPrompt: PromptType;
  onSelect: (promptType: PromptType) => void;
}

export const PromptSelector: React.FC<PromptSelectorProps> = ({
  selectedPrompt,
  onSelect
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Analysis Style
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {(Object.keys(prompts) as PromptType[]).map((promptType) => (
          <button
            key={promptType}
            onClick={() => onSelect(promptType)}
            className={`p-3 rounded-lg text-left transition-colors ${
              selectedPrompt === promptType
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="font-medium">{prompts[promptType].name}</div>
            <div className={`text-sm ${
              selectedPrompt === promptType ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {prompts[promptType].description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};