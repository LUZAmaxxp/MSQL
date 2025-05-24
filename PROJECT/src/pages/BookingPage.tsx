import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate
import axios from "axios"; // Import axios for actual booking API call
import {
  Wifi,
  Car,
  Coffee,
  Utensils,
  Sparkles,
  Clock,
  Check,
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Shield,
  CreditCard
} from "lucide-react"; 

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); 

  const { roomData, checkInDate, checkOutDate, initialSpecialRequests } =
    location.state || {};

  // If no roomData, redirect back or show error
  useEffect(() => {
    if (!roomData) {
      console.warn("No room data provided, redirecting to home or error page.");
      navigate("/"); // Or navigate to a specific error page
      return;
    }
    // Initialize dateRange and formData based on passed data
    if (checkInDate && checkOutDate) {
      setDateRange({
        startDate: new Date(checkInDate),
        endDate: new Date(checkOutDate),
      });
    }
    if (initialSpecialRequests) {
      setFormData((prev) => ({
        ...prev,
        specialRequests: initialSpecialRequests,
      }));
    }
  }, [roomData, checkInDate, checkOutDate, initialSpecialRequests, navigate]);

  // Use the roomData passed from RoomDetailPage
  const [room, setRoom] = useState(roomData);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(""); // Add error state for booking failures
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    guests: 1,
    specialRequests: initialSpecialRequests || "", // Pre-fill special requests
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [dateRange, setDateRange] = useState({
    startDate: checkInDate ? new Date(checkInDate) : new Date(), // Pre-fill check-in
    endDate: checkOutDate ? new Date(checkOutDate) : addDays(new Date(), 3), // Pre-fill check-out
  });

  useEffect(() => {
    // Only simulate loading if room data wasn't already available
    if (!roomData) {
      setTimeout(() => setIsLoading(false), 1500);
    } else {
      setIsLoading(false); // If roomData is already there, no need to load
    }
  }, [roomData]);

  useEffect(() => {
    // Auto-advance image carousel
    if (room && room.images && room.images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [room]); // Depend on 'room' now

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: new Date(value) }));
  };

  const calculateTotal = () => {
    if (!room || !dateRange.startDate || !dateRange.endDate)
      return { nights: 0, total: 0, fees: 0, roomTotal: 0, taxes: 0 };

    const diffTime = Math.abs(
      dateRange.endDate.getTime() - dateRange.startDate.getTime()
    );
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (nights <= 0)
      return { nights: 0, total: 0, fees: 0, roomTotal: 0, taxes: 0 }; // Ensure at least 1 night or handle zero nights

    const roomTotal = nights * room.price;
    const fees = Math.round(roomTotal * 0.12); // 12% service fee
    const taxes = Math.round(roomTotal * 0.08); // 8% taxes

    return { nights, roomTotal, fees, taxes, total: roomTotal + fees + taxes };
  };

  const { nights, roomTotal, fees, taxes, total } = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(""); // Clear previous errors

    try {
      const token = localStorage.getItem("token"); // Get token from localStorage

      if (!token) {
        setError("You must be logged in to make a booking.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        roomId: room.id, // Use the actual room ID from the passed room data
        checkIn: format(dateRange.startDate, "yyyy-MM-dd"),
        checkOut: format(dateRange.endDate, "yyyy-MM-dd"),
        guests: formData.guests,
        specialRequests: formData.specialRequests,
        // In a real app, you would send payment details to a secure payment gateway,
        // not directly to your backend. This is just for demonstration.
        paymentDetails: {
          cardNumber: formData.cardNumber,
          cardName: formData.cardName,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
        },
      };

      const response = await axios.post(
        "http://localhost:5000/api/bookings", 
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Booking successful:", response.data);
      setShowSuccess(true);
      // Optionally clear form data after successful booking
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        guests: 1,
        specialRequests: "",
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
      });
      setDateRange({
        startDate: new Date(),
        endDate: addDays(new Date(), 3),
      });
    } catch (error: any) {
      console.error("Booking error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to make booking. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    if (room && room.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room && room.images && room.images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + room.images.length) % room.images.length
      );
    }
  };

  if (!room) {
    // This state should be handled by the useEffect redirect, but good for initial render.
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600 font-medium">
          No room data found. Redirecting...
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">
            Preparing your luxury experience...
          </p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Check className="text-white w-12 h-12" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-700" />
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Welcome to luxury. Your reservation is confirmed and you'll receive
            details shortly.
          </p>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Room:</span>
                <span className="text-gray-900">{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Guests:</span>
                <span className="text-gray-900">{formData.guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Check-in:</span>
                <span className="text-gray-900">
                  {format(dateRange.startDate, "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Check-out:</span>
                <span className="text-gray-900">
                  {format(dateRange.endDate, "MMM d, yyyy")}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">
                  Total Paid:
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/profile")} // Example: Navigate to user's bookings
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4 mr-2 text-blue-600" />;
      case "parking":
        return <Car className="w-4 h-4 mr-2 text-blue-600" />;
      case "room service":
        return <Coffee className="w-4 h-4 mr-2 text-blue-600" />;
      case "restaurant access":
        return <Utensils className="w-4 h-4 mr-2 text-blue-600" />;
      case "spa access":
        return <Sparkles className="w-4 h-4 mr-2 text-blue-600" />;
      case "concierge":
        return <Clock className="w-4 h-4 mr-2 text-blue-600" />;
      default:
        return <Check className="w-4 h-4 mr-2 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
        <div className="relative h-full">
          {room.images && room.images.length > 0 ? (
            room.images.map((img: string, index: number) => (
              <img
                key={index}
                src={img}
                alt={`${room.name} ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))
          ) : (
            <img
              src="https://via.placeholder.com/1200x600?text=No+Image"
              alt="No room image"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Image Navigation */}
        {room.images &&
          room.images.length > 1 && ( // Only show if more than one image
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

        {/* Hero Content */}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {room.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                  <span className="text-white ml-2 font-semibold">
                    {room.averageRating || "N/A"}
                  </span>
                  <span className="text-white/80">
                    ({room.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center text-white/90 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{room.location || "N/A"}</span>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                {room.description}
              </p>
            </div>
          </div>
        </div>

        {/* Image Indicators */}
        {room.images && room.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {room.images.map((_, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Booking Form */}
          <div className="xl:col-span-2">
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-12">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      activeStep >= step
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {activeStep > step ? <Check className="w-6 h-6" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 mx-4 transition-all duration-300 ${
                        activeStep > step
                          ? "bg-gradient-to-r from-blue-600 to-purple-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <p className="mb-6 p-3 bg-red-100 text-red-700 rounded-md border border-red-300 font-medium animate-fadeIn">
                  {error}
                </p>
              )}
              {/* Step 1: Dates and Guests */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mr-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Select Dates & Guests
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={format(dateRange.startDate, "yyyy-MM-dd")}
                      onChange={(e) =>
                        handleDateChange("startDate", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={format(dateRange.endDate, "yyyy-MM-dd")}
                      onChange={(e) =>
                        handleDateChange("endDate", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Guests
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                    >
                      {Array.from(
                        { length: room.capacity || 1 }, // Default to 1 if capacity is not defined
                        (_, i) => i + 1
                      ).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Guest Details */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mr-4">
                   
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Guest Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                    placeholder="Any special requests or preferences? (Optional)"
                  />
                </div>
              </div>

              {/* Step 3: Payment */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mr-4">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Payment Details
                  </h2>
                  <div className="ml-auto flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4 mr-1" />
                    Secure Payment
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Name as it appears on card"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                        placeholder="MM/YY"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-2xl"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Complete Booking • $${total.toLocaleString()}`
                )}
              </button>
            </form>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Room Details Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20">
                <div className="flex items-start space-x-4 mb-6">
                  <img
                    src={
                      room.images?.[0] || "https://via.placeholder.com/100x100"
                    }
                    alt={room.name}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {room.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{room.roomType}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        ({room.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {room.amenities
                      .slice(0, 6)
                      .map((amenity: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20">
                <h3 className="font-bold text-lg text-gray-900 mb-6">
                  Booking Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Check-in</span>
                    <span className="font-semibold">
                      {format(dateRange.startDate, "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Check-out</span>
                    <span className="font-semibold">
                      {format(dateRange.endDate, "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Guests</span>
                    <span className="font-semibold">{formData.guests}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Room ({nights} nights)
                    </span>
                    <span>${roomTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span>${fees.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes</span>
                    <span>${taxes.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900">
                        Total
                      </span>
                      <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-5 h-5 mr-3 text-green-600" />
                    <span>SSL Encrypted & Secure Payment</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-blue-600" />
                    <span>Instant Confirmation</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-5 h-5 mr-3 text-purple-600" />
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-3">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Our concierge team is available 24/7 to assist with your
                  booking.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-blue-600" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-purple-600" />
                    <span>concierge@luxury.com</span>
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
