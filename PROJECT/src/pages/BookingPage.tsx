import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { CreditCard, Calendar, Users, Check } from 'lucide-react';
import { roomsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/utils';
import DateRangePicker from '../components/ui/DateRangePicker';

interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  roomType: string;
  amenities: string[];
  images: string;
  isAvailable: boolean;
  averageRating?: number;
  reviewCount?: number;
}

const BookingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    guests: 1,
    specialRequests: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: addDays(new Date(), 3),
  });

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        navigate('/rooms');
        return;
      }

      try {
        const response = await roomsAPI.getById(parseInt(roomId));
        setRoom(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch room details. Please try again later.');
        if (err.response?.status === 404) {
          navigate('/rooms');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range);
  };

  const calculateTotal = () => {
    if (!dateRange || !room) return { nights: 0, total: 0, fees: 0 };
    
    const diffTime = Math.abs(dateRange.endDate.getTime() - dateRange.startDate.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const roomTotal = nights * room.price;
    const fees = nights * 10; // Service fee
    
    return { nights, roomTotal, fees, total: roomTotal + fees };
  };

  const { nights, roomTotal, fees, total } = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room || !user) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const bookingData = {
        roomId: room.id,
        checkIn: format(dateRange.startDate, 'yyyy-MM-dd'),
        checkOut: format(dateRange.endDate, 'yyyy-MM-dd'),
        guests: formData.guests,
        specialRequests: formData.specialRequests,
        totalPrice: total,
      };

      await bookingsAPI.create(bookingData);
      setShowSuccess(true);
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again later.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <div className="container-custom">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              </div>
              <div>
                <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="py-24">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-xl shadow-elegant">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display mb-4">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your booking. You will receive a confirmation email shortly with all the details.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex justify-between mb-3">
                <span className="font-medium">Room:</span>
                <span>{room?.name}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="font-medium">Check-in:</span>
                <span>{format(dateRange.startDate, 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="font-medium">Check-out:</span>
                <span>{format(dateRange.endDate, 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between font-semibold pt-3 border-t border-gray-200">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Redirecting you to your profile page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="py-24">
      <div className="container-custom">
        <h1 className="text-3xl font-display mb-8 text-center">Complete Your Booking</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dates and Guests */}
              <div className="bg-white p-6 rounded-xl shadow-elegant">
                <h2 className="text-xl font-medium mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Dates and Guests
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stay Dates
                    </label>
                    <DateRangePicker 
                      onRangeChange={handleDateRangeChange}
                      initialRange={dateRange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    >
                      {Array.from({ length: room.capacity }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Guest Details */}
              <div className="bg-white p-6 rounded-xl shadow-elegant">
                <h2 className="text-xl font-medium mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary-600" />
                  Guest Details
                </h2>
                
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
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Any special requests or requirements?"
                  />
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="bg-white p-6 rounded-xl shadow-elegant">
                <h2 className="text-xl font-medium mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                  Payment Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-primary-700'
                }`}
              >
                {isSubmitting ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </button>
            </form>
          </div>
          
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-elegant sticky top-24">
              <h2 className="text-xl font-medium mb-6">Booking Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Type</span>
                  <span className="font-medium">{room.roomType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{format(dateRange.startDate, 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{format(dateRange.endDate, 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{nights}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{formData.guests}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Price</span>
                    <span>{formatPrice(roomTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span>{formatPrice(fees)}</span>
                  </div>
                  
                  <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;