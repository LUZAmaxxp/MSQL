import { useState, useEffect } from 'react';
import { 
  Search, FilterX, ArrowUpDown, 
  Check, X, Eye, Calendar, Loader2
} from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';

interface Booking {
  id: number;
  roomId: number;
  userId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  createdAt: string;
  room: {
    id: number;
    name: string;
    roomType: string;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingsAPI.getAll();
      setBookings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortField(null);
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (id: number, newStatus: 'confirmed' | 'canceled' | 'completed') => {
    try {
      setIsUpdating(true);
      await bookingsAPI.updateStatus(id, newStatus);
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === id ? { ...booking, status: newStatus } : booking
        )
      );
      
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update booking status. Please try again later.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      `${booking.user.firstName} ${booking.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (!sortField) return 0;
    
    let comparison = 0;
    
    switch (sortField) {
      case 'guest':
        comparison = `${a.user.firstName} ${a.user.lastName}`.localeCompare(`${b.user.firstName} ${b.user.lastName}`);
        break;
      case 'room':
        comparison = a.room.name.localeCompare(b.room.name);
        break;
      case 'checkIn':
        comparison = new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
        break;
      case 'price':
        comparison = a.totalPrice - b.totalPrice;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="py-24">
        <div className="container-custom">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
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
        <div className="mb-8">
          <h1 className="text-3xl font-display">Manage Bookings</h1>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-elegant p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="canceled">Canceled</option>
                <option value="completed">Completed</option>
              </select>
              
              <button
                onClick={resetFilters}
                className="flex items-center text-gray-600 hover:text-primary-600 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FilterX size={18} className="mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('guest')}>
                    <div className="flex items-center">
                      Guest
                      {sortField === 'guest' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('room')}>
                    <div className="flex items-center">
                      Room
                      {sortField === 'room' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('checkIn')}>
                    <div className="flex items-center">
                      Check In
                      {sortField === 'checkIn' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3">Guests</th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('price')}>
                    <div className="flex items-center">
                      Total
                      {sortField === 'price' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('created')}>
                    <div className="flex items-center">
                      Created
                      {sortField === 'created' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                          {booking.user.avatar ? (
                            <img 
                              src={booking.user.avatar} 
                              alt={`${booking.user.firstName} ${booking.user.lastName}`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                              {booking.user.firstName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{`${booking.user.firstName} ${booking.user.lastName}`}</div>
                          <div className="text-sm text-gray-500">{booking.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{booking.room.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{booking.room.roomType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <div>
                          <div>{formatDate(booking.checkIn)}</div>
                          <div className="text-sm text-gray-500">{formatDate(booking.checkOut)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{booking.guests} {booking.guests > 1 ? 'guests' : 'guest'}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(booking.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'canceled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(booking.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleViewBooking(booking)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {booking.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              disabled={isUpdating}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                              title="Confirm Booking"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'canceled')}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Cancel Booking"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                            disabled={isUpdating}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            title="Mark as Completed"
                          >
                            <Check size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedBookings.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500">No bookings found. Try adjusting your search.</p>
            </div>
          )}

          <div className="px-6 py-4 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {sortedBookings.length} of {bookings.length} bookings
            </p>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium mb-4">Booking Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Guest Information</h4>
                        <div className="mt-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                              {selectedBooking.user.avatar ? (
                                <img 
                                  src={selectedBooking.user.avatar} 
                                  alt={`${selectedBooking.user.firstName} ${selectedBooking.user.lastName}`} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                  {selectedBooking.user.firstName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{`${selectedBooking.user.firstName} ${selectedBooking.user.lastName}`}</div>
                              <div className="text-sm text-gray-500">{selectedBooking.user.email}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Room Information</h4>
                        <div className="mt-2">
                          <div className="font-medium">{selectedBooking.room.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{selectedBooking.room.roomType}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Booking Details</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Check In</span>
                            <span>{formatDate(selectedBooking.checkIn)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Check Out</span>
                            <span>{formatDate(selectedBooking.checkOut)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Guests</span>
                            <span>{selectedBooking.guests} {selectedBooking.guests > 1 ? 'guests' : 'guest'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Price</span>
                            <span className="font-medium">{formatPrice(selectedBooking.totalPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              selectedBooking.status === 'canceled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created At</span>
                            <span>{formatDate(selectedBooking.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedBooking.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                      disabled={isUpdating}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Confirming...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'canceled')}
                      disabled={isUpdating}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Canceling...
                        </>
                      ) : (
                        'Cancel Booking'
                      )}
                    </button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                    disabled={isUpdating}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      'Mark as Completed'
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;