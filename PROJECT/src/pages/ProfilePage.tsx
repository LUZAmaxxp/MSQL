import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { bookingsAPI, usersAPI } from "../services/api";
import { formatDate, formatPrice } from "../lib/utils";
import {
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  CreditCard,
  Edit3,
  Save,
  Camera,
} from "lucide-react";

interface Booking {
  id: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  room: {
    id: number;
    name: string;
    roomType: string;
    images: string;
  };
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState("bookings");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const response = await bookingsAPI.getMyBookings();
        setUserBookings(response.data);
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          window.location.href = "/login";
        } else {
          setError(err.response?.data?.message || "Error loading bookings");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      const response = await usersAPI.updateProfile(formData);
      updateUser(response.data);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        setUpdateError(
          err.response?.data?.message || "Failed to update profile."
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await bookingsAPI.cancel(id);
      setUserBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "canceled" } : b))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Cancel failed.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "canceled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <img
                src={
                  user?.avatar ||
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAACUCAMAAACa7lTsAAAAZlBMVEX///8dHRsAAACJiYgVFRMaGhj5+fkPDwz8/PwfHxzl5eX29vbMzMylpaXY2Njz8/O4uLiZmZl9fX11dXXExMTS0tKsrKxKSklTU1MGBgBZWVlgYGA9PT1ra2vr6+swMDAoKCeRkZF0mMhfAAAE70lEQVR4nO2c6ZLyKhCGTQdCEs2CGuNCNLn/mzyg4+cyLglkaPHw/JipWcrqtxqapmmYTDwej8fj8Xg8Ho/H4/F4xidOZyvedXw1S7FN+XPiouJruGLNqyLGturPmOZZDcCCJDiSyO8MoM7yKbZlf0JchQep9hcMDmH1hV5OQwHkt1wFAdF93XQuBZNyk8eKA0JEiW3juITPvHsZ2CG2jSOS1vBarvI91F8zrPP1W70KWOfYlo5DT71BsFlX2LaOQV7Ds1j1y8f1F/g4fj9/r0e1+wvyboBeqbjBtteUrPd4/lGcYVtsRvUgl3wNczpwFTs2zMFS8K7AttqALKFDPUyTFbbV+qTbwSNaunjrbsbFB0XoE4nDcSuvNRwsXexs+lEOXJLOgKNbxf1Oy8Eyp97tsW3XogL6dMf/Erpxci2OueaIDhLgLqbUkdAc0TJsiQjbeg1SXQdLwMWleOi24Uawi0vxsH3hNTL32GFbrwEZnEZfoATb+uFMtR2sAPe2TLmZYPeyy5VBzHIyu+zMPMyx7R9MuDERvHHv4GWunWcp2Bzb/sE0ZoIX2PYPxlCwe/Xpxf/Nw2ZzeOPeHDZcljps+wdjsllycru0NBO8xLZ/MHszwQ5WAECvgvcjGNt6DcSbvp1XEIFtvQahScXDvVRaRS19DzsYsyaTArRrPNTBgsdkEjf6hfjGxUL8pNQe0w7WOxTpQTNOk4ODq7BkqplOJ9A52jE+o1phiwYzbMs1KeZaLoa5izH6yFJjFifk4OIifGKqUwVgcxfPSn+ohifURDh5/H+Gs+cXHZ442L0S/DVR3+bwM1A7PKAVAzNq4uLO/5YlvLi+cw91NKm8Ip5kpHfgIsS92t098STiQU/FJOGOT+ATU057KSYBdzSHvifKWA/FhGZf4d8jS2DvgjVzsqzzlKImL7LMJCCsdnbH8JiI18/HtZTrdn71C1WiykPx6L50kDAQXX76n+8iqriAY0vx5U58QgEEr74nWt0SpWXDADaMUAkhAMCaMv1WuUeiIs8akRDGSHtosvyL33i4IZZg2+DxeDwez/cxTWfLcpVl2apcznKNLVCRX31A+uElgbTsFlvRkuNbWawV6ybMyrz3TcIiL7OwWZ8/gLRiu+jKz61jlk3dMpUon97Kktmy+knK3oXl2zsM6UpJPdDzBwQ/H0DauvnIUmbB2w0hNDnvg85be7VJYET+RSxWj0d4ka8WQmpT+TX9dz/z3zeluuWfVh7Yc/q64i53R2qUSnd1x8mpkDO1k4NC/Z6+PkqmkGSfNLKnZf3u+aizuxjcwWifKn1CQJQfE8Dy+cNSxhPNwc2I733SljCYf8hlpqU6MDPpJO0JhfUnFDbjrDXqfR9Awlr8Nz4iDtSKf48QwD6M0W1N0ga7pYkbdUVrKUatYJfW9eL2JVYtsa43IC1a10uh87aQOWyLlWeGg1t0RlKM1C+v02c3Bli9evuF5RXpAiwwHespA4NnHMygCUKk3jdoDlavQdp3cYWoVyq2vjRFer3Qowm23nK717+kMwZ0Y3tM6z7/NhbWE0ztS0ljCbb9SED/Bsq/wfbzRClqyFJY7jPGnsLWJzHuonQUbPcdCN0nK8eD2X1UzeT69zhYvkTens4LLl8C2z/T1qbemNyfmNiHWhU8D9GZ+842j8fj8Xg8Ho/H4/F4PE/4D85TR3u23T2zAAAAAElFTkSuQmCC"
                }
                alt="User Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl backdrop-blur-sm"
              />
              <button className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-blue-100 text-lg flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    activeTab === "bookings"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                      : "hover:bg-gray-50 text-gray-700 hover:translate-x-1"
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">My Bookings</span>
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    activeTab === "profile"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                      : "hover:bg-gray-50 text-gray-700 hover:translate-x-1"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Personal Info</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-500 hover:bg-red-50 transition-all duration-300 hover:translate-x-1"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-800">
                      My Bookings
                    </h2>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                      {error}
                    </div>
                  ) : userBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No bookings yet.</p>
                      <p className="text-gray-400">
                        Start exploring and book your first stay!
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {userBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-64 h-48 md:h-auto">
                              <img
                                src={booking.room.images}
                                alt={booking.room.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                                    {booking.room.name}
                                  </h3>
                                  <p className="text-gray-500 text-sm">
                                    {booking.room.roomType}
                                  </p>
                                </div>
                                <div
                                  className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                                    booking.status
                                  )}`}
                                >
                                  {getStatusIcon(booking.status)}
                                  <span className="capitalize">
                                    {booking.status}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-sm">
                                    {formatDate(booking.checkIn)} →{" "}
                                    {formatDate(booking.checkOut)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span className="text-sm">
                                    {booking.guests} Guests
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <CreditCard className="w-4 h-4" />
                                  <span className="text-sm font-semibold">
                                    {formatPrice(booking.totalPrice)}
                                  </span>
                                </div>
                              </div>

                              {booking.status !== "canceled" && (
                                <button
                                  onClick={() =>
                                    handleCancelBooking(booking.id)
                                  }
                                  className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline transition-colors"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Edit3 className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-800">
                    Edit Profile
                  </h2>
                </div>

                {updateSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <p className="text-emerald-700 font-medium">
                      Profile updated successfully!
                    </p>
                  </div>
                )}

                {updateError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700">{updateError}</p>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4" />
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4" />
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Update Profile
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
