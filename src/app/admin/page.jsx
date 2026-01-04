"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ProductCard from "@/components/ProductCard";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Plus,
  Package,
  Users,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user, setUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Profile Edit State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Product Form state
  const [productFormData, setProductFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
  });

  // User Form state
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
      fetchUsers();
      fetchOrders();
      fetchMyOrders();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products");
      setProducts(data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/users");
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/orders");
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    }
  };

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/orders/my-orders");
      setMyOrders(data);
    } catch (error) {
      console.error("Failed to fetch my orders", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products/${id}`);
        setProducts(products.filter((p) => p._id !== id));
        toast.success("Product deleted");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
        toast.success("User deleted");
      } catch (error) {
        toast.error("Failed to delete user");
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
      stock: product.stock,
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingItem(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't show password
      role: user.role,
    });
    setIsUserModalOpen(true);
  };

  const handleCreateProduct = () => {
    setEditingItem(null);
    setProductFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      stock: "",
    });
    setIsModalOpen(true);
  };

  const handleCreateUser = () => {
    setEditingItem(null);
    setUserFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
    setIsUserModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { data } = await axios.put(
          `/api/products/${editingItem._id}`,
          productFormData
        );
        setProducts(
          products.map((p) => (p._id === editingItem._id ? data : p))
        );
        toast.success("Product updated");
      } else {
        const { data } = await axios.post("/api/products", productFormData);
        setProducts([data, ...products]);
        toast.success("Product created");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { data } = await axios.put(
          `/api/users/${editingItem._id}`,
          userFormData
        );
        setUsers(users.map((u) => (u._id === editingItem._id ? data : u)));
        toast.success("User updated");
      } else {
        const { data } = await axios.post("/api/users", userFormData);
        setUsers([data, ...users]);
        toast.success("User created");
      }
      setIsUserModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  // Profile Update Logic
  const handleEditProfileClick = () => {
    setProfileFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
    });
    setIsProfileModalOpen(true);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (
      profileFormData.password &&
      profileFormData.password !== profileFormData.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { data } = await axios.put("/api/users/profile", {
        name: profileFormData.name,
        email: profileFormData.email,
        password: profileFormData.password,
      });

      if (data.success) {
        toast.success("Profile updated successfully");
        setUser({ ...user, name: data.user.name, email: data.user.email });
        setIsProfileModalOpen(false);
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeliveryConfirm = async (orderId) => {
    if (!confirm("Are you sure you have received this order?")) return;

    try {
      const { data } = await axios.put(`/api/orders/${orderId}/delivery`);
      if (data.success) {
        toast.success("Order marked as delivered");
        setMyOrders(
          myOrders.map((o) =>
            o._id === orderId ? { ...o, deliveryStatus: "delivered" } : o
          )
        );
        // Also update main orders list if present
        setOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, deliveryStatus: "delivered" } : o
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const handleAdminDeliveryUpdate = async (orderId, nextStatus) => {
    const allowed = ["pending", "in_progress", "delivered"];
    if (!allowed.includes(nextStatus)) {
      toast.error("Invalid delivery status");
      return;
    }
    try {
      const { data } = await axios.put(`/api/orders/${orderId}/delivery`, {
        deliveryStatus: nextStatus,
      });
      if (data.success) {
        toast.success("Delivery status updated");
        setOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, deliveryStatus: nextStatus } : o
          )
        );
        setMyOrders(
          myOrders.map((o) =>
            o._id === orderId ? { ...o, deliveryStatus: nextStatus } : o
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  if (authLoading || !user || user.role !== "admin") {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "products"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Package size={20} /> Products
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "users"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Users size={20} /> Users
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "orders"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ShoppingBag size={20} /> All Orders
        </button>
        <button
          onClick={() => setActiveTab("my-profile")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "my-profile"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <UserIcon size={30} /> My Profile & Orders
        </button>
      </div>

      {activeTab === "products" && (
        <div>
          <button
            onClick={handleCreateProduct}
            className="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus size={20} className="mr-2" /> Add New Product
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
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
      )}

      {activeTab === "users" && (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
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

      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{order.user?.name || "Unknown"}</div>
                      <div className="text-xs text-gray-400">
                        {order.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      NPR {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.deliveryStatus || "pending"}
                        onChange={(e) =>
                          handleAdminDeliveryUpdate(order._id, e.target.value)
                        }
                        className="text-sm border rounded px-2 py-1 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.paymentDetails ? (
                        <div className="text-xs">
                          <div>
                            <span className="font-semibold">Ref ID:</span>{" "}
                            {order.esewaRefId || "N/A"}
                          </div>
                          {/* <pre className="mt-1 bg-gray-100 p-1 rounded max-w-xs overflow-auto">{JSON.stringify(order.paymentDetails, null, 2)}</pre> */}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No details</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "my-profile" && (
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 relative">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Account Information</h2>
              <button
                onClick={handleEditProfileClick}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
              >
                <Pencil size={16} /> Edit Profile
              </button>
            </div>

            <p className="text-gray-600 mb-2">
              <span className="font-medium">Name:</span> {user?.name}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            My Order History
          </h2>

          {myOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">
                You haven&apos;t placed any orders yet.
              </p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {myOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow overflow-hidden border border-gray-100"
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Placed</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium text-green-600">
                        NPR {order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${
                            order.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivery</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            order.deliveryStatus === "delivered"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {order.deliveryStatus === "in_progress"
                            ? "In Progress"
                            : order.deliveryStatus === "delivered"
                            ? "Delivered"
                            : "Pending"}
                        </span>
                        {order.deliveryStatus === "in_progress" && (
                          <button
                            onClick={() => handleDeliveryConfirm(order._id)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            Mark Received
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {order.products.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                No Img
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              <Link
                                href={`/product/${item.product?._id || "#"}`}
                                className="hover:text-blue-600"
                              >
                                {item.name}
                              </Link>
                            </h4>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × NPR {item.price}
                            </p>
                          </div>
                          <div className="font-medium text-gray-900">
                            NPR {item.quantity * item.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={productFormData.name}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    name: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-black"
                required
              />
              <textarea
                placeholder="Description"
                value={productFormData.description}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={productFormData.price}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    price: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                value={productFormData.image}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    image: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={productFormData.category}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    category: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={productFormData.stock}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    stock: e.target.value,
                  })
                }
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
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? "Edit User" : "Add User"}
            </h2>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={userFormData.name}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, name: e.target.value })
                }
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userFormData.email}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, email: e.target.value })
                }
                className="w-full p-2 border rounded text-black"
                required
              />
              <input
                type="password"
                placeholder={
                  editingItem
                    ? "Leave blank to keep current password"
                    : "Password"
                }
                value={userFormData.password}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, password: e.target.value })
                }
                className="w-full p-2 border rounded text-black"
                required={!editingItem}
              />
              <select
                value={userFormData.role}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, role: e.target.value })
                }
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

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Edit Profile
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileFormData.name}
                  onChange={handleProfileInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={handleProfileInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={profileFormData.password}
                  onChange={handleProfileInputChange}
                  placeholder="Leave blank to keep current"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                />
              </div>
              {profileFormData.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={profileFormData.confirmPassword}
                    onChange={handleProfileInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
