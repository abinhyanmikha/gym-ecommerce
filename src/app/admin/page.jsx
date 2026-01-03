'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Product Form state
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: ''
  });

  // User Form state
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
      fetchUsers();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/users');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
        toast.success('Product deleted');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        toast.success('User deleted');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingItem(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingItem(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      role: user.role
    });
    setIsUserModalOpen(true);
  };

  const handleCreateProduct = () => {
    setEditingItem(null);
    setProductFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        stock: ''
    });
    setIsModalOpen(true);
  };

  const handleCreateUser = () => {
    setEditingItem(null);
    setUserFormData({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });
    setIsUserModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { data } = await axios.put(`/api/products/${editingItem._id}`, productFormData);
        setProducts(products.map(p => p._id === editingItem._id ? data : p));
        toast.success('Product updated');
      } else {
        const { data } = await axios.post('/api/products', productFormData);
        setProducts([data, ...products]);
        toast.success('Product created');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { data } = await axios.put(`/api/users/${editingItem._id}`, userFormData);
        setUsers(users.map(u => u._id === editingItem._id ? data : u));
        toast.success('User updated');
      } else {
        const { data } = await axios.post('/api/users', userFormData);
        setUsers([data, ...users]);
        toast.success('User created');
      }
      setIsUserModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          Users
        </button>
      </div>

      {activeTab === 'products' ? (
        <div>
          <button 
            onClick={handleCreateProduct}
            className="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus size={20} className="mr-2" /> Add New Product
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                isAdmin={true}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button 
            onClick={handleCreateUser}
            className="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus size={20} className="mr-2" /> Add New User
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={productFormData.name}
                onChange={e => setProductFormData({...productFormData, name: e.target.value})}
                className="w-full p-2 border rounded text-black"
                required
              />
              <textarea
                placeholder="Description"
                value={productFormData.description}
                onChange={e => setProductFormData({...productFormData, description: e.target.value})}
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={productFormData.price}
                onChange={e => setProductFormData({...productFormData, price: e.target.value})}
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                value={productFormData.image}
                onChange={e => setProductFormData({...productFormData, image: e.target.value})}
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={productFormData.category}
                onChange={e => setProductFormData({...productFormData, category: e.target.value})}
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={productFormData.stock}
                onChange={e => setProductFormData({...productFormData, stock: e.target.value})}
                className="w-full p-2 border rounded text-black"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={userFormData.name}
                onChange={e => setUserFormData({...userFormData, name: e.target.value})}
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userFormData.email}
                onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="password"
                placeholder={editingItem ? "Leave blank to keep current password" : "Password"}
                value={userFormData.password}
                onChange={e => setUserFormData({...userFormData, password: e.target.value})}
                className="w-full p-2 border rounded text-black"
                required={!editingItem}
              />
              <select
                value={userFormData.role}
                onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                className="w-full p-2 border rounded text-black"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
