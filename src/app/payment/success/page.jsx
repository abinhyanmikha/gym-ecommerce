'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  
  const data = searchParams.get('data');

  useEffect(() => {
    if (!data) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        await axios.post('/api/payment/verify', { data });
        setStatus('success');
        clearCart(); // Clear cart on successful payment
      } catch (error) {
        console.error('Verification failed', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [data]);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Verifying Payment...</h2>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <XCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Verification Failed</h1>
        <p className="text-gray-600 mb-8">There was an issue verifying your payment. Please contact support.</p>
        <Link href="/cart" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <CheckCircle size={64} className="text-green-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been confirmed.</p>
      <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Continue Shopping
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
