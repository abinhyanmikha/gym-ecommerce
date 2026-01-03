"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "@/components/ProductCard";
import toast from "react-hot-toast";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products");
      setProducts(data);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="relative bg-slate-800 text-white rounded-xl p-12 mb-10 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Elevate Your Fitness Journey
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Premium gym equipment for your home and commercial gym. Quality gear
            for serious athletes.
          </p>
          <a
            href="#products"
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            Shop Now
          </a>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 bg-gradient-to-l from-blue-500 to-transparent"></div>
      </div>

      <h2 id="products" className="text-2xl font-bold mb-6 text-gray-800">
        Featured Products
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
