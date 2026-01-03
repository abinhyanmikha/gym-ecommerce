'use client';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product, isAdmin, onEdit, onDelete }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/product/${product._id}`}>
        <div className="relative h-48 w-full cursor-pointer">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <Link href={`/product/${product._id}`} className="hover:text-blue-600 transition-colors">
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
            </Link>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{product.category}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">${product.price}</span>
          {isAdmin ? (
            <div className="flex space-x-2">
              <button 
                onClick={() => onEdit && onEdit(product)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete && onDelete(product._id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              <ShoppingCart size={18} /> Add
            </button>
          )}
        </div>
        {product.stock <= 5 && product.stock > 0 && (
             <p className="text-red-500 text-xs mt-2">Only {product.stock} left in stock!</p>
        )}
        {product.stock === 0 && (
             <p className="text-red-500 text-xs mt-2">Out of stock</p>
        )}
      </div>
    </div>
  );
}
