'use client';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <XCircle size={64} className="text-red-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
      <p className="text-gray-600 mb-8">Your payment could not be processed. Please try again.</p>
      <Link href="/cart" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Return to Cart
      </Link>
    </div>
  );
}
