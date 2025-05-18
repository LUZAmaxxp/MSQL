import Hero from '../components/home/Hero';
import FeaturedRooms from '../components/home/FeaturedRooms';
import AboutSection from '../components/home/AboutSection';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <AboutSection />
      <FeaturedRooms />
    </div>
  );
};

export default HomePage;