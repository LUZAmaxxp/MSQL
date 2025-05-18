import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, User, Home, MoveRight } from 'lucide-react';
import { rooms } from '../../data/rooms';
import { formatPrice } from '../../lib/utils';

const FeaturedRooms: React.FC = () => {
  const [featuredRooms, setFeaturedRooms] = useState(rooms.filter(room => room.featured));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('featured-rooms');
      if (element) {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="featured-rooms" className="section bg-gray-50">
      <div className="container-custom">
        <div className={`text-center mb-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <span className="inline-block text-primary-600 font-medium mb-2">FEATURED ROOMS</span>
          <h2 className="text-3xl md:text-4xl font-display mb-4">Our Most Popular Accommodations</h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto"></div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            Experience our handpicked selection of exceptional rooms and suites, designed for ultimate comfort and luxury during your stay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRooms.map((room, index) => (
            <div 
              key={room.id} 
              className={`card group transition-all duration-300 hover:shadow-elegant-lg transform hover:-translate-y-1 ${
                isVisible ? 'animate-slide-up opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
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
          ))}
        </div>

        <div className={`text-center mt-12 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '450ms' }}>
          <Link
            to="/rooms"
            className="btn-primary px-8 py-3 rounded-full inline-flex items-center"
          >
            View All Rooms
            <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRooms;