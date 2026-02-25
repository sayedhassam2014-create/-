
import React from 'react';
import { Product } from '../types';
import CameraIcon from './icons/CameraIcon';
import SparklesIcon from './icons/SparklesIcon';

interface ProductCardProps {
  product: Product;
  onStartTryOn: () => void;
  onGetStyleIdeas: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onStartTryOn, onGetStyleIdeas }) => {
  return (
    <div
      className="bg-[var(--card)] rounded-[var(--radius)] overflow-hidden flex flex-col group transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2"
    >
      <div className="relative bg-gray-100 p-4">
        <img
          className="h-56 w-full object-contain group-hover:scale-105 transition-transform duration-300"
          src={product.imageUrl}
          alt={product.name}
        />
      </div>
      <div className="p-4 text-center flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-gray-800 flex-grow">{product.name}</h3>
        <p className="text-lg font-bold text-gray-800 my-2">{product.price}</p>
        <div className="mt-2 space-y-2">
            <button
                onClick={onStartTryOn}
                className="w-full primary-gradient text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-transform transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
                aria-label={`Try on ${product.name}`}
            >
                <CameraIcon className="w-4 h-4" />
                Try On
            </button>
             <button
                onClick={onGetStyleIdeas}
                className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-transform transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
                aria-label={`Get style ideas for ${product.name}`}
            >
                <SparklesIcon className="w-4 h-4" />
                Style Ideas
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;