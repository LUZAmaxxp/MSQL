import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { roomsAPI } from "../../services/api"; // adjust the import path as needed

interface Room {
  _id: string;
  name: string;
  image: string;
  description: string;
  price: number;
}

const FeaturedRooms: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomsAPI.getAll();
        const topRooms = response.data.slice(0, 3); // limit to 3
        setFeaturedRooms(topRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("featured-rooms");
      if (element) {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="featured-rooms" className="section bg-gray-50">
      <div className="container-custom">
        <div
          className={`text-center mb-12 ${
            isVisible ? "animate-slide-up" : "opacity-0"
          }`}
        >
          <span className="inline-block text-primary-600 font-medium mb-2">
            FEATURED ROOMS
          </span>
          <h2 className="text-3xl md:text-4xl font-display mb-4">
            Our Most Popular Accommodations
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto"></div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            Experience our handpicked selection of exceptional rooms and suites,
            designed for ultimate comfort and luxury during your stay.
          </p>
        </div>

        {/* Rooms List */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${
            isVisible ? "animate-fade-in" : "opacity-0"
          }`}
        >
          {featuredRooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <img
                src={room.images}
                alt={room.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {room.description}
                </p>
                <div className="text-primary-600 font-medium">
                  ${room.price.toFixed(2)} / night
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-12 ${
            isVisible ? "animate-fade-in" : "opacity-0"
          }`}
          style={{ animationDelay: "450ms" }}
        >
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
