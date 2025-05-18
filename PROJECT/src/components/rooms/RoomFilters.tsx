import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Room } from '../../data/rooms';

interface RoomFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  roomCount: number;
}

export interface FilterOptions {
  type: string[];
  capacity: number;
  priceRange: [number, number];
  amenities: string[];
}

const RoomFilters: React.FC<RoomFiltersProps> = ({ onFilterChange, roomCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    capacity: 1,
    priceRange: [0, 1000],
    amenities: [],
  });

  const handleRoomTypeChange = (type: string) => {
    const updatedTypes = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type];
    
    const updatedFilters = { ...filters, type: updatedTypes };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleCapacityChange = (capacity: number) => {
    const updatedFilters = { ...filters, capacity };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const updatedFilters = { 
      ...filters, 
      priceRange: [filters.priceRange[0], value]
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleAmenityChange = (amenity: string) => {
    const updatedAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    const updatedFilters = { ...filters, amenities: updatedAmenities };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      type: [],
      capacity: 1,
      priceRange: [0, 1000],
      amenities: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const roomTypes = ['standard', 'deluxe', 'suite', 'villa'];
  const amenitiesList = [
    'Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini-bar', 
    'Room Service', 'King Size Bed', 'Private Bathroom', 'Sea View', 'Safe', 'Balcony'
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">
          {roomCount} {roomCount === 1 ? 'Room' : 'Rooms'} Available
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center text-sm font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
        >
          <Filter size={16} className="mr-2" />
          {isOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white p-6 rounded-lg shadow-elegant mb-6 animate-slide-down">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
            <button 
              onClick={resetFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Room Type */}
            <div>
              <h4 className="font-medium mb-3">Room Type</h4>
              <div className="space-y-2">
                {roomTypes.map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={() => handleRoomTypeChange(type)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Capacity */}
            <div>
              <h4 className="font-medium mb-3">Guests</h4>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(num => (
                  <label key={num} className="flex items-center">
                    <input
                      type="radio"
                      name="capacity"
                      checked={filters.capacity === num}
                      onChange={() => handleCapacityChange(num)}
                      className="mr-2"
                    />
                    <span className="text-sm">{num} {num === 1 ? 'Guest' : 'Guests'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-medium mb-3">Price Range</h4>
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[1]}
                onChange={handlePriceChange}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm">${filters.priceRange[0]}</span>
                <span className="text-sm">${filters.priceRange[1]}</span>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="font-medium mb-3">Amenities</h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="mr-2"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.type.length > 0 || filters.amenities.length > 0 || filters.capacity > 1 || filters.priceRange[1] < 1000) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.type.map(type => (
                  <span 
                    key={type} 
                    className="inline-flex items-center bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                    <button 
                      onClick={() => handleRoomTypeChange(type)}
                      className="ml-1"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                
                {filters.capacity > 1 && (
                  <span className="inline-flex items-center bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full">
                    {filters.capacity} Guests
                    <button 
                      onClick={() => handleCapacityChange(1)}
                      className="ml-1"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {filters.priceRange[1] < 1000 && (
                  <span className="inline-flex items-center bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full">
                    Max ${filters.priceRange[1]}
                    <button 
                      onClick={() => {
                        const updatedFilters = { ...filters, priceRange: [0, 1000] };
                        setFilters(updatedFilters);
                        onFilterChange(updatedFilters);
                      }}
                      className="ml-1"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {filters.amenities.map(amenity => (
                  <span 
                    key={amenity} 
                    className="inline-flex items-center bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full"
                  >
                    {amenity}
                    <button 
                      onClick={() => handleAmenityChange(amenity)}
                      className="ml-1"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomFilters;