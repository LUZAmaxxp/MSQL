import { useState } from "react";
import {
  Calendar,
  User,
  Maximize,
  Bed,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Room, Amenity, amenities } from "../../data/rooms";
import { formatPrice } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import DateRangePicker from "../ui/DateRangePicker";
import { bookingsAPI } from "../../services/api"; // Adjust this import path as needed


interface RoomDetailProps {
  room: Room;
}

const RoomDetail: React.FC<RoomDetailProps> = ({ room }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? room.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === room.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range);
  };

  const calculateTotalPrice = () => {
    if (!dateRange) return { nights: 0, total: 0 };

    const diffTime = Math.abs(
      dateRange.endDate.getTime() - dateRange.startDate.getTime()
    );
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const total = nights * room.price;

    return { nights, total };
  };

  const { nights, total } = calculateTotalPrice();

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!dateRange) {
      toast.error("Please select check-in and check-out dates.");
      return;
    }

    try {
      setIsBooking(true);

      const bookingData = {
        roomId: room.id,
        checkIn: dateRange.startDate,
        checkOut: dateRange.endDate,
        guests,
      };

      await bookingsAPI.create(bookingData);

      toast.success("Booking successful!");
      navigate("/bookings/my-bookings"); // Adjust as needed
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const roomAmenities = amenities.filter((amenity) =>
    room.amenities.includes(amenity.name)
  );

  return (
    <div className="py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="relative rounded-xl overflow-hidden shadow-elegant">
              <img
                src={room.images[currentImageIndex]}
                alt={`${room.name} - view ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover"
              />

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
                      currentImageIndex === index ? "bg-white" : "bg-white/50"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              {room.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`rounded-lg overflow-hidden ${
                    currentImageIndex === index ? "ring-2 ring-primary-500" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt={`${room.name} thumbnail ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Room Details */}
            <div className="mt-8">
              <h1 className="text-3xl font-display mb-4">{room.name}</h1>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center">
                  <User size={18} className="text-primary-600 mr-2" />
                  <span>{room.capacity} Guests</span>
                </div>
                <div className="flex items-center">
                  <Maximize size={18} className="text-primary-600 mr-2" />
                  <span>{room.size} m²</span>
                </div>
                <div className="flex items-center">
                  <Bed size={18} className="text-primary-600 mr-2" />
                  <span>{room.bedType} Bed</span>
                </div>
              </div>

              <div className="prose max-w-none mb-8">
                <p className="text-gray-700">{room.description}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {roomAmenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-primary-600 mr-2">
                        <span className="w-5 h-5 flex items-center justify-center">
                          {amenity.icon[0].toUpperCase()}
                        </span>
                      </span>
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  ))}
                </div>
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
                  <DateRangePicker onRangeChange={handleDateRangeChange} />
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
                        {formatPrice(room.price)} x {nights} nights
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
                  className="w-full btn-primary py-3 rounded-lg flex items-center justify-center disabled:opacity-50"
                  disabled={!dateRange || isBooking}
                >
                  {isBooking
                    ? "Booking..."
                    : isAuthenticated
                    ? "Book Now"
                    : "Sign In to Book"}
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

export default RoomDetail;
