import { useState, useEffect } from 'react';
import { Edit, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, usersAPI } from '../services/api';
import { formatDate, formatPrice } from '../lib/utils';

interface Booking {
  id: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  specialRequests?: string;
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
  const [activeTab, setActiveTab] = useState('bookings');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) return;

      try {
        const response = await bookingsAPI.getMyBookings();
        setUserBookings(response.data);
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          window.location.href = "/login";
        } else {
          setError(err.response?.data?.message || 'Failed to fetch bookings. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBookings();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      const response = await usersAPI.updateProfile(formData);
      updateUser(response.data);
      setUpdateSuccess(true);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        setUpdateError(err.response?.data?.message || 'Failed to update profile. Please try again later.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingsAPI.cancel(bookingId);
      // Update the local bookings state
      setUserBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'canceled' }
            : booking
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking. Please try again later.');
    }
  };

  return (
    <div className="py-24">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-1/4">
              <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
                <div className="bg-primary-600 text-white p-6 text-center">
                  <div className="relative w-24 h-24 rounded-full bg-white mx-auto mb-4 overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={`${user.firstName} ${user.lastName}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-medium">
                        {user?.firstName?.charAt(0)}
                      </div>
                    )}
                    <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md">
                      <Edit size={14} className="text-primary-600" />
                    </button>
                  </div>
                  <h2 className="text-xl font-medium">{`${user?.firstName} ${user?.lastName}`}</h2>
                  <p className="text-primary-100">{user?.email}</p>
                </div>
                
                <div className="p-4">
                  <nav>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className={`flex items-center justify-between w-full p-3 rounded-lg text-left ${
                        activeTab === 'bookings' 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>My Bookings</span>
                      <ChevronRight size={16} />
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`flex items-center justify-between w-full p-3 rounded-lg text-left ${
                        activeTab === 'profile' 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>Personal Information</span>
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={logout}
                      className="flex items-center text-gray-700 hover:text-red-600 p-3 w-full"
                    >
                      <LogOut size={16} className="mr-2" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-3/4">
              {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <h2 className="text-2xl font-medium mb-6">My Bookings</h2>
                  
                  {isLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map(index => (
                        <div key={index} className="bg-white rounded-xl shadow-elegant p-6 animate-pulse">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/4">
                              <div className="w-full h-32 bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="w-full md:w-3/4 space-y-4">
                              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userBookings.length > 0 ? (
                    <div className="space-y-6">
                      {userBookings.map(booking => (
                        <div key={booking.id} className="bg-white rounded-xl shadow-elegant overflow-hidden">
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="w-full md:w-1/4">
                                <img
                                  src={booking.room.images}
                                  alt={booking.room.name}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              </div>
                              
                              <div className="w-full md:w-3/4">
                                <div className="flex flex-wrap justify-between mb-2">
                                  <h3 className="text-lg font-medium">{booking.room.name}</h3>
                                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    booking.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                                  <div>
                                    <p className="text-gray-500">Check-in</p>
                                    <p className="font-medium">{formatDate(booking.checkIn)}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-gray-500">Check-out</p>
                                    <p className="font-medium">{formatDate(booking.checkOut)}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-gray-500">Guests</p>
                                    <p className="font-medium">{booking.guests}</p>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <p className="font-medium text-primary-600">
                                    {formatPrice(booking.totalPrice)}
                                  </p>
                                  
                                  <div className="space-x-2">
                                    {booking.status !== 'canceled' && booking.status !== 'completed' && (
                                      <button 
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="btn-outline px-3 py-1.5 text-sm rounded-md border border-red-500 text-red-500 hover:bg-red-50"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-elegant p-8 text-center">
                      <h3 className="text-xl font-medium mb-2">No bookings yet</h3>
                      <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start exploring our rooms!</p>
                      <a href="/rooms" className="btn-primary px-6 py-2 rounded-lg inline-block">
                        Browse Rooms
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-medium mb-6">Personal Information</h2>
                  
                  {updateSuccess && (
                    <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                      Profile updated successfully!
                    </div>
                  )}

                  {updateError && (
                    <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                      {updateError}
                    </div>
                  )}
                  
                  <div className="bg-white rounded-xl shadow-elegant p-6">
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
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
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button 
                          type="submit" 
                          disabled={isUpdating}
                          className={`btn-primary px-6 py-2 rounded-lg ${
                            isUpdating ? 'opacity-75 cursor-not-allowed' : ''
                          }`}
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;