import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { roomsAPI } from '../services/api';
import RoomDetail from '../components/rooms/RoomDetail';

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

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;
      
      try {
        const response = await roomsAPI.getById(parseInt(id));
        setRoom(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch room details. Please try again later.');
        // If room not found, redirect to 404
        if (err.response?.status === 404) {
          navigate('/404');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="py-24">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-xl mb-4"></div>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 2, 3].map(index => (
                <div key={index} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
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

  if (!room) {
    return null; // We'll redirect to 404 in the useEffect
  }

  return (
    <div className="py-24">
      <div className="container-custom">
        <div className="mb-6">
          <Link to="/rooms" className="flex items-center text-primary-600 hover:text-primary-700">
            <ChevronLeft size={20} />
            <span>Back to Rooms</span>
          </Link>
        </div>
        
        <RoomDetail room={room} />
      </div>
    </div>
  );
};

export default RoomDetailPage;