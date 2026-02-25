import React, { useState } from 'react';
import { Product, Outfit } from '../types';
import ProductCard from './ProductCard';
import { topRatedProducts } from '../constants';
import SearchIcon from './icons/SearchIcon';
import StyleIdeasModal from './StyleIdeasModal';
import ProductList from './ProductList';

interface DesktopShopViewProps {
  products: Product[];
  onStartTryOn: (product: Product, outfit?: Outfit) => void;
  userImage: string | null;
  onRequestUserImage: () => void;
}

const VirtualTryOnCTA: React.FC<{ onRequestUserImage: () => void }> = ({ onRequestUserImage }) => (
  <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-200 animate-fade-in">
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-2xl font-bold text-gray-800">✨ Unlock Virtual Try-On</h2>
      <p className="text-gray-600 mt-2">
        See how these clothes look on you! Add a photo to start your personalized fitting room experience.
      </p>
    </div>
    <button
      onClick={onRequestUserImage}
      className="bg-gradient-to-br from-[#A755F7] to-[#F252E3] text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-transform transform hover:scale-105 flex-shrink-0"
    >
      Add Your Photo
    </button>
  </div>
);


const MainBanner: React.FC = () => (
    <div className="relative bg-gray-800 text-white h-full rounded-lg overflow-hidden flex items-center p-8 lg:p-12">
        <img 
            src="https://images.pexels.com/photos/1261422/pexels-photo-1261422.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="Man in a t-shirt"
            className="absolute inset-0 z-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-10 bg-black/40"></div>
        <div className="z-20 relative max-w-sm">
            <h1 className="text-4xl font-bold">Men’s T-Shirts Collection</h1>
            <p className="mt-4 text-gray-200">
                Explore the latest men’s T-shirts. Try them virtually, find your perfect size, and get AI-powered styling tips.
            </p>
            <button className="mt-6 bg-gradient-to-br from-[#A755F7] to-[#F252E3] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-transform transform hover:scale-105">
                Try On Now
            </button>
        </div>
    </div>
);

const SideBanners: React.FC = () => (
    <div className="flex flex-col gap-6 h-full">
        <div className="relative bg-gray-800 text-white p-6 flex-1 rounded-lg overflow-hidden flex flex-col justify-end">
             <img src="https://images.pexels.com/photos/2010877/pexels-photo-2010877.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Women's Summer Fashion" className="absolute inset-0 w-full h-full object-cover"/>
             <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div className="relative z-20">
                <h3 className="text-2xl font-bold">Women’s Fashion – Summer 2025</h3>
                <p className="text-sm text-gray-200 mt-2">Discover this summer’s hottest trends. Mix new arrivals with your own closet and create stunning outfits with Closet AI.</p>
            </div>
        </div>
        <div className="relative bg-gray-800 text-white p-6 flex-1 rounded-lg overflow-hidden flex flex-col justify-end">
             <img src="https://images.pexels.com/photos/4041122/pexels-photo-4041122.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Organized closet" className="absolute inset-0 w-full h-full object-cover"/>
             <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div className="relative z-20">
                <h3 className="text-2xl font-bold">Your Smart Closet</h3>
                <p className="text-sm text-gray-200 mt-2">Upload your real clothes, combine them with new styles, and let AI Stylist create complete outfits just for you.</p>
            </div>
        </div>
    </div>
);

const Sidebar: React.FC = () => (
    <aside className="space-y-8">
        <div className="relative">
            <input type="text" placeholder="Search products..." className="w-full border border-gray-300 rounded-md py-2 px-4 focus:ring-2 focus:ring-purple-400 focus:border-transparent"/>
            <SearchIcon className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400"/>
        </div>

        <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Filter by price</h3>
            <input type="range" min="10" max="500" defaultValue="250" className="w-full accent-[#A755F7]" />
            <div className="flex justify-between items-center mt-2">
                <button className="bg-gradient-to-br from-[#A755F7] to-[#F252E3] text-white font-semibold text-sm py-2 px-5 rounded-lg hover:opacity-90">Filter</button>
                <span className="text-gray-600 text-sm">Price: £10 — £500</span>
            </div>
        </div>

        <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Top rated products</h3>
            <div className="space-y-4">
                {topRatedProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-4">
                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                        <div>
                            <p className="font-semibold text-gray-700">{product.name}</p>
                            <p className="font-bold text-gray-800">{product.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </aside>
);

const DesktopShopView: React.FC<DesktopShopViewProps> = ({ 
    products, 
    onStartTryOn, 
    userImage, 
    onRequestUserImage,
 }) => {
    const [styleIdeasProduct, setStyleIdeasProduct] = useState<Product | null>(null);

    const handleGetStyleIdeas = (product: Product) => {
        setStyleIdeasProduct(product);
    };

    const handleCloseModal = () => {
        setStyleIdeasProduct(null);
    };

    const handleStartTryOnFromModal = (product: Product, outfit?: Outfit) => {
        setStyleIdeasProduct(null);
        onStartTryOn(product, outfit);
    };

  return (
    <div className="animate-fade-in">
        {/* NEW: CTA to add user image */}
        {!userImage && <VirtualTryOnCTA onRequestUserImage={onRequestUserImage} />}

        {/* Top Section: Banners */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[400px]">
            <div className="lg:col-span-2">
                <MainBanner />
            </div>
            <div>
                <SideBanners />
            </div>
        </section>

        {/* Bottom Section: Products and Sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
                {/* Sorting and Results Count */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 border border-gray-200 rounded-lg text-sm">
                   <p className="text-gray-600">Showing 1–{Math.min(products.length, 9)} of {products.length} results</p>
                   <select className="border border-gray-300 rounded-md p-2 bg-gray-50 focus:ring-1 focus:ring-purple-400">
                        <option>Default sorting</option>
                        <option>Sort by popularity</option>
                        <option>Sort by price: low to high</option>
                        <option>Sort by price: high to low</option>
                   </select>
                </div>
                {/* Product Grid */}
                <ProductList
                    products={products.slice(0, 9)}
                    onStartTryOn={onStartTryOn}
                    onGetStyleIdeas={handleGetStyleIdeas}
                />
            </div>

            {/* Sidebar */}
            <aside>
                <Sidebar />
            </aside>
        </section>

        {styleIdeasProduct && (
            <StyleIdeasModal
                product={styleIdeasProduct}
                onClose={handleCloseModal}
                onStartTryOn={handleStartTryOnFromModal}
                userImage={userImage}
                onRequestUserImage={onRequestUserImage}
            />
        )}
    </div>
  );
};

export default DesktopShopView;
