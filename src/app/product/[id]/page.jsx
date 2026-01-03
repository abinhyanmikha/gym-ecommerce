'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/context/CartContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Products
      </Link>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-[400px] md:h-[500px] relative bg-gray-100">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          </div>
          
          <div className="p-8 flex flex-col justify-center">
            <div className="mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between mb-8 border-t border-b border-gray-100 py-6">
              <div>
                <span className="text-sm text-gray-500 block mb-1">Price</span>
                <span className="text-3xl font-bold text-blue-600">${product.price}</span>
              </div>
              
              <div className="text-right">
                <span className="text-sm text-gray-500 block mb-1">Availability</span>
                {product.stock > 0 ? (
                  <span className={`font-semibold ${product.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                    {product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock'}
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold">Out of Stock</span>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center transition-colors ${
                product.stock === 0 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <ShoppingCart size={24} className="mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            {user?.role === 'admin' && (
               <Link href="/admin" className="mt-4 block text-center text-gray-500 hover:text-gray-800 text-sm underline">
                 Manage Product in Admin Dashboard
               </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
