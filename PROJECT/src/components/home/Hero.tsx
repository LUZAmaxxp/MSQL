import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"
          alt="Luxury hotel view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Hero Content */}
      <div className="container-custom relative z-10 text-white">
        <div className="max-w-3xl animate-fade-in">
          <div className="mb-4">
            <div className="inline-block border-b-2 border-primary-400 pb-1">
              <h3 className="text-lg font-light tracking-wide">WELCOME TO AZURE HAVEN</h3>
            </div>
          </div>
          <h1 className="mb-6 text-5xl md:text-6xl font-display font-bold leading-tight">
            Experience Luxury & Comfort
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100">
            Indulge in an unforgettable stay at our premium hotel with breathtaking views, exquisite dining, and impeccable service.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/rooms"
              className="btn-primary px-8 py-3 rounded-full text-md font-medium flex items-center justify-center"
            >
              Explore Rooms
              <ChevronRight size={18} className="ml-1" />
            </Link>
            <a
              href="#about"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-full text-md font-medium transition-colors duration-300 flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-white text-sm mb-2">Scroll Down</span>
        <div className="w-1 h-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;