"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";

export default function UserDashboard() {
  const { user, setUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/orders/my-orders");
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdating(true);
    try {
      const { data } = await axios.put("/api/users/profile", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (data.success) {
        toast.success("Profile updated successfully");
        // Update local user state if needed, though useAuth might need a refresh mechanism
        // For now, we manually update the user object in context if possible, or just the form
        // Since useAuth provides setUser, we can update it!
        setUser({ ...user, name: data.user.name, email: data.user.email });
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeliveryConfirm = async (orderId) => {
    if (!confirm("Are you sure you have received this order?")) return;

    try {
      const { data } = await axios.put(`/api/orders/${orderId}/delivery`);
      if (data.success) {
        toast.success("Order marked as delivered");
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

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Dashboard</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 relative">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Account Information</h2>
          <button
            onClick={handleEditClick}
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

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Order History</h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">
            You haven't placed any orders yet.
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
          {orders.map((order) => (
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
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Edit Profile
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
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
                  value={formData.email}
                  onChange={handleInputChange}
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
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                />
              </div>
              {formData.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
