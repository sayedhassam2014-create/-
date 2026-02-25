import React from 'react';

interface CategorySelectorProps {
  title: string;
  value: 'Adult' | 'Child' | '';
  onSelect: (value: 'Adult' | 'Child') => void;
  disabled?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ title, value, onSelect, disabled }) => {
  const options: ('Adult' | 'Child')[] = ['Adult', 'Child'];
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-700 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              disabled={disabled}
              className={`flex-1 text-sm font-semibold px-3 py-2 rounded-lg transition-colors border text-center disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
