import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, 
  Eye, FilterX, ArrowUpDown, Loader2
} from 'lucide-react';
import { roomsAPI } from '../../services/api';
import { formatPrice } from '../../lib/utils';

interface Room {
  id: number;
  name: string;
  roomType: string;
  price: number;
  capacity: number;
  images: string[];
  description: string;
  amenities: string[];
  featured: boolean;
  status: 'available' | 'maintenance' | 'booked';
}

const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await roomsAPI.getAll();
      setRooms(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rooms. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomsAPI.delete(id);
        setRooms(rooms.filter(room => room.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete room. Please try again later.');
      }
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      const roomData = {
        name: formData.get('name') as string,
        roomType: formData.get('roomType') as string,
        price: Number(formData.get('price')),
        capacity: Number(formData.get('capacity')),
        description: formData.get('description') as string,
        amenities: (formData.get('amenities') as string).split(',').map(a => a.trim()),
        featured: formData.get('featured') === 'true',
        status: formData.get('status') as Room['status'],
        images: (formData.get('images') as string).split(',').map(i => i.trim()),
      };

      if (selectedRoom) {
        await roomsAPI.update(selectedRoom.id, roomData);
        setRooms(rooms.map(room => 
          room.id === selectedRoom.id ? { ...room, ...roomData } : room
        ));
      } else {
        const response = await roomsAPI.create(roomData);
        setRooms([...rooms, response.data]);
      }

      setIsModalOpen(false);
      setSelectedRoom(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save room. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortField(null);
  };

  // Filter and sort rooms
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (!sortField) return 0;
    
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = a.roomType.localeCompare(b.roomType);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'capacity':
        comparison = a.capacity - b.capacity;
        break;
      default:
        return 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="py-24">
        <div className="container-custom">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
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

  return (
    <div className="py-24">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display">Manage Rooms</h1>
          <button 
            onClick={() => {
              setSelectedRoom(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add New Room
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-elegant p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={resetFilters}
                className="flex items-center text-gray-600 hover:text-primary-600 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FilterX size={18} className="mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Room Name
                      {sortField === 'name' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('type')}>
                    <div className="flex items-center">
                      Type
                      {sortField === 'type' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('price')}>
                    <div className="flex items-center">
                      Price
                      {sortField === 'price' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('capacity')}>
                    <div className="flex items-center">
                      Capacity
                      {sortField === 'capacity' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Featured</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedRooms.map(room => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={room.images} 
                          alt={room.name}
                          className="w-10 h-10 object-cover rounded-lg mr-3"
                        />
                        <span>{room.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{room.roomType}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(room.price)}</td>
                    <td className="px-6 py-4">{room.capacity} {room.capacity > 1 ? 'persons' : 'person'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        room.status === 'available' ? 'bg-green-100 text-green-800' :
                        room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {room.featured ? (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Featured
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-yellow-600 hover:text-yellow-800"
                          onClick={() => handleEdit(room)}
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(room.id)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedRooms.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500">No rooms found. Try adjusting your search.</p>
            </div>
          )}

          <div className="px-6 py-4 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {sortedRooms.length} of {rooms.length} rooms
            </p>
          </div>
        </div>
      </div>

      {/* Room Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(new FormData(e.currentTarget));
              }}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium mb-4">
                    {selectedRoom ? 'Edit Room' : 'Add New Room'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Room Name</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={selectedRoom?.name}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Room Type</label>
                      <select
                        name="roomType"
                        defaultValue={selectedRoom?.roomType}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="standard">Standard</option>
                        <option value="deluxe">Deluxe</option>
                        <option value="suite">Suite</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                      <input
                        type="number"
                        name="price"
                        defaultValue={selectedRoom?.price}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity</label>
                      <input
                        type="number"
                        name="capacity"
                        defaultValue={selectedRoom?.capacity}
                        required
                        min="1"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        defaultValue={selectedRoom?.description}
                        required
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amenities (comma-separated)</label>
                      <input
                        type="text"
                        name="amenities"
                        defaultValue={selectedRoom?.amenities}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Images (comma-separated URLs)</label>
                      <input
                        type="text"
                        name="images"
                        defaultValue={selectedRoom?.images}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        defaultValue={selectedRoom?.status || 'available'}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="available">Available</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="booked">Booked</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        defaultChecked={selectedRoom?.featured}
                        value="true"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Featured Room
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Saving...
                      </>
                    ) : (
                      'Save Room'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedRoom(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;