import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Maximize,
  Bed,
  ChevronRight,
  ChevronLeft,
  Wifi,
  AirVent,
  Car,
  SwimmingPool,
  Dumbbell,
  Tv,
  Coffee,
  Utensils,
  Snowflake,
  Shower,
} from "lucide-react";
import { formatPrice } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import DateRangePicker from "../components/ui/DateRangePicker";
import { bookingsAPI, roomsAPI } from "../services/api";
import { toast } from "react-toastify";

interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size?: number;
  bedType?: string;
  images: string[];
  amenities: string[];
}

const amenityIcons: Record<string, JSX.Element> = {
  WiFi: <Wifi size={18} className="text-primary-600 mr-2" />,
  "Air Conditioning": <AirVent size={18} className="text-primary-600 mr-2" />,
  Parking: <Car size={18} className="text-primary-600 mr-2" />,
  Pool: <SwimmingPool size={18} className="text-primary-600 mr-2" />,
  Gym: <Dumbbell size={18} className="text-primary-600 mr-2" />,
  TV: <Tv size={18} className="text-primary-600 mr-2" />,
  "Coffee Maker": <Coffee size={18} className="text-primary-600 mr-2" />,
  Restaurant: <Utensils size={18} className="text-primary-600 mr-2" />,
  "Mini Bar": <Coffee size={18} className="text-primary-600 mr-2" />,
  Heating: <Snowflake size={18} className="text-primary-600 mr-2" />,
  "Private Bathroom": <Shower size={18} className="text-primary-600 mr-2" />,
};

const RoomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await roomsAPI.getById(Number(id));
        setRoom(response.data);
      } catch (err: any) {
        console.error("API Error:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load room details";
        setError(errorMessage);
        toast.error(errorMessage);

        if (err.response?.status === 404) {
          navigate("/rooms");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoomDetails();
    } else {
      setError("Invalid room ID");
      setLoading(false);
    }
  }, [id, navigate]);

  const handlePrevImage = () => {
    if (!room?.images || room.images.length === 0) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? room.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    if (!room?.images || room.images.length === 0) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === room.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range);
  };

  const calculateTotalPrice = () => {
    if (!dateRange || !room) return { nights: 0, total: 0 };

    const diffTime = Math.abs(
      dateRange.endDate.getTime() - dateRange.startDate.getTime()
    );
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const total = nights * room.price;

    return { nights, total };
  };

  const { nights, total } = calculateTotalPrice();

  const handleBookNow = async () => {
    if (!room || !dateRange) return;

    if (!isAuthenticated) {
      toast.error("Please sign in to book a room");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (dateRange.endDate <= dateRange.startDate) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    try {
      setIsBooking(true);

      const bookingData = {
        roomId: room.id,
        checkInDate: dateRange.startDate.toISOString(),
        checkOutDate: dateRange.endDate.toISOString(),
        guests,
      };

      const response = await bookingsAPI.create(bookingData);

      toast.success("Booking successful!");
      navigate("/bookings/my-bookings", {
        state: {
          booking: response.data,
          room: room,
          dates: dateRange,
        },
      });
    } catch (err: any) {
      console.error("Booking Error:", err);

      let errorMessage = "Booking failed. Please try again.";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Invalid dates selected";
        } else if (err.response.status === 409) {
          errorMessage = "Room not available for selected dates";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Loading room details...</p>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/rooms")}
            className="btn-primary px-4 py-2"
          >
            Browse All Rooms
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container-custom py-12 text-center">
        <p className="text-gray-600">Room not found</p>
        <button
          onClick={() => navigate("/rooms")}
          className="btn-primary mt-4 px-4 py-2"
        >
          Browse Available Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="relative rounded-xl overflow-hidden shadow-elegant">
              <img
                src={
                  room.images?.length > 0
                    ? room.images[currentImageIndex]
                    : "/placeholder-room.jpg"
                }
                alt={`${room.name} - view ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-room.jpg";
                }}
              />

              {room.images?.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full ${
                          currentImageIndex === index
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {room.images?.length > 1 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {room.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`rounded-lg overflow-hidden ${
                      currentImageIndex === index
                        ? "ring-2 ring-primary-500"
                        : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${room.name} thumbnail ${index + 1}`}
                      className="w-full h-20 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-room.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Room Details */}
          <div className="lg:col-span-1 order-first lg:order-none">
            <h1 className="text-3xl font-display mb-4">{room.name}</h1>

            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center">
                <User size={18} className="text-primary-600 mr-2" />
                <span>
                  {room.capacity} {room.capacity === 1 ? "Guest" : "Guests"}
                </span>
              </div>
              {room.size && (
                <div className="flex items-center">
                  <Maximize size={18} className="text-primary-600 mr-2" />
                  <span>{room.size} m²</span>
                </div>
              )}
              {room.bedType && (
                <div className="flex items-center">
                  <Bed size={18} className="text-primary-600 mr-2" />
                  <span>{room.bedType}</span>
                </div>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-gray-700">{room.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities?.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    {amenityIcons[amenity] || (
                      <span className="text-primary-600 mr-2">•</span>
                    )}
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-elegant p-6 sticky top-24">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-semibold text-primary-600">
                    {formatPrice(room.price)}
                  </span>
                  <span className="text-gray-500">per night</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in / Check-out
                  </label>
                  <DateRangePicker
                    onRangeChange={handleDateRangeChange}
                    minDate={new Date()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map(
                      (num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {dateRange && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">
                        {formatPrice(room.price)} x {nights}{" "}
                        {nights === 1 ? "night" : "nights"}
                      </span>
                      <span>{formatPrice(room.price * nights)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Service fee</span>
                      <span>{formatPrice(nights * 10)}</span>
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total + nights * 10)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBookNow}
                  disabled={!dateRange || isBooking}
                  className="w-full btn-primary py-3 rounded-lg flex items-center justify-center disabled:opacity-50"
                >
                  {isBooking ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : isAuthenticated ? (
                    "Book Now"
                  ) : (
                    "Sign In to Book"
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  You won't be charged yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
