'use client';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { User as UserIcon, LogOut, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, setUser } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    try {
       await axios.post('/api/auth/logout');
       setUser(null);
       toast.success('Logged out successfully');
       router.push('/login');
    } catch (error) {
        console.error('Logout failed', error);
    }
  };

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-400">GymEcom</Link>
        <div className="flex items-center space-x-6">
          <Link href="/cart" className="relative hover:text-blue-300 transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="hover:text-blue-300 font-semibold">Admin Dashboard</Link>
              )}
              <span className="flex items-center gap-2 text-gray-300">
                <UserIcon size={18} /> {user.name}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-400 transition-colors">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-300 transition-colors">Login</Link>
              <Link href="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
