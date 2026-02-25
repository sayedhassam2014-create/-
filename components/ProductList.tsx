
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onStartTryOn: (product: Product) => void;
  onGetStyleIdeas: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onStartTryOn, onGetStyleIdeas }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onStartTryOn={() => onStartTryOn(product)}
          onGetStyleIdeas={() => onGetStyleIdeas(product)}
        />
      ))}
    </div>
  );
};

export default ProductList;