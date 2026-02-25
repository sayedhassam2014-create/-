import React from 'react';

interface FilterSelectorProps {
  title: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({ title, options, selectedValue, onSelect }) => {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-700 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = selectedValue === option;
          return (
            <button
              key={option}
              onClick={() => onSelect(isSelected ? '' : option)} // Allow deselecting by clicking again
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border ${
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

export default FilterSelector;
