import { useState, useEffect } from 'react';
import { roomsAPI } from '../services/api';
import RoomCard from '../components/rooms/RoomCard';
import RoomFilters, { FilterOptions } from '../components/rooms/RoomFilters';

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
  
}

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomsAPI.getAll();
        const roomsData = response.data;
        setRooms(roomsData);
        setFilteredRooms(roomsData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch rooms. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleFilterChange = (filters: FilterOptions) => {
    const filtered = rooms.filter(room => {
      // Filter by room type
      if (filters.type.length > 0 && !filters.type.includes(room.roomType)) {
        return false;
      }

      // Filter by capacity
      if (room.capacity < filters.capacity) {
        return false;
      }

      // Filter by price
      if (room.price < filters.priceRange[0] || room.price > filters.priceRange[1]) {
        return false;
      }

      // Filter by amenities
      if (filters.amenities.length > 0) {
        const roomAmenities = room.amenities ? JSON.parse(room.amenities) : [];
        return filters.amenities.every(amenity => roomAmenities.includes(amenity));
      }

      return true;
    });

    setFilteredRooms(filtered);
  };

  return (
    <div className="py-24">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display mb-4">Our Rooms & Suites</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our collection of elegant accommodations designed for your comfort and relaxation. Each room offers a unique experience with premium amenities.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <RoomFilters onFilterChange={handleFilterChange} roomCount={filteredRooms.length} />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(index => (
              <div key={index} className="bg-white rounded-xl shadow-elegant h-96 animate-pulse">
                <div className="h-60 bg-gray-200 rounded-t-xl"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room, index) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                delay={index * 100}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">No rooms match your filters</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria to find available rooms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;