import { useState, useEffect } from 'react';
import { Shield, Map, Clock, Award } from 'lucide-react';

const AboutSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('about');
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
    <section id="about" className="section">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`relative ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <div className="relative z-10 overflow-hidden rounded-lg shadow-elegant">
              <img
                src="https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg"
                alt="Hotel exterior"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-primary-100 rounded-full -z-10"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 md:w-40 md:h-40 bg-accent-100 rounded-full -z-10"></div>
          </div>

          <div className={isVisible ? 'animate-slide-up' : 'opacity-0'} style={{ animationDelay: '150ms' }}>
            <span className="inline-block text-primary-600 font-medium mb-2">ABOUT US</span>
            <h2 className="text-3xl md:text-4xl font-display mb-6">Luxury Experience Like No Other</h2>
            <p className="text-gray-600 mb-6">
              Since 2010, Azure Haven has been a sanctuary of luxury and comfort, providing unparalleled hospitality experiences to guests from around the world. Nestled in the heart of a breathtaking coastline, our hotel combines stunning natural beauty with sophisticated elegance.
            </p>
            <p className="text-gray-600 mb-8">
              Our commitment to excellence is reflected in every detail, from the architectural design to the personalized services we offer. Each room is meticulously crafted to provide a perfect blend of modern luxury and comfort, ensuring a memorable stay for every guest.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-primary-100 p-3 rounded-lg mr-4">
                  <Map className="text-primary-600 h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Prime Location</h4>
                  <p className="text-sm text-gray-600">Near all major attractions</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary-100 p-3 rounded-lg mr-4">
                  <Shield className="text-primary-600 h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Safe & Secure</h4>
                  <p className="text-sm text-gray-600">24/7 security services</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary-100 p-3 rounded-lg mr-4">
                  <Clock className="text-primary-600 h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">24/7 Service</h4>
                  <p className="text-sm text-gray-600">Round-the-clock assistance</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary-100 p-3 rounded-lg mr-4">
                  <Award className="text-primary-600 h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Award Winning</h4>
                  <p className="text-sm text-gray-600">Top-rated luxury experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;