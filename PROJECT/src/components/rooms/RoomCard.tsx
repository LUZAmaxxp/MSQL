import { Link } from "react-router-dom";
import { User, MoveRight } from "lucide-react";

// Define the Room interface to match the API response format
export interface Room {
  id: number;
  name: string;
  shortDescription?: string;
  description?: string;
  price: number;
  capacity: number;
  type: string;
  images: string[];
  imageUrl?: string; // For backwards compatibility with API
  rating?: number;
  numReviews?: number;
  amenities?: string[];
}

// Helper function to format price to currency
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
};

interface RoomCardProps {
  room: Room;
  delay?: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, delay = 0 }) => {
  // Handle cases where API returns imageUrl instead of images array
  const roomImage =
    room.images && room.images.length > 0
      ? room.images
      : room.imageUrl || "/placeholder-room.jpg";

  return (
    <div
      className="card group transition-all duration-300 hover:shadow-elegant-lg transform hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative overflow-hidden">
        <img
          src={roomImage}
          alt={room.name}
          className="w-full h-60 object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-display mb-2">{room.name}</h3>
        <p className="text-gray-600 text-sm mb-4">
          {room.shortDescription ||
            room.description?.substring(0, 100) + "..." ||
            "Comfortable and stylish accommodation"}
        </p>

        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center text-gray-600 text-sm">
            <User size={16} className="mr-1" />
            <span>
              {room.capacity} {room.capacity > 1 ? "Guests" : "Guest"}
            </span>
          </div>

          {room.rating && (
            <div className="flex items-center text-yellow-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-sm">{room.rating.toFixed(1)}</span>
              {room.numReviews && (
                <span className="text-gray-500 text-xs ml-1">
                  ({room.numReviews})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-primary-600 font-semibold">
            {formatPrice(room.price)}
            <span className="text-gray-500 font-normal text-sm"> / night</span>
          </div>
          <Link
            to={`/rooms/${room.id}`}
            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View Details
            <MoveRight
              size={16}
              className="ml-1 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
