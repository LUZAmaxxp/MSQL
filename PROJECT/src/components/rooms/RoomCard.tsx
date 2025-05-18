import { Link } from 'react-router-dom';
import { User, Home, MoveRight } from 'lucide-react';
import { Room } from '../../data/rooms';
import { formatPrice } from '../../lib/utils';

interface RoomCardProps {
  room: Room;
  delay?: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, delay = 0 }) => {
  return (
    <div 
      className="card group transition-all duration-300 hover:shadow-elegant-lg transform hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative overflow-hidden">
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-60 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white py-1 px-3 rounded-full text-sm font-medium text-primary-700">
          {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-display mb-2">{room.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{room.shortDescription}</p>
        
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center text-gray-600 text-sm">
            <User size={16} className="mr-1" />
            <span>{room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Home size={16} className="mr-1" />
            <span>{room.size} m²</span>
          </div>
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
            <MoveRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;