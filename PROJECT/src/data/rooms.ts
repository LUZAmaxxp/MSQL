import { getRandomId } from '../lib/utils';

export type Amenity = {
  id: string;
  name: string;
  icon: string;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  capacity: number;
  images: string[];
  amenities: string[];
  size: number;
  bedType: string;
  featured: boolean;
  type: 'standard' | 'deluxe' | 'suite' | 'villa';
};

export const amenities: Amenity[] = [
  {
    id: getRandomId(),
    name: 'Free Wi-Fi',
    icon: 'wifi',
  },
  {
    id: getRandomId(),
    name: 'Air Conditioning',
    icon: 'wind',
  },
  {
    id: getRandomId(),
    name: 'Flat-screen TV',
    icon: 'tv',
  },
  {
    id: getRandomId(),
    name: 'Mini-bar',
    icon: 'wine',
  },
  {
    id: getRandomId(),
    name: 'Room Service',
    icon: 'utensils',
  },
  {
    id: getRandomId(),
    name: 'King Size Bed',
    icon: 'bed',
  },
  {
    id: getRandomId(),
    name: 'Private Bathroom',
    icon: 'bath',
  },
  {
    id: getRandomId(),
    name: 'Sea View',
    icon: 'mountain-snow',
  },
  {
    id: getRandomId(),
    name: 'Safe',
    icon: 'shield',
  },
  {
    id: getRandomId(),
    name: 'Balcony',
    icon: 'layout',
  },
];

export const rooms: Room[] = [
  {
    id: '1',
    name: 'Deluxe Ocean View',
    description: 'Our Deluxe Ocean View rooms offer a spacious retreat with breathtaking views of the azure waters. Each room features elegant furnishings, a plush king-size bed, and a private balcony where you can enjoy the spectacular sunsets. The marble bathroom includes a rain shower and deep soaking tub. Modern amenities ensure comfort throughout your stay, making this the perfect choice for a luxurious getaway.',
    shortDescription: 'Spacious room with breathtaking ocean views and luxury amenities.',
    price: 349,
    capacity: 2,
    images: [
      'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg',
    ],
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini-bar', 'Sea View', 'King Size Bed', 'Private Bathroom', 'Balcony'],
    size: 45,
    bedType: 'King',
    featured: true,
    type: 'deluxe',
  },
  {
    id: '2',
    name: 'Premium Garden Suite',
    description: 'Nestled within our lush tropical gardens, the Premium Garden Suite offers a tranquil escape with direct access to our pristine gardens. The suite features a separate living area, bedroom with a premium king-size bed, and a luxurious bathroom with a walk-in shower and freestanding bathtub. The private terrace is perfect for enjoying your morning coffee or an evening cocktail surrounded by the soothing sounds of nature.',
    shortDescription: 'Peaceful suite with garden views and separate living area.',
    price: 459,
    capacity: 3,
    images: [
      'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg',
      'https://images.pexels.com/photos/210265/pexels-photo-210265.jpeg',
      'https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg',
    ],
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini-bar', 'Room Service', 'King Size Bed', 'Private Bathroom', 'Safe'],
    size: 65,
    bedType: 'King',
    featured: true,
    type: 'suite',
  },
  {
    id: '3',
    name: 'Classic Mountain View',
    description: 'Experience comfort and style in our Classic Mountain View rooms with stunning vistas of the majestic mountains. These well-appointed rooms feature a cozy queen-size bed, a work desk, and a comfortable seating area. The modern bathroom includes a shower with premium amenities. Ideal for both leisure and business travelers seeking a peaceful retreat with a view.',
    shortDescription: 'Comfortable room with beautiful mountain scenery.',
    price: 249,
    capacity: 2,
    images: [
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg',
      'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
    ],
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Safe', 'Private Bathroom'],
    size: 32,
    bedType: 'Queen',
    featured: false,
    type: 'standard',
  },
  {
    id: '4',
    name: 'Luxury Beachfront Villa',
    description: 'The ultimate indulgence, our Luxury Beachfront Villa offers unparalleled privacy and direct access to the pristine beach. This expansive villa features a master bedroom with a king-size bed, a separate living room, dining area, and a fully equipped kitchenette. The spacious bathroom includes a large soaking tub and separate rain shower. Step outside to your private terrace with a plunge pool overlooking the ocean, the perfect spot for unforgettable moments.',
    shortDescription: 'Exclusive villa with private pool and direct beach access.',
    price: 999,
    capacity: 4,
    images: [
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg',
    ],
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini-bar', 'Room Service', 'King Size Bed', 'Private Bathroom', 'Sea View', 'Safe', 'Balcony'],
    size: 120,
    bedType: 'King',
    featured: true,
    type: 'villa',
  },
  {
    id: '5',
    name: 'Standard Comfort Room',
    description: 'Our Standard Comfort Rooms provide a cozy and affordable option without compromising on quality. Each room features a comfortable queen-size bed, a well-designed workspace, and a modern bathroom with a shower. These rooms are perfect for travelers looking for comfort and value during their stay.',
    shortDescription: 'Cozy and affordable room with essential amenities.',
    price: 199,
    capacity: 2,
    images: [
      'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg',
      'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg',
    ],
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Private Bathroom'],
    size: 28,
    bedType: 'Queen',
    featured: false,
    type: 'standard',
  },
  {
    id: '6',
    name: 'Executive Business Suite',
    description: 'Designed with the business traveler in mind, our Executive Business Suite offers a sophisticated environment with separate living and working areas. The bedroom features a luxurious king-size bed ensuring a restful night\'s sleep, while the spacious living room includes a comfortable sofa, a dining table, and a fully equipped work desk. The marble bathroom comes with premium amenities, a rain shower, and a deep soaking tub.',
    shortDescription: 'Sophisticated suite with separate work and living spaces.',
    price: 549,
    capacity: 2,
    images: [
      'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/260928/pexels-photo-260928.jpeg',
    ],
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini-bar', 'Room Service', 'King Size Bed', 'Private Bathroom', 'Safe'],
    size: 70,
    bedType: 'King',
    featured: false,
    type: 'suite',
  },
];