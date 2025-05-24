import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Bed,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Eye,
  Settings,
} from "lucide-react";
import { adminAPI } from "../../services/api";
import { formatPrice } from "../../lib/utils";

interface DashboardStats {
  totalBookings: number;
  totalRooms: number;
  totalUsers: number;
  totalRevenue: number;
  occupancyRate: number;
  pendingBookings: number;
  recentBookings: Array<{
    id: number;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
    } | null;
    room: {
      id: number;
      name: string;
      roomType: string;
    } | null;
  }>;
}

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRooms: 0,
    totalUsers: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    pendingBookings: 0,
    recentBookings: [],
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await adminAPI.getDashboard();
        console.log("Dashboard stats response:", response.data);
        setStats(response.data);
      
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          window.location.href = "/login";
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to fetch dashboard statistics. Please try again later."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
            <div className="h-80 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24">
        <div className="container-custom">
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display">Admin Dashboard</h1>
          <div className="flex space-x-3">
            <button className="btn-secondary flex items-center">
              <Settings size={16} className="mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-elegant p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Calendar className="text-blue-600 h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Bookings</p>
                <h3 className="text-2xl font-semibold">
                  {stats.totalBookings}
                </h3>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-500 font-medium">12%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-elegant p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <DollarSign className="text-green-600 h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-semibold">
                  {formatPrice(stats.totalRevenue)}
                </h3>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-500 font-medium">8%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-elegant p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <Users className="text-purple-600 h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <h3 className="text-2xl font-semibold">{stats.totalUsers}</h3>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-500 font-medium">5%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-elegant p-6">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-lg mr-4">
                <Bed className="text-amber-600 h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Occupancy Rate</p>
                <h3 className="text-2xl font-semibold">
                  {stats.occupancyRate}%
                </h3>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-500 font-medium">3%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-elegant p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Recent Bookings</h2>
            <Link
              to="/admin/bookings"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm">
                  <th className="pb-4">Guest</th>
                  <th className="pb-4">Room</th>
                  <th className="pb-4">Check In</th>
                  <th className="pb-4">Check Out</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((booking) => {
                  // Safe access to user and room data with fallbacks
                  const user = booking.user || {
                    firstName: "Unknown",
                    lastName: "User",
                    avatar: null,
                  };
                  const room = booking.room || {
                    name: "Unknown Room",
                    roomType: "Standard",
                  };

                  return (
                    <tr key={booking.id} className="border-t border-gray-100">
                      <td className="py-4 pr-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  target.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex items-center justify-center text-gray-500 text-sm ${
                                user.avatar ? "hidden" : ""
                              }`}
                            >
                              {user.firstName?.charAt(0) || "U"}
                            </div>
                          </div>
                          <span>{`${user.firstName} ${user.lastName}`}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div>
                          <div className="font-medium">{room.name}</div>
                          <div className="text-sm text-gray-500">
                            {room.roomType}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        {booking.checkIn
                          ? new Date(booking.checkIn).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-4 pr-4">
                        {booking.checkOut
                          ? new Date(booking.checkOut).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-4 pr-4 font-medium">
                        {formatPrice(booking.totalPrice || 0)}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "canceled" ||
                                booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {booking.status
                            ? booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>
                      <td className="py-4">
                        <Link
                          to={`/admin/bookings/${booking.id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {stats.recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No recent bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Room Availability and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white rounded-xl shadow-elegant p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Room Availability</h2>
              <Link
                to="/admin/rooms"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                Manage Rooms
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {stats.recentBookings.slice(0, 5).map((booking) => {
                const room = booking.room || {
                  name: "Unknown Room",
                  roomType: "Standard",
                };

                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{room.name}</h4>
                      <p className="text-sm text-gray-600">{room.roomType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {booking.checkIn && booking.checkOut
                          ? `${new Date(
                              booking.checkIn
                            ).toLocaleDateString()} - ${new Date(
                              booking.checkOut
                            ).toLocaleDateString()}`
                          : "Dates not available"}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "canceled" ||
                              booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {booking.status
                          ? booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {stats.recentBookings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No room availability data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
