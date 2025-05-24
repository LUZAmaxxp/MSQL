import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Wifi,
  Car,
  Coffee,
  Utensils,
  Sparkles,
  Clock,
  Check,
  Star,
  MapPin,
  Users,
} from "lucide-react"; // Import necessary icons

const RoomDetailPage = () => {
  const { roomid } = useParams();
  const roomId = Number(roomid);
  const navigate = useNavigate(); // Initialize useNavigate

  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/rooms/${roomId}`
        );
        setRoom(response.data);
      } catch (err) {
        console.error("Failed to fetch room details", err);
        setError("Failed to load room details.");
      }
    };

    if (!isNaN(roomId)) {
      fetchRoomDetails();
    } else {
      setError("Invalid room ID.");
    }
  }, [roomId]);

  const handleBookNowClick = () => {
    if (room) {
      // Navigate to the BookingPage, passing the room data
      navigate(`/booking/${roomId}`, {
        state: {
          roomData: room,
        },
      });
    } else {
      setError("Room details not loaded yet. Please try again.");
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-5 h-5 mr-2 text-blue-600" />;
      case "parking":
        return <Car className="w-5 h-5 mr-2 text-blue-600" />;
      case "room service":
        return <Coffee className="w-5 h-5 mr-2 text-blue-600" />;
      case "restaurant access":
        return <Utensils className="w-5 h-5 mr-2 text-blue-600" />;
      case "spa access":
        return <Sparkles className="w-5 h-5 mr-2 text-blue-600" />;
      case "concierge":
        return <Clock className="w-5 h-5 mr-2 text-blue-600" />;
      default:
        return <Check className="w-5 h-5 mr-2 text-blue-600" />; // Generic check for other amenities
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-16 p-6 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight">
        Room Details
      </h2>

      {error && (
        <p
          className="mb-6 p-3 bg-red-100 text-red-700 rounded-md border border-red-300 font-medium animate-fadeIn"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Full Width Room Info */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow duration-300">
        {room ? (
          <>
            <div className="overflow-hidden rounded-t-xl">
              <img
                src={room.images?.[0] || "https://via.placeholder.com/1200x500"} // Use first image or placeholder
                alt={room.name}
                className="w-full h-96 object-cover transform transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-4xl font-semibold mb-4 text-gray-900">
                    {room.name}
                  </h3>
                  <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                    {room.description}
                  </p>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-3xl font-semibold text-blue-600">
                      ${room.price}{" "}
                      <span className="text-gray-500 font-normal text-xl">
                        / night
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={handleBookNowClick}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-indigo-600 hover:to-blue-600 shadow-lg transition-all duration-300 text-lg"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-8">
                <Star className="w-6 h-6 text-yellow-400 fill-current mr-2" />
                <span className="font-semibold text-lg">
                  {room.averageRating || "N/A"}
                </span>
                <span className="text-base ml-2">
                  ({room.reviewCount || 0} reviews)
                </span>
                <MapPin className="w-6 h-6 ml-8 mr-2 text-gray-500" />
                <span className="text-base">{room.location || "N/A"}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Amenities Section */}
                {room.amenities && room.amenities.length > 0 && (
                  <div>
                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">
                      Amenities
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                      {room.amenities.map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center">
                          {getAmenityIcon(amenity)}
                          <span className="text-base">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Information */}
                <div>
                  <h4 className="text-2xl font-semibold mb-4 text-gray-800">
                    Room Information
                  </h4>
                  <div className="space-y-4 text-gray-700">
                    <p className="flex items-center">
                      <Users className="w-6 h-6 mr-3 text-purple-600" />
                      <span className="text-base">Capacity: </span>
                      <span className="font-semibold ml-2 text-base">
                        {room.capacity} Guests
                      </span>
                    </p>
                    <p className="flex items-center">
                      <Clock className="w-6 h-6 mr-3 text-teal-600" />
                      <span className="text-base">Room Type: </span>
                      <span className="font-semibold ml-2 text-base">
                        {room.roomType || "Standard"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">Room ID: {roomId}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="p-8 text-center text-gray-500 animate-pulse text-lg">
            Loading room details...
          </p>
        )}
      </div>
    </div>
  );
};

export default RoomDetailPage;
